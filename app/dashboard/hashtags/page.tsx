'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HashtagCombo {
  id: string
  nome: string
  hashtags: string[]
  tema: string
  alcance_estimado: number
}

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
}

export default function HashtagsPage() {
  const [loading, setLoading] = useState(true)
  const [combos, setCombos] = useState<HashtagCombo[]>([])
  const [hashtagsKB, setHashtagsKB] = useState<KBEntry[]>([])
  const [filtroTema, setFiltroTema] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: cmb }, { data: kb }] = await Promise.all([
        supabase.from('hashtag_combos').select('*').order('alcance_estimado', { ascending: false }),
        supabase.from('knowledge_base').select('id, titulo, conteudo').eq('categoria', 'hashtags').order('titulo'),
      ])
      setCombos(cmb || [])
      setHashtagsKB(kb || [])
      setLoading(false)
    }
    load()
  }, [])

  function copiarCombo(hashtags: string[]) {
    navigator.clipboard.writeText(hashtags.join(' '))
    toast.success('Hashtags copiadas!')
  }

  const temas = [...new Set(combos.map(c => c.tema).filter(Boolean))]
  const combosFiltrados = filtroTema ? combos.filter(c => c.tema === filtroTema) : combos

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Otimizador de Hashtags</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Mix ideal: 30% alta + 40% média + 30% baixa competição = +35% alcance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Combos Prontos</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{combos.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">prontos para copiar</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hashtags Analisadas</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{hashtagsKB.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com dados de performance</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Aumento Alcance</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">+35%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com mix otimizado</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Limite</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">30</p>
          <p className="text-xs text-[#9CA3AF] mt-1">hashtags por post</p>
        </div>
      </div>

      {/* Filtro */}
      {temas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltroTema('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filtroTema ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}
          >
            Todos
          </button>
          {temas.map(t => (
            <button
              key={t}
              onClick={() => setFiltroTema(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filtroTema === t ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'}`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Combos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {combosFiltrados.map(combo => (
          <div key={combo.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#1A1D26]">{combo.nome}</h3>
                <p className="text-xs text-[#9CA3AF] capitalize mt-0.5">{combo.tema?.replace(/_/g, ' ')}</p>
              </div>
              {combo.alcance_estimado > 0 && (
                <span className="text-xs font-medium text-[#B8860B] bg-[#FFF8E7] px-2 py-1 rounded-full">
                  {(combo.alcance_estimado / 1000).toFixed(0)}k alcance
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(combo.hashtags || []).map((tag, i) => (
                <span key={i} className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-full">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
            <button
              onClick={() => copiarCombo(combo.hashtags || [])}
              className="px-3 py-1.5 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:bg-[#9A7209] transition-colors"
            >
              📋 Copiar {(combo.hashtags || []).length} hashtags
            </button>
          </div>
        ))}
      </div>

      {/* Estratégia de Mix */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Estratégia de Mix Ideal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="font-bold text-red-700 text-2xl">30%</p>
            <p className="font-medium text-red-700 text-sm">Alta Competição</p>
            <p className="text-xs text-red-600 mt-1">500k+ posts. Dá visibilidade na busca mas é difícil ranquear.</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="font-bold text-amber-700 text-2xl">40%</p>
            <p className="font-medium text-amber-700 text-sm">Média Competição</p>
            <p className="text-xs text-amber-600 mt-1">50k-500k posts. Melhor equilíbrio entre alcance e chance de aparecer.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="font-bold text-green-700 text-2xl">30%</p>
            <p className="font-medium text-green-700 text-sm">Baixa Competição</p>
            <p className="text-xs text-green-600 mt-1">&lt;50k posts. Nicho específico, fácil de ranquear no top 9.</p>
          </div>
        </div>
      </div>

      {/* Hashtags individuais do KB */}
      {hashtagsKB.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Hashtags Analisadas ({hashtagsKB.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {hashtagsKB.map(h => (
              <div key={h.id} className="bg-[#FAFBFC] rounded-lg p-3">
                <p className="text-sm font-medium text-[#1A1D26]">{h.titulo}</p>
                <p className="text-xs text-[#6B7280] mt-1">
                  {typeof h.conteudo === 'object' ?
                    Object.entries(h.conteudo).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' • ')
                    : String(h.conteudo).slice(0, 100)
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
