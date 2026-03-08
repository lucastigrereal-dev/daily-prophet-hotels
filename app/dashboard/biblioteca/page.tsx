'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  TEMAS, TEMA_LABEL, FORMATOS, FORMATO_LABEL,
  PUBLICOS, PUBLICO_LABEL, OBJETIVOS, OBJETIVO_LABEL,
  SAZONALIDADES, SAZONALIDADE_LABEL, labelFor,
} from '@/lib/content/taxonomy'

type Tab = 'hooks' | 'legendas' | 'hashtags'

interface Hook {
  id: string
  hook: string
  tema: string | null
  formato: string | null
  objetivo: string | null
  publico: string | null
  sazonalidade: string | null
  score_qualidade: number | null
}

interface Benchmark {
  id: string
  hook: string
  legenda_completa: string
  tema: string | null
  formato: string | null
  publico: string | null
  objetivo: string | null
  sazonalidade: string | null
  qualidade_score: number
  hashtags: string
  cta: string | null
}

interface HashtagCombo {
  id: string
  nome: string
  hashtags: string | string[]
  tema: string | null
  objetivo: string | null
  publico: string | null
  sazonalidade: string | null
}

export default function BibliotecaPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('hooks')
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')
  const [filtroTema, setFiltroTema] = useState('')
  const [filtroObjetivo, setFiltroObjetivo] = useState('')
  const [filtroSazonalidade, setFiltroSazonalidade] = useState('')
  const [hooks, setHooks] = useState<Hook[]>([])
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [hashtags, setHashtags] = useState<HashtagCombo[]>([])
  const [stats, setStats] = useState({ hooks: 0, benchmarks: 0, hashtags: 0 })
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [
      { data: hooksData, count: hooksCount },
      { data: benchData, count: benchCount },
      { data: hashData, count: hashCount },
    ] = await Promise.all([
      supabase.from('hooks').select('id, hook, tema, formato, objetivo, publico, sazonalidade, score_qualidade', { count: 'exact' }).eq('ativo', true).order('score_qualidade', { ascending: false }).limit(200),
      supabase.from('benchmarks_posts').select('id, hook, legenda_completa, tema, formato, publico, objetivo, sazonalidade, qualidade_score, hashtags, cta', { count: 'exact' }).eq('ativo', true).order('qualidade_score', { ascending: false }).limit(200),
      supabase.from('hashtag_combos').select('id, nome, hashtags, tema, objetivo, publico, sazonalidade', { count: 'exact' }).eq('ativo', true).limit(100),
    ])

    setHooks(hooksData || [])
    setBenchmarks(benchData || [])
    setHashtags(hashData || [])
    setStats({ hooks: hooksCount || 0, benchmarks: benchCount || 0, hashtags: hashCount || 0 })
    setLoading(false)
  }

  function copiar(texto: string, id: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    toast.success('Copiado!')
    setTimeout(() => setCopiado(null), 2000)
  }

  function matchFilters(item: { tema?: string | null; formato?: string | null; objetivo?: string | null; sazonalidade?: string | null }) {
    if (filtroFormato && item.formato !== filtroFormato) return false
    if (filtroTema && item.tema !== filtroTema) return false
    if (filtroObjetivo && item.objetivo !== filtroObjetivo) return false
    if (filtroSazonalidade && item.sazonalidade !== filtroSazonalidade) return false
    return true
  }

  const q = busca.toLowerCase()

  const hooksFiltered = hooks.filter(h => {
    const matchBusca = !q || h.hook?.toLowerCase().includes(q) || h.tema?.toLowerCase().includes(q)
    return matchBusca && matchFilters(h)
  })

  const benchFiltered = benchmarks.filter(b => {
    const matchBusca = !q || b.hook?.toLowerCase().includes(q) || b.legenda_completa?.toLowerCase().includes(q) || b.tema?.toLowerCase().includes(q)
    return matchBusca && matchFilters(b)
  })

  const hashFiltered = hashtags.filter(h => {
    const matchBusca = !q || h.nome?.toLowerCase().includes(q) || h.tema?.toLowerCase().includes(q)
    return matchBusca && matchFilters(h)
  })

  function Badge({ label, color }: { label: string | null | undefined; color: string }) {
    if (!label) return null
    return <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label.replace(/_/g, ' ')}</span>
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Biblioteca</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Hooks, legendas e hashtags em um so lugar</p>
      </div>

      {/* Stats tabs */}
      <div className="grid grid-cols-3 gap-3">
        {([['hooks', 'Hooks', stats.hooks], ['legendas', 'Legendas', stats.benchmarks], ['hashtags', 'Hashtags', stats.hashtags]] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-2xl p-4 text-left transition-all ${tab === key ? 'bg-[#B8860B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] hover:shadow-sm'}`}
          >
            <p className={`text-xs uppercase tracking-wide font-medium ${tab === key ? 'text-white/70' : 'text-[#9CA3AF]'}`}>{label}</p>
            <p className={`text-2xl font-bold mt-1 ${tab === key ? 'text-white' : 'text-[#1A1D26]'}`}>{count.toLocaleString('pt-BR')}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 min-w-40 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]"
        />
        {tab !== 'hashtags' && (
          <select value={filtroFormato} onChange={e => setFiltroFormato(e.target.value)}
            className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white">
            <option value="">Formato</option>
            {FORMATOS.map(f => <option key={f} value={f}>{FORMATO_LABEL[f]}</option>)}
          </select>
        )}
        <select value={filtroTema} onChange={e => setFiltroTema(e.target.value)}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white">
          <option value="">Tema</option>
          {TEMAS.map(t => <option key={t} value={t}>{TEMA_LABEL[t]}</option>)}
        </select>
        <select value={filtroObjetivo} onChange={e => setFiltroObjetivo(e.target.value)}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white">
          <option value="">Objetivo</option>
          {OBJETIVOS.map(o => <option key={o} value={o}>{OBJETIVO_LABEL[o]}</option>)}
        </select>
        <select value={filtroSazonalidade} onChange={e => setFiltroSazonalidade(e.target.value)}
          className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white">
          <option value="">Sazonalidade</option>
          {SAZONALIDADES.map(s => <option key={s} value={s}>{SAZONALIDADE_LABEL[s]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Hooks */}
          {tab === 'hooks' && (
            <>
              <p className="text-xs text-[#9CA3AF]">{hooksFiltered.length} resultados</p>
              {hooksFiltered.map(h => (
                <div key={h.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[#1A1D26] leading-relaxed flex-1">{h.hook}</p>
                    <div className="flex flex-col items-end gap-1.5">
                      {h.score_qualidade && <span className="text-sm font-bold text-[#B8860B]">{h.score_qualidade}</span>}
                      <button
                        onClick={() => copiar(h.hook, h.id)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          copiado === h.id ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF8E7] text-[#B8860B] hover:bg-[#B8860B] hover:text-white'
                        }`}
                      >
                        {copiado === h.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Badge label={h.tema} color="bg-[#EFF6FF] text-blue-700" />
                    <Badge label={h.formato} color="bg-[#ECFDF5] text-emerald-700" />
                    <Badge label={h.objetivo} color="bg-[#F5F3FF] text-violet-700" />
                    <Badge label={h.sazonalidade && h.sazonalidade !== 'o_ano_todo' ? h.sazonalidade : null} color="bg-orange-50 text-orange-700" />
                  </div>
                </div>
              ))}
              {hooksFiltered.length === 0 && (
                <div className="text-center py-12 text-[#9CA3AF]">Nenhum hook encontrado</div>
              )}
            </>
          )}

          {/* Legendas */}
          {tab === 'legendas' && (
            <>
              <p className="text-xs text-[#9CA3AF]">{benchFiltered.length} resultados</p>
              {benchFiltered.map(b => (
                <div key={b.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A1D26] mb-1">{b.hook}</p>
                      {b.legenda_completa && (
                        <p className="text-xs text-[#6B7280] line-clamp-2">{b.legenda_completa}</p>
                      )}
                      {b.cta && (
                        <p className="text-xs text-[#B8860B] mt-1 font-medium">CTA: {b.cta}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-sm font-bold text-[#B8860B]">{b.qualidade_score}</span>
                      <button
                        onClick={() => copiar(b.legenda_completa || b.hook, b.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          copiado === b.id ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF8E7] text-[#B8860B] hover:bg-[#B8860B] hover:text-white'
                        }`}
                      >
                        {copiado === b.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <Badge label={b.tema} color="bg-[#EFF6FF] text-blue-700" />
                    <Badge label={b.formato} color="bg-[#ECFDF5] text-emerald-700" />
                    <Badge label={b.objetivo} color="bg-[#F5F3FF] text-violet-700" />
                    <Badge label={b.sazonalidade && b.sazonalidade !== 'o_ano_todo' ? b.sazonalidade : null} color="bg-orange-50 text-orange-700" />
                  </div>
                </div>
              ))}
              {benchFiltered.length === 0 && (
                <div className="text-center py-12 text-[#9CA3AF]">Nenhuma legenda encontrada</div>
              )}
            </>
          )}

          {/* Hashtags */}
          {tab === 'hashtags' && (
            <>
              <p className="text-xs text-[#9CA3AF]">{hashFiltered.length} combos</p>
              {hashFiltered.map(h => {
                const tags = typeof h.hashtags === 'string'
                  ? h.hashtags.split(/[\s,]+/).filter(Boolean)
                  : Array.isArray(h.hashtags) ? h.hashtags : []
                const texto = tags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ')
                return (
                  <div key={h.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {h.nome && <p className="text-sm font-medium text-[#1A1D26] mb-2">{h.nome}</p>}
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 20).map((t, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">
                              {t.startsWith('#') ? t : `#${t}`}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => copiar(texto, h.id)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          copiado === h.id ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF8E7] text-[#B8860B] hover:bg-[#B8860B] hover:text-white'
                        }`}
                      >
                        {copiado === h.id ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge label={h.tema} color="bg-[#EFF6FF] text-blue-700" />
                      <Badge label={h.objetivo} color="bg-[#ECFDF5] text-emerald-700" />
                      <Badge label={h.sazonalidade && h.sazonalidade !== 'o_ano_todo' ? h.sazonalidade : null} color="bg-orange-50 text-orange-700" />
                    </div>
                  </div>
                )
              })}
              {hashFiltered.length === 0 && (
                <div className="text-center py-12 text-[#9CA3AF]">Nenhum combo encontrado</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
