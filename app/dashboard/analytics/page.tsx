'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TemaStats {
  tema: string
  count: number
}
interface FormatoStats {
  formato: string
  count: number
}
interface PublicoStats {
  publico: string
  count: number
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [totalLegendas, setTotalLegendas] = useState(0)
  const [totalHooks, setTotalHooks] = useState(0)
  const [totalTemplates, setTotalTemplates] = useState(0)
  const [totalHoteis, setTotalHoteis] = useState(0)
  const [temas, setTemas] = useState<TemaStats[]>([])
  const [formatos, setFormatos] = useState<FormatoStats[]>([])
  const [publicos, setPublicos] = useState<PublicoStats[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [
        { count: cLegendas },
        { count: cHooks },
        { count: cTemplates },
        { count: cHoteis },
        { data: allPosts },
      ] = await Promise.all([
        supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true }),
        supabase.from('hooks').select('*', { count: 'exact', head: true }),
        supabase.from('caption_templates').select('*', { count: 'exact', head: true }),
        supabase.from('hotels').select('*', { count: 'exact', head: true }),
        supabase.from('benchmarks_posts').select('tema, formato, publico').eq('ativo', true),
      ])

      setTotalLegendas(cLegendas || 0)
      setTotalHooks(cHooks || 0)
      setTotalTemplates(cTemplates || 0)
      setTotalHoteis(cHoteis || 0)

      // Agrupar client-side
      const posts = allPosts || []

      const temaMap: Record<string, number> = {}
      const formatoMap: Record<string, number> = {}
      const publicoMap: Record<string, number> = {}

      for (const p of posts) {
        if (p.tema) temaMap[p.tema] = (temaMap[p.tema] || 0) + 1
        if (p.formato) formatoMap[p.formato] = (formatoMap[p.formato] || 0) + 1
        if (p.publico) publicoMap[p.publico] = (publicoMap[p.publico] || 0) + 1
      }

      setTemas(Object.entries(temaMap).map(([tema, count]) => ({ tema, count })).sort((a, b) => b.count - a.count))
      setFormatos(Object.entries(formatoMap).map(([formato, count]) => ({ formato, count })).sort((a, b) => b.count - a.count))
      setPublicos(Object.entries(publicoMap).map(([publico, count]) => ({ publico, count })).sort((a, b) => b.count - a.count))

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  const maxTema = temas[0]?.count || 1
  const maxFormato = formatos[0]?.count || 1
  const maxPublico = publicos[0]?.count || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Visão geral da biblioteca de conteúdo</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Legendas</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{totalLegendas.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">benchmarks_posts</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hooks</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalHooks.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">hooks</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Templates</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{totalTemplates}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">caption_templates</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hotéis</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{totalHoteis}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por formato */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Distribuição por Formato</h2>
          <div className="space-y-3">
            {formatos.map(({ formato, count }) => (
              <div key={formato}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#1A1D26] capitalize">{formato}</span>
                  <span className="text-[#6B7280]">{count.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#B8860B] transition-all"
                    style={{ width: `${(count / maxFormato) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por público */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Distribuição por Público</h2>
          <div className="space-y-3">
            {publicos.map(({ publico, count }) => (
              <div key={publico}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#1A1D26] capitalize">{publico}</span>
                  <span className="text-[#6B7280]">{count.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(count / maxPublico) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por tema */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Distribuição por Tema ({temas.length} temas)</h2>
        <div className="space-y-2">
          {temas.map(({ tema, count }) => (
            <div key={tema} className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280] w-36 truncate capitalize">{tema.replace(/_/g, ' ')}</span>
              <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${(count / maxTema) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[#9CA3AF] w-10 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
