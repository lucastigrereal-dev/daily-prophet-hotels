'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentHotel } from '@/lib/hotel/use-current-hotel'

interface ExecLog {
  acao: string
  categoria: string
  pontos: number | null
  created_at: string
}

interface WeeklyProgress {
  semana: string
  total: number
  done: number
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const { hotel, loading: hotelLoading } = useCurrentHotel()
  const [loading, setLoading] = useState(true)
  const [totalAcoes, setTotalAcoes] = useState(0)
  const [totalPontos, setTotalPontos] = useState(0)
  const [acoesPorCategoria, setAcoesPorCategoria] = useState<{ categoria: string; count: number }[]>([])
  const [ultimasAcoes, setUltimasAcoes] = useState<ExecLog[]>([])
  const [semanasProgresso, setSemanasProgresso] = useState<WeeklyProgress[]>([])
  const [totalLegendas, setTotalLegendas] = useState(0)
  const [totalHooks, setTotalHooks] = useState(0)

  useEffect(() => {
    if (hotelLoading) return
    if (!hotel) { setLoading(false); return }
    load()
  }, [hotelLoading, hotel?.id])

  async function load() {
    if (!hotel) return

    const [
      { data: execData },
      { data: weeklyData },
      { count: cLegendas },
      { count: cHooks },
    ] = await Promise.all([
      supabase
        .from('hotel_execution_log')
        .select('acao, categoria, pontos, created_at')
        .eq('hotel_id', hotel.id)
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('hotel_weekly_tasks')
        .select('semana_inicio, done')
        .eq('hotel_id', hotel.id)
        .order('semana_inicio', { ascending: false })
        .limit(100),
      supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true }),
      supabase.from('hooks').select('*', { count: 'exact', head: true }),
    ])

    const logs = execData || []
    setTotalAcoes(logs.length)
    setTotalPontos(logs.reduce((s, l) => s + (l.pontos || 0), 0))
    setUltimasAcoes(logs.slice(0, 10))
    setTotalLegendas(cLegendas || 0)
    setTotalHooks(cHooks || 0)

    // Agrupar por categoria
    const catMap: Record<string, number> = {}
    for (const l of logs) {
      if (l.categoria) catMap[l.categoria] = (catMap[l.categoria] || 0) + 1
    }
    setAcoesPorCategoria(
      Object.entries(catMap)
        .map(([categoria, count]) => ({ categoria, count }))
        .sort((a, b) => b.count - a.count)
    )

    // Progresso semanal
    const weekMap: Record<string, { total: number; done: number }> = {}
    for (const t of weeklyData || []) {
      if (!weekMap[t.semana_inicio]) weekMap[t.semana_inicio] = { total: 0, done: 0 }
      weekMap[t.semana_inicio].total++
      if (t.done) weekMap[t.semana_inicio].done++
    }
    setSemanasProgresso(
      Object.entries(weekMap)
        .map(([semana, { total, done }]) => ({ semana, total, done }))
        .sort((a, b) => b.semana.localeCompare(a.semana))
        .slice(0, 6)
    )

    setLoading(false)
  }

  if (hotelLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-[#6B7280] mb-4">Cadastre seu hotel para ver analytics</p>
      </div>
    )
  }

  const maxCat = acoesPorCategoria[0]?.count || 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">{hotel.nome} — Desempenho e execucao</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Acoes Executadas</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{totalAcoes}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">no seu hotel</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Pontos</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{totalPontos}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">acumulados</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Legendas</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalLegendas.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">na biblioteca</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hooks</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{totalHooks.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">disponiveis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por categoria */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Acoes por Categoria</h2>
          {acoesPorCategoria.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] text-center py-4">Nenhuma acao registrada ainda</p>
          ) : (
            <div className="space-y-3">
              {acoesPorCategoria.map(({ categoria, count }) => (
                <div key={categoria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#1A1D26] capitalize">{categoria}</span>
                    <span className="text-[#6B7280]">{count}</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#B8860B] transition-all"
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progresso semanal */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Progresso Semanal</h2>
          {semanasProgresso.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] text-center py-4">Nenhuma semana registrada ainda</p>
          ) : (
            <div className="space-y-3">
              {semanasProgresso.map(({ semana, total, done }) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0
                return (
                  <div key={semana}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#1A1D26]">
                        {new Date(semana + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-[#6B7280]">{done}/{total} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Ultimas acoes */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Ultimas Acoes</h2>
        {ultimasAcoes.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-4">Nenhuma acao registrada. Use o Post do Dia, Tarefas ou Campanhas para comecar!</p>
        ) : (
          <div className="space-y-2">
            {ultimasAcoes.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{a.categoria}</span>
                  <span className="text-sm text-[#1A1D26]">{a.acao.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  {a.pontos ? <span className="text-xs font-medium text-[#B8860B]">+{a.pontos}pts</span> : null}
                  <span className="text-xs text-[#9CA3AF]">
                    {new Date(a.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
