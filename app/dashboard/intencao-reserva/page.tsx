'use client'

import { useState } from 'react'

const FUNIL_INTENCAO = [
  { nivel: 1, nome: 'Curtiu Post', score: 10, sinais: ['Like em foto do hotel', 'Like em stories'], acao: 'Nenhuma — monitorar', cor: 'bg-blue-100 text-blue-700' },
  { nivel: 2, nome: 'Engajou', score: 25, sinais: ['Comentou no post', 'Respondeu enquete', 'Compartilhou'], acao: 'Responder comentário e agradecer', cor: 'bg-cyan-100 text-cyan-700' },
  { nivel: 3, nome: 'Salvou Post', score: 45, sinais: ['Salvou publicação', 'Mandou para amigo', 'Screenshot'], acao: 'Seguir de volta e curtir seus posts', cor: 'bg-yellow-100 text-yellow-700' },
  { nivel: 4, nome: 'Visitou Perfil', score: 60, sinais: ['Clicou no perfil', 'Viu highlights', 'Clicou no link da bio'], acao: 'Enviar DM com boas-vindas e oferta especial', cor: 'bg-orange-100 text-orange-700' },
  { nivel: 5, nome: 'Mandou DM', score: 80, sinais: ['Perguntou disponibilidade', 'Pediu preço', 'Perguntou sobre quarto'], acao: 'Responder em <5min com proposta personalizada', cor: 'bg-[#FFF8E7] text-[#B8860B]' },
  { nivel: 6, nome: 'Reservou', score: 100, sinais: ['Confirmou reserva', 'Fez pagamento', 'Agendou datas'], acao: 'Confirmar + enviar guia pré-estadia', cor: 'bg-emerald-100 text-emerald-700' },
]

const METRICAS_PIPELINE = {
  leads_quentes: 42,
  conversao_estimada: '12%',
  valor_pipeline: 'R$ 28.400',
  tempo_medio_conversao: '3.2 dias',
}

const DICAS_POR_NIVEL = [
  { nivel: 'Curtiu → Engajou', dica: 'Posts com perguntas no final têm 3x mais comentários', melhoria: '+180%' },
  { nivel: 'Engajou → Salvou', dica: 'Carrosséis educativos são salvos 5x mais que fotos únicas', melhoria: '+320%' },
  { nivel: 'Salvou → Visitou', dica: 'CTAs claros na legenda aumentam visitas ao perfil em 40%', melhoria: '+40%' },
  { nivel: 'Visitou → DM', dica: 'Bio com oferta clara + link direto para WhatsApp dobra DMs', melhoria: '+100%' },
  { nivel: 'DM → Reserva', dica: 'Respostas em <5min convertem 3x mais que após 1 hora', melhoria: '+200%' },
]

export default function IntencaoReservaPage() {
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Preditor de Intenção de Reserva</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Score 0-100 baseado em sinais de engajamento — converta seguidores em hóspedes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Leads Quentes</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{METRICAS_PIPELINE.leads_quentes}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">score ≥60</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Conversão</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{METRICAS_PIPELINE.conversao_estimada}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">DM → reserva</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Pipeline</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{METRICAS_PIPELINE.valor_pipeline}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">valor estimado</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Tempo Médio</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{METRICAS_PIPELINE.tempo_medio_conversao}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">até reserva</p>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Funil de Intenção — Score por Nível</h2>
        <div className="space-y-3">
          {FUNIL_INTENCAO.map((nivel, idx) => {
            const isSelected = selectedNivel === idx
            return (
              <button
                key={nivel.nivel}
                onClick={() => setSelectedNivel(isSelected ? null : idx)}
                className="w-full text-left"
              >
                <div className={`rounded-xl p-4 transition-all ${isSelected ? 'bg-[#FFF8E7] border-2 border-[#B8860B]' : 'bg-[#FAFBFC] border border-transparent hover:bg-[#F3F4F6]'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${nivel.cor}`}>{nivel.nivel}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[#1A1D26] text-sm">{nivel.nome}</p>
                        <span className="text-sm font-bold text-[#B8860B]">{nivel.score}/100</span>
                      </div>
                      {/* Barra de score */}
                      <div className="w-full h-2 bg-[#E5E7EB] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-[#B8860B] transition-all" style={{ width: `${nivel.score}%` }} />
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 ml-11 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-[#9CA3AF] uppercase">Sinais:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {nivel.sinais.map((s, i) => (
                            <span key={i} className="text-xs bg-white border border-[#E5E7EB] px-2 py-0.5 rounded-full text-[#6B7280]">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#9CA3AF] uppercase">Ação recomendada:</p>
                        <p className="text-sm text-[#1A1D26] mt-0.5">{nivel.acao}</p>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dicas de otimização */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Otimização por Etapa do Funil</h2>
        <div className="space-y-3">
          {DICAS_POR_NIVEL.map((dica, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <span className="text-xs font-bold text-[#B8860B] bg-[#FFF8E7] px-2 py-1 rounded-full min-w-[120px] text-center">{dica.nivel}</span>
              <div className="flex-1">
                <p className="text-sm text-[#1A1D26]">{dica.dica}</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">{dica.melhoria}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
