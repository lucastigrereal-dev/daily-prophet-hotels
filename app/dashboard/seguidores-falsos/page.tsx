'use client'

import { useState } from 'react'

const INDICADORES = [
  { nome: 'Ratio Seguidores/Seguindo', peso: 25, desc: 'Perfis com ratio <0.5 ou >10 sem ser celebridade são suspeitos', ideal: 'Entre 1.0 e 3.0' },
  { nome: 'Taxa de Engajamento', peso: 25, desc: 'Engajamento <1% com muitos seguidores indica compra', ideal: '3-6% para <10k' },
  { nome: 'Picos de Crescimento', peso: 15, desc: 'Ganhar 1000+ seguidores em um dia sem viral = compra', ideal: 'Crescimento orgânico gradual' },
  { nome: 'Qualidade dos Seguidores', peso: 15, desc: 'Perfis sem foto, sem posts ou com nomes estranhos', ideal: '<5% perfis vazios' },
  { nome: 'Distribuição Geográfica', peso: 10, desc: 'Hotel no BR com seguidores 90% de outro país = fake', ideal: 'Alinhada com localização' },
  { nome: 'Comentários Genéricos', peso: 10, desc: 'Comentários como "nice!" "great!" "🔥" repetidos = bot', ideal: 'Comentários contextuais' },
]

const BENCHMARK_SIMULADO = [
  { hotel: 'Hotel Alpha', seguidores: 15400, engajamento: 4.2, score: 92, status: 'limpo' },
  { hotel: 'Resort Beta', seguidores: 45000, engajamento: 0.8, score: 35, status: 'suspeito' },
  { hotel: 'Pousada Gamma', seguidores: 8200, engajamento: 5.1, score: 95, status: 'limpo' },
  { hotel: 'Hotel Delta', seguidores: 120000, engajamento: 0.3, score: 15, status: 'alto_risco' },
  { hotel: 'Eco Lodge Epsilon', seguidores: 3500, engajamento: 7.8, score: 98, status: 'limpo' },
  { hotel: 'Beach Hotel Zeta', seguidores: 28000, engajamento: 1.1, score: 55, status: 'suspeito' },
]

function getCorScore(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50'
  if (score >= 50) return 'text-yellow-700 bg-yellow-50'
  return 'text-red-700 bg-red-50'
}

function getStatusLabel(status: string) {
  if (status === 'limpo') return { label: 'Limpo', cor: 'bg-emerald-100 text-emerald-700' }
  if (status === 'suspeito') return { label: 'Suspeito', cor: 'bg-yellow-100 text-yellow-700' }
  return { label: 'Alto Risco', cor: 'bg-red-100 text-red-700' }
}

export default function SeguidoresFalsosPage() {
  const [perfil, setPerfil] = useState('')
  const [resultado, setResultado] = useState<{ score: number; detalhes: string[] } | null>(null)
  const [analisando, setAnalisando] = useState(false)

  function analisar() {
    if (!perfil.trim()) return
    setAnalisando(true)
    // Simulação de análise
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 55
      const detalhes = [
        `Ratio seguidores/seguindo: ${(Math.random() * 3 + 0.5).toFixed(1)}`,
        `Engajamento real estimado: ${(Math.random() * 4 + 1).toFixed(1)}%`,
        `Seguidores sem foto: ${Math.floor(Math.random() * 15)}%`,
        `Comentários genéricos: ${Math.floor(Math.random() * 20)}%`,
        `Crescimento suspeito nos últimos 30 dias: ${Math.random() > 0.5 ? 'Sim' : 'Não'}`,
      ]
      setResultado({ score, detalhes })
      setAnalisando(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Detector de Seguidores Falsos</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Auditoria com 6 indicadores — identifique compra de seguidores em qualquer perfil</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Indicadores</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">6</p>
          <p className="text-xs text-[#9CA3AF] mt-1">critérios de análise</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Benchmark</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{BENCHMARK_SIMULADO.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">hotéis analisados</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Limpos</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{BENCHMARK_SIMULADO.filter(b => b.status === 'limpo').length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">score ≥80</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Suspeitos</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{BENCHMARK_SIMULADO.filter(b => b.status !== 'limpo').length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">requerem atenção</p>
        </div>
      </div>

      {/* Ferramenta de auditoria */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Auditar Perfil</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="@perfil ou username"
            value={perfil}
            onChange={e => setPerfil(e.target.value)}
            className="flex-1 border border-[#E5E7EB] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]/30 focus:border-[#B8860B]"
            onKeyDown={e => e.key === 'Enter' && analisar()}
          />
          <button
            onClick={analisar}
            disabled={analisando}
            className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#9A7209] disabled:opacity-50"
          >
            {analisando ? 'Analisando...' : '🔍 Analisar'}
          </button>
        </div>
        {resultado && (
          <div className="mt-4 bg-[#FAFBFC] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-2xl font-bold px-3 py-1 rounded-full ${getCorScore(resultado.score)}`}>{resultado.score}/100</span>
              <div>
                <p className="font-semibold text-[#1A1D26]">Score de Autenticidade</p>
                <p className="text-xs text-[#6B7280]">{resultado.score >= 80 ? 'Perfil parece autêntico' : resultado.score >= 50 ? 'Alguns sinais suspeitos' : 'Alto risco de seguidores falsos'}</p>
              </div>
            </div>
            <div className="space-y-1">
              {resultado.detalhes.map((d, i) => (
                <p key={i} className="text-sm text-[#6B7280]">• {d}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benchmark de hotéis */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Comparativo — Hotéis Benchmark</h2>
        <div className="space-y-2">
          {BENCHMARK_SIMULADO.sort((a, b) => b.score - a.score).map(hotel => {
            const status = getStatusLabel(hotel.status)
            return (
              <div key={hotel.hotel} className="flex items-center gap-3 bg-[#FAFBFC] rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1D26]">{hotel.hotel}</p>
                  <div className="flex gap-3 text-xs text-[#9CA3AF] mt-0.5">
                    <span>{hotel.seguidores.toLocaleString()} seg.</span>
                    <span>{hotel.engajamento}% eng.</span>
                  </div>
                </div>
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${getCorScore(hotel.score)}`}>{hotel.score}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cor}`}>{status.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Indicadores */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">6 Indicadores de Análise</h2>
        <div className="space-y-3">
          {INDICADORES.map(ind => (
            <div key={ind.nome} className="bg-[#FAFBFC] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-[#1A1D26]">{ind.nome}</p>
                <span className="text-xs text-[#B8860B] font-bold">{ind.peso}% peso</span>
              </div>
              <p className="text-xs text-[#6B7280]">{ind.desc}</p>
              <p className="text-xs text-emerald-700 mt-1">Ideal: {ind.ideal}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
