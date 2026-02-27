'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const TEMAS = [
  'all_inclusive','aventura','bastidores','cafe_da_manha','casamento','checkin',
  'corporativo','datas_comemorativas','destino','experiencias','familia','fazenda',
  'gastronomia','noite','pet_friendly','piscina','por_do_sol','praia','promocoes',
  'quarto','romantico','serra','spa','sustentabilidade','ugc','workation',
]

interface Legenda {
  id: string
  tema: string
  formato: string
  publico: string
  hook: string
  legenda_completa: string
  cta: string
  hashtags: string[]
  qualidade_score: number
  intencao: string
}

interface TemaStats {
  tema: string
  count: number
  media_qualidade: number
}

export default function BenchmarksPage() {
  const [loading, setLoading] = useState(true)
  const [temaStats, setTemaStats] = useState<TemaStats[]>([])
  const [legendas, setLegendas] = useState<Legenda[]>([])
  const [total, setTotal] = useState(0)
  const [mediaGeral, setMediaGeral] = useState(0)
  const [temaSelecionado, setTemaSelecionado] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const { data: all } = await supabase
        .from('benchmarks_posts')
        .select('tema, qualidade_score')
        .eq('ativo', true)

      const posts = all || []
      setTotal(posts.length)

      const soma = posts.reduce((acc, p) => acc + (p.qualidade_score || 0), 0)
      setMediaGeral(posts.length ? Math.round((soma / posts.length) * 10) / 10 : 0)

      const map: Record<string, { count: number; soma: number }> = {}
      for (const p of posts) {
        if (!map[p.tema]) map[p.tema] = { count: 0, soma: 0 }
        map[p.tema].count++
        map[p.tema].soma += p.qualidade_score || 0
      }

      const stats = TEMAS.map(tema => ({
        tema,
        count: map[tema]?.count || 0,
        media_qualidade: map[tema] ? Math.round((map[tema].soma / map[tema].count) * 10) / 10 : 0,
      })).sort((a, b) => b.count - a.count)

      setTemaStats(stats)
      setLoading(false)
    }
    loadStats()
  }, [])

  useEffect(() => {
    async function loadLegendas() {
      if (!temaSelecionado) { setLegendas([]); return }
      const { data } = await supabase
        .from('benchmarks_posts')
        .select('*')
        .eq('tema', temaSelecionado)
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(50)
      setLegendas(data || [])
    }
    loadLegendas()
  }, [temaSelecionado])

  function copiar(l: Legenda) {
    navigator.clipboard.writeText(`${l.hook}\n\n${l.legenda_completa}\n\n${l.cta}\n\n${(l.hashtags || []).join(' ')}`)
    toast.success('Legenda copiada!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  const maxCount = temaStats[0]?.count || 1

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Biblioteca de Benchmarks</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Legendas reais de hotéis de alta performance</p>
        </div>
        <div className="flex gap-3 text-right">
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 shadow-sm text-right">
            <p className="text-2xl font-bold text-[#B8860B]">{total.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-[#9CA3AF]">legendas</p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 shadow-sm text-right">
            <p className="text-2xl font-bold text-emerald-700">{mediaGeral}</p>
            <p className="text-xs text-[#9CA3AF]">qualidade média</p>
          </div>
        </div>
      </div>

      {/* Grid por tema */}
      <div>
        <h2 className="font-semibold text-[#1A1D26] mb-3">Distribuição por Tema — clique para explorar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {temaStats.map(({ tema, count, media_qualidade }) => (
            <button
              key={tema}
              onClick={() => setTemaSelecionado(temaSelecionado === tema ? '' : tema)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                temaSelecionado === tema
                  ? 'bg-[#FFF8E7] border-[#B8860B] shadow-sm'
                  : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-sm'
              }`}
            >
              <p className={`text-xs font-medium capitalize truncate ${
                temaSelecionado === tema ? 'text-[#B8860B]' : 'text-[#1A1D26]'
              }`}>{tema.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-[#1A1D26] mt-1">{count}</p>
              <div className="mt-1.5 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#B8860B]"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-[#9CA3AF] mt-1">⭐ {media_qualidade}/10</p>
            </button>
          ))}
        </div>
      </div>

      {/* Legendas do tema selecionado */}
      {temaSelecionado && (
        <div>
          <h2 className="font-semibold text-[#1A1D26] mb-3">
            Legendas: <span className="text-[#B8860B] capitalize">{temaSelecionado.replace(/_/g, ' ')}</span>
            <span className="text-sm font-normal text-[#9CA3AF] ml-2">({legendas.length} resultados)</span>
          </h2>
          <div className="space-y-3">
            {legendas.map(l => (
              <div key={l.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                  className="w-full p-4 text-left hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] capitalize">{l.tema.replace(/_/g,' ')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">{l.formato}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{l.publico}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1D26] line-clamp-1">{l.hook}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{l.legenda_completa}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B8860B] rounded-full" style={{ width: `${(l.qualidade_score / 10) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#B8860B]">{l.qualidade_score}</span>
                      </div>
                      <svg className={`w-4 h-4 text-[#9CA3AF] mt-1 ml-auto transition-transform ${expandedId === l.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedId === l.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#E5E7EB] pt-3">
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Hook</p>
                      <p className="text-sm font-semibold text-[#B8860B]">{l.hook}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Legenda completa</p>
                      <p className="text-sm text-[#374151] whitespace-pre-line">{l.legenda_completa}</p>
                    </div>
                    {l.cta && (
                      <div>
                        <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">CTA</p>
                        <p className="text-sm text-emerald-700 font-medium">{l.cta}</p>
                      </div>
                    )}
                    {l.hashtags && l.hashtags.length > 0 && (
                      <div>
                        <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Hashtags</p>
                        <div className="flex flex-wrap gap-1">
                          {l.hashtags.map(h => (
                            <span key={h} className="text-[10px] px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => copiar(l)}
                      className="w-full py-2.5 bg-[#B8860B] hover:brightness-110 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      Copiar Legenda
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
