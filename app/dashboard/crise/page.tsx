'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const STATUS_ATUAL = { nivel: 'verde', label: 'Tudo Normal', desc: 'Nenhum alerta de crise detectado nas últimas 24h' }

const ALERTAS_RECENTES = [
  { data: '28 Fev', tipo: 'Review Negativo', plataforma: 'Google', descricao: 'Review 1 estrela mencionando limpeza do quarto', status: 'resolvido', urgencia: 'media' },
  { data: '25 Fev', tipo: 'Menção Negativa', plataforma: 'Instagram', descricao: 'Story de hóspede reclamando do café da manhã', status: 'resolvido', urgencia: 'baixa' },
  { data: '20 Fev', tipo: 'Reclamação DM', plataforma: 'Instagram', descricao: 'Hóspede insatisfeito com barulho no andar', status: 'resolvido', urgencia: 'alta' },
]

const PLAYBOOKS = [
  {
    tipo: 'Reclamação Viral',
    icon: '🔥',
    urgencia: 'CRÍTICA',
    cor: 'border-l-red-500',
    passos: [
      'Detectar em <30 minutos (monitor ativo)',
      'Reunir contexto: o que aconteceu, quem reclamou, alcance',
      'Responder publicamente com empatia — SEM defensiva',
      'Resolver o problema do cliente em privado (DM/telefone)',
      'Postar follow-up mostrando a resolução',
    ],
    template: `Olá [NOME], sentimos muito pela sua experiência. Isso não representa o padrão que buscamos manter. 😔

Nossa equipe já está cuidando do seu caso pessoalmente. Vamos entrar em contato por DM agora mesmo para resolver isso.

Sua satisfação é nossa prioridade. 💛`,
  },
  {
    tipo: 'Review Negativo',
    icon: '⭐',
    urgencia: 'ALTA',
    cor: 'border-l-orange-500',
    passos: [
      'Responder em <24 horas (nunca ignorar)',
      'Agradecer o feedback genuinamente',
      'Reconhecer o problema sem desculpas genéricas',
      'Explicar ações tomadas para evitar recorrência',
      'Convidar para nova estadia com desconto especial',
    ],
    template: `Olá [NOME], agradecemos muito por compartilhar seu feedback. Lamentamos que sua experiência não tenha sido perfeita.

Já conversamos com nossa equipe sobre [PROBLEMA] e tomamos medidas para que isso não se repita.

Gostaríamos de ter a oportunidade de reconquistá-lo(a). Nos envie uma mensagem e teremos o prazer de oferecer condições especiais para sua próxima visita. 💛`,
  },
  {
    tipo: 'Notícia Negativa',
    icon: '📰',
    urgencia: 'CRÍTICA',
    cor: 'border-l-red-500',
    passos: [
      'NÃO responder impulsivamente — reunir equipe primeiro',
      'Preparar nota oficial com assessoria (se necessário)',
      'Comunicar internamente antes de qualquer resposta pública',
      'Publicar posicionamento transparente e factual',
      'Monitorar repercussão e ajustar comunicação',
    ],
    template: `NOTA OFICIAL

O [HOTEL] vem a público esclarecer sobre [SITUAÇÃO].

[FATOS OBJETIVOS DO OCORRIDO]

Reforçamos nosso compromisso com [VALORES] e estamos tomando todas as medidas necessárias para [AÇÕES].

Nos colocamos à disposição para quaisquer esclarecimentos.

Equipe [HOTEL]`,
  },
]

export default function CrisePage() {
  const [expandedPlaybook, setExpandedPlaybook] = useState<number | null>(null)

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast.success('Template copiado!')
  }

  const corSemaforo = STATUS_ATUAL.nivel === 'verde'
    ? 'bg-emerald-500' : STATUS_ATUAL.nivel === 'amarelo'
    ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Detector de Crise de Reputação</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Monitoramento 24h + playbook de resposta + templates de crise</p>
      </div>

      {/* Semáforo */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className={`w-8 h-8 rounded-full ${STATUS_ATUAL.nivel === 'verde' ? 'bg-emerald-500' : 'bg-emerald-200'} transition-colors`} />
            <div className={`w-8 h-8 rounded-full ${STATUS_ATUAL.nivel === 'amarelo' ? 'bg-yellow-500' : 'bg-yellow-200'} transition-colors`} />
            <div className={`w-8 h-8 rounded-full ${STATUS_ATUAL.nivel === 'vermelho' ? 'bg-red-500' : 'bg-red-200'} transition-colors`} />
          </div>
          <div>
            <p className="font-semibold text-[#1A1D26]">{STATUS_ATUAL.label}</p>
            <p className="text-sm text-[#6B7280]">{STATUS_ATUAL.desc}</p>
          </div>
          <div className={`ml-auto w-3 h-3 rounded-full ${corSemaforo} animate-pulse`} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Status</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">OK</p>
          <p className="text-xs text-[#9CA3AF] mt-1">nenhuma crise ativa</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alertas 30d</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{ALERTAS_RECENTES.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">todos resolvidos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Tempo Resposta</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">&lt;2h</p>
          <p className="text-xs text-[#9CA3AF] mt-1">média de resolução</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Playbooks</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{PLAYBOOKS.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">prontos para uso</p>
        </div>
      </div>

      {/* Timeline de alertas */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Alertas Recentes</h2>
        <div className="space-y-2">
          {ALERTAS_RECENTES.map((alerta, idx) => (
            <div key={idx} className={`flex items-center gap-3 bg-[#FAFBFC] rounded-xl p-3 border-l-4 ${
              alerta.urgencia === 'alta' ? 'border-l-orange-500' :
              alerta.urgencia === 'media' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#1A1D26]">{alerta.tipo}</p>
                  <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{alerta.plataforma}</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{alerta.descricao}</p>
              </div>
              <span className="text-xs text-[#9CA3AF]">{alerta.data}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{alerta.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Playbooks */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Playbooks de Crise</h2>
        <div className="space-y-3">
          {PLAYBOOKS.map((pb, idx) => {
            const isExpanded = expandedPlaybook === idx
            return (
              <div key={idx} className={`rounded-xl overflow-hidden border-l-4 ${pb.cor} bg-[#FAFBFC]`}>
                <button
                  onClick={() => setExpandedPlaybook(isExpanded ? null : idx)}
                  className="w-full p-4 text-left hover:bg-[#F3F4F6] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pb.icon}</span>
                      <p className="font-semibold text-[#1A1D26]">{pb.tipo}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        pb.urgencia === 'CRÍTICA' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>{pb.urgencia}</span>
                    </div>
                    <div className="w-3 h-3 border-r-2 border-b-2 border-[#9CA3AF]" style={{ transform: isExpanded ? 'rotate(-135deg)' : 'rotate(45deg)' }} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-2">5 Passos:</p>
                      <ol className="space-y-1 list-decimal list-inside">
                        {pb.passos.map((p, i) => (
                          <li key={i} className="text-sm text-[#1A1D26]">{p}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-1">Template de Resposta:</p>
                      <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-[#E5E7EB]">{pb.template}</pre>
                      <button onClick={() => copiar(pb.template)} className="mt-2 px-3 py-1.5 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:bg-[#9A7209]">📋 Copiar Template</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
