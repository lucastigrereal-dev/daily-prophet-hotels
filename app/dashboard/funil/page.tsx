'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FunilEtapa {
  nome: string
  valor: number
  taxa: string
  cor: string
  dica: string
}

const FUNIL_DATA: FunilEtapa[] = [
  { nome: 'Impressões', valor: 50000, taxa: '100%', cor: '#B8860B', dica: 'Aumente com hashtags otimizadas e horários corretos' },
  { nome: 'Alcance', valor: 25000, taxa: '50%', cor: '#D4A843', dica: 'Melhore usando Reels e carrosséis que ampliam distribuição' },
  { nome: 'Engajamento', valor: 3750, taxa: '15%', cor: '#059669', dica: 'Use hooks fortes, CTAs claros e perguntas nos posts' },
  { nome: 'Clique no Bio', valor: 750, taxa: '20%', cor: '#2563EB', dica: 'Otimize sua bio com link direto para reserva + CTA nos posts' },
  { nome: 'DMs Recebidas', valor: 375, taxa: '50%', cor: '#7C3AED', dica: 'Incentive DMs com ofertas exclusivas e Stories interativos' },
  { nome: 'Reservas', valor: 56, taxa: '15%', cor: '#DC2626', dica: 'Use Auto-Responder para converter DMs em reservas rapidamente' },
]

const BENCHMARK_SETOR = {
  impressoes_alcance: '45-55%',
  alcance_engajamento: '10-20%',
  engajamento_clique: '15-25%',
  clique_dm: '40-60%',
  dm_reserva: '10-20%',
}

export default function FunilPage() {
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const [totalCalendario, setTotalCalendario] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ count: posts }, { count: cal }] = await Promise.all([
        supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true }),
        supabase.from('calendarios_gerados').select('*', { count: 'exact', head: true }),
      ])
      setTotalPosts(posts || 0)
      setTotalCalendario(cal || 0)
      setLoading(false)
    }
    load()
  }, [])

  const maxValor = FUNIL_DATA[0].valor

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Rastreador de Funil de Conversão</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">UTM tracking + pixel + dashboard — descubra quantas reservas vieram do Instagram</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Reservas/Mês</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">56</p>
          <p className="text-xs text-[#9CA3AF] mt-1">via Instagram estimado</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Receita Atribuída</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">35%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">do total de reservas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Posts Prontos</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{totalPosts.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">na biblioteca</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Agendados</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{totalCalendario}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">no calendário</p>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-6">Funil Instagram → Reserva</h2>
        <div className="space-y-3">
          {FUNIL_DATA.map((etapa, idx) => {
            const largura = Math.max((etapa.valor / maxValor) * 100, 8)
            const taxaProxima = idx < FUNIL_DATA.length - 1 ? FUNIL_DATA[idx + 1].taxa : null
            return (
              <div key={etapa.nome}>
                <div className="flex items-center gap-4">
                  <div className="w-28 lg:w-36 text-sm font-medium text-[#1A1D26] text-right">{etapa.nome}</div>
                  <div className="flex-1">
                    <div
                      className="h-10 rounded-lg flex items-center px-3 transition-all"
                      style={{ width: `${largura}%`, backgroundColor: etapa.cor }}
                    >
                      <span className="text-white text-sm font-bold">{etapa.valor.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="w-14 text-right text-sm font-medium" style={{ color: etapa.cor }}>{etapa.taxa}</div>
                </div>
                {taxaProxima && (
                  <div className="ml-32 lg:ml-40 pl-4 py-1">
                    <span className="text-xs text-[#9CA3AF]">↓ {FUNIL_DATA[idx + 1].taxa} conversão</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dicas por etapa */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Como Melhorar Cada Etapa</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {FUNIL_DATA.map(etapa => (
            <div key={etapa.nome} className="flex gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <div className="w-2 rounded-full flex-shrink-0" style={{ backgroundColor: etapa.cor }} />
              <div>
                <p className="text-sm font-medium text-[#1A1D26]">{etapa.nome}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{etapa.dica}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark do setor */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Benchmark do Setor Hoteleiro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(BENCHMARK_SETOR).map(([key, val]) => (
            <div key={key} className="bg-[#FAFBFC] rounded-xl p-3">
              <p className="text-xs text-[#9CA3AF] capitalize">{key.replace(/_/g, ' → ')}</p>
              <p className="text-lg font-bold text-[#B8860B] mt-1">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
