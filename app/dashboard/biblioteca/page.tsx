'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type Tab = 'hooks' | 'legendas' | 'hashtags'

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
}

interface HashtagCombo {
  id: string
  nome: string
  hashtags: string | string[]
  tema: string
  objetivo: string
}

export default function BibliotecaPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('hooks')
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')
  const [filtroTema, setFiltroTema] = useState('')
  const [hooks, setHooks] = useState<Hook[]>([])
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([])
  const [hashtags, setHashtags] = useState<HashtagCombo[]>([])
  const [stats, setStats] = useState({ hooks: 0, benchmarks: 0, hashtags: 0 })
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [
      { data: hooksData, count: hooksCount },
      { data: benchData, count: benchCount },
      { data: hashData, count: hashCount },
    ] = await Promise.all([
      supabase.from('hooks').select('id, hook, tema, formato, objetivo', { count: 'exact' }).order('created_at', { ascending: false }).limit(200),
      supabase.from('benchmarks_posts').select('id, hook, legenda_completa, tema, formato, qualidade_score, hashtags', { count: 'exact' }).eq('ativo', true).order('qualidade_score', { ascending: false }).limit(200),
      supabase.from('hashtag_combos').select('id, nome, hashtags, tema, objetivo', { count: 'exact' }).limit(100),
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

  const hooksFiltered = hooks.filter(h => {
    const q = busca.toLowerCase()
    const matchBusca = !q || h.hook?.toLowerCase().includes(q) || h.tema?.toLowerCase().includes(q)
    const matchFormato = !filtroFormato || h.formato === filtroFormato
    const matchTema = !filtroTema || h.tema === filtroTema
    return matchBusca && matchFormato && matchTema
  })

  const benchFiltered = benchmarks.filter(b => {
    const q = busca.toLowerCase()
    const matchBusca = !q || b.hook?.toLowerCase().includes(q) || b.legenda_completa?.toLowerCase().includes(q) || b.tema?.toLowerCase().includes(q)
    const matchFormato = !filtroFormato || b.formato === filtroFormato
    const matchTema = !filtroTema || b.tema === filtroTema
    return matchBusca && matchFormato && matchTema
  })

  const hashFiltered = hashtags.filter(h => {
    const q = busca.toLowerCase()
    return !q || h.nome?.toLowerCase().includes(q) || h.tema?.toLowerCase().includes(q)
  })

  const temasDisponiveis = [...new Set([
    ...hooks.map(h => h.tema),
    ...benchmarks.map(b => b.tema),
  ].filter(Boolean))].slice(0, 30)

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Biblioteca</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Hooks, legendas e hashtags em um so lugar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setTab('hooks')}
          className={`rounded-2xl p-4 text-left transition-all ${tab === 'hooks' ? 'bg-[#B8860B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] hover:shadow-sm'}`}
        >
          <p className={`text-xs uppercase tracking-wide font-medium ${tab === 'hooks' ? 'text-white/70' : 'text-[#9CA3AF]'}`}>Hooks</p>
          <p className={`text-2xl font-bold mt-1 ${tab === 'hooks' ? 'text-white' : 'text-[#1A1D26]'}`}>{stats.hooks.toLocaleString('pt-BR')}</p>
        </button>
        <button
          onClick={() => setTab('legendas')}
          className={`rounded-2xl p-4 text-left transition-all ${tab === 'legendas' ? 'bg-[#B8860B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] hover:shadow-sm'}`}
        >
          <p className={`text-xs uppercase tracking-wide font-medium ${tab === 'legendas' ? 'text-white/70' : 'text-[#9CA3AF]'}`}>Legendas</p>
          <p className={`text-2xl font-bold mt-1 ${tab === 'legendas' ? 'text-white' : 'text-[#1A1D26]'}`}>{stats.benchmarks.toLocaleString('pt-BR')}</p>
        </button>
        <button
          onClick={() => setTab('hashtags')}
          className={`rounded-2xl p-4 text-left transition-all ${tab === 'hashtags' ? 'bg-[#B8860B] text-white shadow-md' : 'bg-white border border-[#E5E7EB] hover:shadow-sm'}`}
        >
          <p className={`text-xs uppercase tracking-wide font-medium ${tab === 'hashtags' ? 'text-white/70' : 'text-[#9CA3AF]'}`}>Hashtags</p>
          <p className={`text-2xl font-bold mt-1 ${tab === 'hashtags' ? 'text-white' : 'text-[#1A1D26]'}`}>{stats.hashtags.toLocaleString('pt-BR')}</p>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 min-w-48 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]"
        />
        {tab !== 'hashtags' && (
          <>
            <select
              value={filtroFormato}
              onChange={e => setFiltroFormato(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white"
            >
              <option value="">Todos formatos</option>
              <option value="reel">Reel</option>
              <option value="story">Story</option>
              <option value="carrossel">Carrossel</option>
              <option value="post">Post</option>
            </select>
            <select
              value={filtroTema}
              onChange={e => setFiltroTema(e.target.value)}
              className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white"
            >
              <option value="">Todos temas</option>
              {temasDisponiveis.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </>
        )}
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
                    <button
                      onClick={() => copiar(h.hook, h.id)}
                      className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        copiado === h.id ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF8E7] text-[#B8860B] hover:bg-[#B8860B] hover:text-white'
                      }`}
                    >
                      {copiado === h.id ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {h.tema && <span className="text-xs px-2 py-0.5 bg-[#EFF6FF] text-blue-700 rounded-full">{h.tema}</span>}
                    {h.formato && <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-emerald-700 rounded-full">{h.formato}</span>}
                    {h.objetivo && <span className="text-xs px-2 py-0.5 bg-[#F5F3FF] text-violet-700 rounded-full">{h.objetivo}</span>}
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
                  <div className="flex gap-2 mt-2">
                    {b.tema && <span className="text-xs px-2 py-0.5 bg-[#EFF6FF] text-blue-700 rounded-full">{b.tema}</span>}
                    {b.formato && <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-emerald-700 rounded-full">{b.formato}</span>}
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
                    {(h.tema || h.objetivo) && (
                      <div className="flex gap-2 mt-2">
                        {h.tema && <span className="text-xs px-2 py-0.5 bg-[#EFF6FF] text-blue-700 rounded-full">{h.tema}</span>}
                        {h.objetivo && <span className="text-xs px-2 py-0.5 bg-[#ECFDF5] text-emerald-700 rounded-full">{h.objetivo}</span>}
                      </div>
                    )}
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
