'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Hotel {
  id: string
  nome: string
}

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
}

const PRECOS_SIMULADOS = [
  { hotel: 'Seu Hotel', standard: 350, superior: 520, suite: 850, tipo: 'proprio' },
  { hotel: 'Concorrente A', standard: 320, superior: 480, suite: 780, tipo: 'concorrente' },
  { hotel: 'Concorrente B', standard: 380, superior: 550, suite: 920, tipo: 'concorrente' },
  { hotel: 'Concorrente C', standard: 290, superior: 430, suite: 700, tipo: 'concorrente' },
  { hotel: 'Concorrente D', standard: 410, superior: 600, suite: 980, tipo: 'concorrente' },
]

const SAZONALIDADE_PRECOS = [
  { periodo: 'Baixa Temporada', meses: 'Mar-Jun, Ago-Nov', ajuste: '-15%', recomendacao: 'Ofereça pacotes com experiências incluídas' },
  { periodo: 'Alta Temporada', meses: 'Dez-Fev, Jul', ajuste: '+25%', recomendacao: 'Mantenha tarifa premium com mínimo de noites' },
  { periodo: 'Feriados', meses: 'Carnaval, Páscoa, Réveillon', ajuste: '+40%', recomendacao: 'Pacotes all-inclusive com valor percebido alto' },
  { periodo: 'Eventos Locais', meses: 'Varia por região', ajuste: '+20%', recomendacao: 'Promova conexão com o evento na comunicação' },
]

const ALERTAS = [
  { msg: 'Concorrente C baixou Standard para R$260 (-10%)', tipo: 'queda', data: '2 dias atrás' },
  { msg: 'Concorrente B subiu Suite para R$980 (+6%)', tipo: 'alta', data: '5 dias atrás' },
  { msg: 'Média do mercado subiu 3% no último mês', tipo: 'alta', data: '1 semana atrás' },
]

export default function PrecosPage() {
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [benchmarks, setBenchmarks] = useState<KBEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [hRes, kRes] = await Promise.all([
        supabase.from('hotels').select('id, nome').limit(6),
        supabase.from('knowledge_base').select('id, titulo, conteudo').eq('categoria', 'top_hoteis_benchmark').limit(10),
      ])
      setHotels(hRes.data || [])
      setBenchmarks(kRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const mediaStandard = Math.round(PRECOS_SIMULADOS.filter(p => p.tipo === 'concorrente').reduce((a, b) => a + b.standard, 0) / 4)
  const seuPreco = PRECOS_SIMULADOS[0].standard
  const posicao = seuPreco > mediaStandard ? 'Acima' : seuPreco < mediaStandard ? 'Abaixo' : 'Na média'

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Inteligência de Preços</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Comparativo competitivo + preço dinâmico + alertas de mudança</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Seu Preço Base</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">R${seuPreco}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">quarto standard</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Média Mercado</p>
          <p className="text-3xl font-bold text-[#6B7280] mt-1">R${mediaStandard}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">concorrentes</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Posição</p>
          <p className={`text-3xl font-bold mt-1 ${posicao === 'Acima' ? 'text-emerald-700' : posicao === 'Abaixo' ? 'text-red-500' : 'text-blue-700'}`}>{posicao}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">da média</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alertas</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{ALERTAS.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">mudanças recentes</p>
        </div>
      </div>

      {/* Tabela comparativa */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm overflow-x-auto">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Tabela Comparativa de Preços</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left py-2 text-[#9CA3AF] font-medium">Hotel</th>
              <th className="text-right py-2 text-[#9CA3AF] font-medium">Standard</th>
              <th className="text-right py-2 text-[#9CA3AF] font-medium">Superior</th>
              <th className="text-right py-2 text-[#9CA3AF] font-medium">Suite</th>
            </tr>
          </thead>
          <tbody>
            {PRECOS_SIMULADOS.map(p => (
              <tr key={p.hotel} className={`border-b border-[#F3F4F6] ${p.tipo === 'proprio' ? 'bg-[#FFF8E7]' : ''}`}>
                <td className={`py-3 ${p.tipo === 'proprio' ? 'font-bold text-[#B8860B]' : 'text-[#1A1D26]'}`}>{p.hotel}</td>
                <td className="text-right py-3 text-[#1A1D26]">R${p.standard}</td>
                <td className="text-right py-3 text-[#1A1D26]">R${p.superior}</td>
                <td className="text-right py-3 text-[#1A1D26]">R${p.suite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alertas */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Alertas de Preço</h2>
        <div className="space-y-2">
          {ALERTAS.map((alerta, idx) => (
            <div key={idx} className={`flex items-center gap-3 rounded-xl p-3 ${
              alerta.tipo === 'queda' ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-emerald-50 border-l-4 border-l-emerald-500'
            }`}>
              <span className="text-lg">{alerta.tipo === 'queda' ? '📉' : '📈'}</span>
              <p className="text-sm text-[#1A1D26] flex-1">{alerta.msg}</p>
              <span className="text-xs text-[#9CA3AF]">{alerta.data}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sazonalidade */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Preço Dinâmico por Temporada</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {SAZONALIDADE_PRECOS.map(s => (
            <div key={s.periodo} className="bg-[#FAFBFC] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-[#1A1D26]">{s.periodo}</p>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  s.ajuste.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>{s.ajuste}</span>
              </div>
              <p className="text-xs text-[#6B7280]">Meses: {s.meses}</p>
              <p className="text-xs text-[#B8860B] mt-1">💡 {s.recomendacao}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
