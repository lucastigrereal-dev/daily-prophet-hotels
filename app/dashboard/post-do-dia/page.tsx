'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Hook {
  id: string
  hook: string
  tema: string
  formato: string
  objetivo: string
}

interface Benchmark {
  id: string
  hook: string
  legenda_completa: string
  tema: string
  formato: string
  qualidade_score: number
  hashtags: string
  cta: string
}

interface Hotel {
  id: string
  nome: string
  tipo: string
}

const TEMAS_POR_DIA = [
  'experiencia', 'cafe_manha', 'piscina', 'quarto', 'lazer',
  'destino', 'gastronomia', 'natureza', 'romance', 'familia',
]

export default function PostDoDiaPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [hookDia, setHookDia] = useState<Hook | null>(null)
  const [benchmarkDia, setBenchmarkDia] = useState<Benchmark | null>(null)
  const [hashtagsDia, setHashtagsDia] = useState<string[]>([])
  const [copiado, setCopiado] = useState<string | null>(null)

  const diaDoAno = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const temaHoje = TEMAS_POR_DIA[diaDoAno % TEMAS_POR_DIA.length]

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: hoteisData } = await supabase
      .from('hotels')
      .select('id, nome, tipo')
      .eq('status', 'ativo')
      .limit(1)
      .single()

    setHotel(hoteisData || null)

    const [{ data: hooksData }, { data: benchData }, { data: hashData }] = await Promise.all([
      supabase
        .from('hooks')
        .select('id, hook, tema, formato, objetivo')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('benchmarks_posts')
        .select('id, hook, legenda_completa, tema, formato, qualidade_score, hashtags, cta')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(50),
      supabase
        .from('hashtag_combos')
        .select('hashtags')
        .limit(20),
    ])

    const hooks = hooksData || []
    const benchmarks = benchData || []

    // Seleciona hook do dia baseado no dia do ano (determinístico)
    const hookSeed = diaDoAno % Math.max(hooks.length, 1)
    setHookDia(hooks[hookSeed] || hooks[0] || null)

    // Benchmark do dia
    const benchSeed = (diaDoAno * 3) % Math.max(benchmarks.length, 1)
    setBenchmarkDia(benchmarks[benchSeed] || benchmarks[0] || null)

    // Hashtags
    const hashCombos = hashData || []
    if (hashCombos.length > 0) {
      const combo = hashCombos[diaDoAno % hashCombos.length]
      const tags = typeof combo.hashtags === 'string'
        ? combo.hashtags.split(/[\s,]+/).filter(Boolean)
        : Array.isArray(combo.hashtags) ? combo.hashtags : []
      setHashtagsDia(tags.slice(0, 15))
    }

    setLoading(false)
  }

  async function novoPost() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    const { data: hooksData } = await supabase.from('hooks').select('id, hook, tema, formato, objetivo').limit(200)
    const { data: benchData } = await supabase
      .from('benchmarks_posts')
      .select('id, hook, legenda_completa, tema, formato, qualidade_score, hashtags, cta')
      .eq('ativo', true)
      .order('qualidade_score', { ascending: false })
      .limit(100)

    const hooks = hooksData || []
    const benchmarks = benchData || []
    const i = Math.floor(Math.random() * hooks.length)
    const j = Math.floor(Math.random() * Math.min(benchmarks.length, 20))
    setHookDia(hooks[i] || null)
    setBenchmarkDia(benchmarks[j] || null)
    setLoading(false)
    toast.success('Novo post sugerido!')
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    toast.success('Copiado!')
    setTimeout(() => setCopiado(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  const legendaCompleta = benchmarkDia?.legenda_completa || hookDia?.hook || ''
  const ctaTexto = benchmarkDia?.cta || 'Salve esse post para nao perder!'
  const postCompleto = `${hookDia?.hook || ''}\n\n${legendaCompleta}\n\n${ctaTexto}\n\n${hashtagsDia.join(' ')}`

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Post do Dia</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {hotel && ` — ${hotel.nome}`}
          </p>
        </div>
        <button
          onClick={novoPost}
          className="px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1A1D26] text-sm font-medium rounded-lg transition-colors"
        >
          Novo Post
        </button>
      </div>

      {/* Tema do dia */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#9CA3AF]">Tema de hoje:</span>
        <span className="text-xs px-2 py-0.5 bg-[#FFF8E7] text-[#B8860B] rounded-full font-medium capitalize">{temaHoje.replace('_', ' ')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Hook */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Hook / Abertura</p>
            <button
              onClick={() => hookDia && copiar(hookDia.hook, 'hook')}
              className={`text-xs px-2 py-0.5 rounded ${copiado === 'hook' ? 'bg-emerald-100 text-emerald-700' : 'text-[#B8860B] hover:bg-[#FFF8E7]'}`}
            >
              {copiado === 'hook' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className="text-sm text-[#1A1D26] leading-relaxed font-medium">{hookDia?.hook || 'Nenhum hook encontrado'}</p>
          {hookDia?.tema && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-[#EFF6FF] text-blue-700 rounded-full">{hookDia.tema}</span>
          )}
        </div>

        {/* Legenda */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Legenda</p>
            <button
              onClick={() => copiar(legendaCompleta, 'legenda')}
              className={`text-xs px-2 py-0.5 rounded ${copiado === 'legenda' ? 'bg-emerald-100 text-emerald-700' : 'text-[#B8860B] hover:bg-[#FFF8E7]'}`}
            >
              {copiado === 'legenda' ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p className="text-sm text-[#1A1D26] leading-relaxed line-clamp-6">
            {legendaCompleta || 'Nenhuma legenda disponivel'}
          </p>
          {benchmarkDia?.formato && (
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-[#ECFDF5] text-emerald-700 rounded-full">{benchmarkDia.formato}</span>
          )}
        </div>

        {/* CTA + Hashtags */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">CTA</p>
            <p className="text-sm text-[#1A1D26] font-medium">{ctaTexto}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2">Hashtags</p>
            <div className="flex flex-wrap gap-1">
              {hashtagsDia.length > 0 ? hashtagsDia.map((h, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">{h.startsWith('#') ? h : `#${h}`}</span>
              )) : (
                <span className="text-xs text-[#9CA3AF]">#hotelaria #turismo #viagem #hospedagem #brasil</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Post completo para copiar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1A1D26]">Post Completo</h2>
          <button
            onClick={() => copiar(postCompleto, 'completo')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              copiado === 'completo'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-[#B8860B] text-white hover:brightness-110'
            }`}
          >
            {copiado === 'completo' ? 'Copiado!' : 'Copiar Post Completo'}
          </button>
        </div>
        <div className="bg-[#F8F9FB] rounded-xl p-4">
          <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed">{postCompleto}</pre>
        </div>
      </div>

      {/* Benchmark de apoio */}
      {benchmarkDia && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">Benchmark de Apoio</p>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-[#1A1D26]">{benchmarkDia.hook}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">{benchmarkDia.tema}</span>
                <span className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">{benchmarkDia.formato}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#B8860B]">{benchmarkDia.qualidade_score}</p>
              <p className="text-xs text-[#9CA3AF]">score</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
