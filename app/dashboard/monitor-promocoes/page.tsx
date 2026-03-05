'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
}

const PROMOCOES_SIMULADAS = [
  { hotel: 'Pousada Maré Alta', regiao: 'Nordeste', desconto: 30, tipo: 'Feriado', periodo: '15 Mar - 22 Mar', urgencia: 'alta', contracao: 'Ofereça café da manhã gratuito + late checkout' },
  { hotel: 'Resort Praia Dourada', regiao: 'Nordeste', desconto: 25, tipo: 'Temporada', periodo: '01 Abr - 30 Abr', urgencia: 'media', contracao: 'Crie pacote romântico com jantar incluso' },
  { hotel: 'Hotel Serra Verde', regiao: 'Sudeste', desconto: 40, tipo: 'Flash Sale', periodo: '10 Mar - 12 Mar', urgencia: 'critica', contracao: 'Responda com 48h de preço igual + upgrade de quarto' },
  { hotel: 'Eco Lodge Amazônia', regiao: 'Norte', desconto: 20, tipo: 'Early Bird', periodo: '01 Mai - 31 Mai', urgencia: 'baixa', contracao: 'Destaque seus diferenciais de experiência e sustentabilidade' },
  { hotel: 'Pousada Colonial', regiao: 'Sudeste', desconto: 35, tipo: 'Última Hora', periodo: '05 Mar - 08 Mar', urgencia: 'alta', contracao: 'Poste Stories mostrando o que seu hotel oferece que eles não têm' },
  { hotel: 'Beach Hotel Tropical', regiao: 'Nordeste', desconto: 15, tipo: 'Programa Fidelidade', periodo: 'Permanente', urgencia: 'baixa', contracao: 'Crie seu próprio programa de fidelidade com benefícios exclusivos' },
]

const COR_URGENCIA = {
  critica: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  alta: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  media: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  baixa: { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
}

export default function MonitorPromocoesPage() {
  const [loading, setLoading] = useState(true)
  const [benchmarks, setBenchmarks] = useState<KBEntry[]>([])
  const [filtroRegiao, setFiltroRegiao] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('knowledge_base')
        .select('id, titulo, conteudo')
        .eq('categoria', 'top_hoteis_benchmark')
        .order('titulo')
      setBenchmarks(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const regioes = [...new Set(PROMOCOES_SIMULADAS.map(p => p.regiao))]
  const filtradas = filtroRegiao ? PROMOCOES_SIMULADAS.filter(p => p.regiao === filtroRegiao) : PROMOCOES_SIMULADAS
  const criticas = PROMOCOES_SIMULADAS.filter(p => p.urgencia === 'critica' || p.urgencia === 'alta').length

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Monitor de Promoções de Concorrentes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Alerta em 5 minutos + contra-ação sugerida + histórico completo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Promoções Ativas</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{PROMOCOES_SIMULADAS.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">detectadas agora</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alertas Urgentes</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{criticas}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">requerem ação imediata</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Desconto Médio</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{Math.round(PROMOCOES_SIMULADAS.reduce((a, b) => a + b.desconto, 0) / PROMOCOES_SIMULADAS.length)}%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">dos concorrentes</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hotéis Monitorados</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{benchmarks.length || 20}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">no benchmark</p>
        </div>
      </div>

      {/* Filtro região */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltroRegiao('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filtroRegiao ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>Todas</button>
        {regioes.map(r => (
          <button key={r} onClick={() => setFiltroRegiao(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroRegiao === r ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{r}</button>
        ))}
      </div>

      {/* Timeline de promoções */}
      <div className="space-y-3">
        {filtradas.map((promo, idx) => {
          const cores = COR_URGENCIA[promo.urgencia as keyof typeof COR_URGENCIA]
          return (
            <div key={idx} className={`bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm border-l-4 ${
              promo.urgencia === 'critica' ? 'border-l-red-500' :
              promo.urgencia === 'alta' ? 'border-l-orange-500' :
              promo.urgencia === 'media' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <div className="flex flex-wrap items-start gap-2 mb-3">
                <h3 className="font-semibold text-[#1A1D26] flex-1">{promo.hotel}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${cores.badge}`}>
                  {promo.urgencia.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  -{promo.desconto}%
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm mb-3">
                <div><span className="text-[#9CA3AF]">Região:</span> <span className="text-[#1A1D26]">{promo.regiao}</span></div>
                <div><span className="text-[#9CA3AF]">Tipo:</span> <span className="text-[#1A1D26]">{promo.tipo}</span></div>
                <div><span className="text-[#9CA3AF]">Período:</span> <span className="text-[#1A1D26]">{promo.periodo}</span></div>
                <div><span className="text-[#9CA3AF]">Desconto:</span> <span className="font-bold text-red-600">{promo.desconto}%</span></div>
              </div>
              <div className="bg-[#FFF8E7] rounded-xl p-3">
                <p className="text-xs font-medium text-[#B8860B] uppercase mb-1">💡 Contra-ação sugerida:</p>
                <p className="text-sm text-[#1A1D26]">{promo.contracao}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
