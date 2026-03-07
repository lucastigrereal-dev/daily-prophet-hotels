'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface Missao {
  id: string
  hotel_id: string
  tipo: string
  titulo: string
  descricao: string
  status: string
  progresso: number
  score_execucao: number
  started_at: string | null
  due_at: string | null
}

interface Hotel {
  id: string
  nome: string
}

const MISSOES_SUGERIDAS = [
  {
    tipo: 'calendario_mensal',
    titulo: 'Calendario Editorial do Mes',
    descricao: 'Planejar e publicar posts 3x por semana durante 30 dias',
    objetivo: 'Consistencia e presenca digital',
    dificuldade: 'facil',
    duracao_dias: 30,
  },
  {
    tipo: 'prova_social',
    titulo: 'Coleta de Depoimentos',
    descricao: 'Coletar 10 depoimentos de hospedes e transformar em conteudo',
    objetivo: 'Aumentar credibilidade e conversao',
    dificuldade: 'facil',
    duracao_dias: 14,
  },
  {
    tipo: 'dependencia_ota',
    titulo: 'Reducao de OTA: Canal Direto',
    descricao: 'Criar sequencia de conteudo focada em reserva direta via WhatsApp/site',
    objetivo: 'Reduzir dependencia de Booking/Airbnb em 20%',
    dificuldade: 'medio',
    duracao_dias: 21,
  },
  {
    tipo: 'baixa_temporada',
    titulo: 'Campanha Baixa Temporada',
    descricao: 'Criar campanha de beneficios exclusivos para periodo de baixo fluxo',
    objetivo: 'Aumentar ocupacao em 15% no periodo',
    dificuldade: 'medio',
    duracao_dias: 14,
  },
  {
    tipo: 'perfil_travado',
    titulo: 'Bio e Perfil Profissional',
    descricao: 'Otimizar bio, foto de perfil, destaques e link da bio',
    objetivo: 'Perfil converte visitante em seguidor',
    dificuldade: 'facil',
    duracao_dias: 7,
  },
  {
    tipo: 'reativacao_hospedes',
    titulo: 'Reativacao de Hospedes Antigos',
    descricao: 'Campanha de WhatsApp + Instagram para hospedes dos ultimos 12 meses',
    objetivo: 'Gerar pelo menos 5 reservas de retorno',
    dificuldade: 'medio',
    duracao_dias: 21,
  },
  {
    tipo: 'meio_semana',
    titulo: 'Ocupacao Meio de Semana',
    descricao: 'Criar oferta especifica para ter/qua com pacote de beneficios',
    objetivo: 'Aumentar ocupacao Ter-Qua em 25%',
    dificuldade: 'facil',
    duracao_dias: 14,
  },
  {
    tipo: 'feriado',
    titulo: 'Campanha de Feriado Proximo',
    descricao: 'Preparar campanha completa para o proximo feriado nacional',
    objetivo: 'Lotacao total no feriado',
    dificuldade: 'facil',
    duracao_dias: 10,
  },
]

const STATUS_COLOR: Record<string, string> = {
  nao_iniciada: 'bg-[#F3F4F6] text-[#6B7280]',
  em_andamento: 'bg-[#FFF8E7] text-[#B8860B]',
  concluida: 'bg-emerald-50 text-emerald-700',
  pausada: 'bg-red-50 text-red-600',
}

const STATUS_LABEL: Record<string, string> = {
  nao_iniciada: 'Nao iniciada',
  em_andamento: 'Em andamento',
  concluida: 'Concluida',
  pausada: 'Pausada',
}

const DIFICULDADE_COLOR: Record<string, string> = {
  facil: 'text-emerald-700 bg-emerald-50',
  medio: 'text-[#B8860B] bg-[#FFF8E7]',
  avancado: 'text-red-600 bg-red-50',
}

export default function MissoesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [ativando, setAtivando] = useState<string | null>(null)
  const [tabAtiva, setTabAtiva] = useState<'ativas' | 'disponiveis' | 'concluidas'>('ativas')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id, nome')
      .limit(1)
      .single()

    setHotel(hotelData || null)

    if (hotelData) {
      const { data: missoesData } = await supabase
        .from('hotel_missoes')
        .select('*')
        .eq('hotel_id', hotelData.id)
        .order('created_at', { ascending: false })

      setMissoes(missoesData || [])
    }

    setLoading(false)
  }

  async function ativarMissao(template: typeof MISSOES_SUGERIDAS[0]) {
    if (!hotel) { toast.error('Nenhum hotel encontrado'); return }
    setAtivando(template.tipo)
    try {
      const dueAt = new Date()
      dueAt.setDate(dueAt.getDate() + template.duracao_dias)

      const { data, error } = await supabase
        .from('hotel_missoes')
        .insert({
          hotel_id: hotel.id,
          tipo: template.tipo,
          titulo: template.titulo,
          descricao: template.descricao,
          objetivo: template.objetivo,
          status: 'em_andamento',
          progresso: 0,
          started_at: new Date().toISOString(),
          due_at: dueAt.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      toast.success('Missao ativada!')
      await load()
      setTabAtiva('ativas')
    } catch (err: any) {
      if (err?.code === '42P01') {
        toast.error('Tabela hotel_missoes ainda nao existe. Execute a migration Sprint 2.')
      } else {
        toast.error('Erro ao ativar missao: ' + (err?.message || 'desconhecido'))
      }
    } finally {
      setAtivando(null)
    }
  }

  async function atualizarProgresso(id: string, progresso: number) {
    const status = progresso >= 100 ? 'concluida' : 'em_andamento'
    await supabase
      .from('hotel_missoes')
      .update({ progresso, status, ...(progresso >= 100 ? { completed_at: new Date().toISOString() } : {}) })
      .eq('id', id)
    setMissoes(prev => prev.map(m => m.id === id ? { ...m, progresso, status } : m))
    if (progresso >= 100) toast.success('Missao concluida!')
  }

  const missoesAtivas = missoes.filter(m => m.status === 'em_andamento')
  const missoesConcluidas = missoes.filter(m => m.status === 'concluida')
  const tiposAtivos = missoes.map(m => m.tipo)
  const missoesDisponiveis = MISSOES_SUGERIDAS.filter(m => !tiposAtivos.includes(m.tipo))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Missoes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {hotel ? hotel.nome : 'Nenhum hotel'} — Execute missoes para crescer
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#B8860B]">{missoesAtivas.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Em andamento</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-700">{missoesConcluidas.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Concluidas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-[#1A1D26]">{missoesDisponiveis.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Disponiveis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
        {(['ativas', 'disponiveis', 'concluidas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTabAtiva(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              tabAtiva === t ? 'bg-white text-[#1A1D26] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D26]'
            }`}
          >
            {t === 'ativas' ? `Ativas (${missoesAtivas.length})` : t === 'disponiveis' ? `Disponiveis` : `Concluidas (${missoesConcluidas.length})`}
          </button>
        ))}
      </div>

      {/* Missoes ativas */}
      {tabAtiva === 'ativas' && (
        <div className="space-y-3">
          {missoesAtivas.length === 0 ? (
            <div className="text-center py-12 bg-white border border-[#E5E7EB] rounded-2xl">
              <p className="text-[#9CA3AF] mb-3">Nenhuma missao ativa</p>
              <button onClick={() => setTabAtiva('disponiveis')} className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg">
                Ver missoes disponiveis
              </button>
            </div>
          ) : (
            missoesAtivas.map(m => (
              <div key={m.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#1A1D26]">{m.titulo}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{m.descricao}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[m.status]}`}>
                    {STATUS_LABEL[m.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-[#F3F4F6] rounded-full h-2">
                    <div
                      className="bg-[#B8860B] h-2 rounded-full transition-all"
                      style={{ width: `${m.progresso}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[#B8860B] w-10 text-right">{m.progresso}%</span>
                </div>
                {m.due_at && (
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    Prazo: {new Date(m.due_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {[25, 50, 75, 100].map(p => (
                    <button
                      key={p}
                      onClick={() => atualizarProgresso(m.id, p)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                        m.progresso >= p
                          ? 'border-[#B8860B] bg-[#FFF8E7] text-[#B8860B]'
                          : 'border-[#E5E7EB] text-[#9CA3AF] hover:border-[#B8860B]'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Missoes disponiveis */}
      {tabAtiva === 'disponiveis' && (
        <div className="space-y-3">
          {missoesDisponiveis.map(m => (
            <div key={m.tipo} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-[#1A1D26]">{m.titulo}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFICULDADE_COLOR[m.dificuldade]}`}>
                      {m.dificuldade}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">{m.descricao}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{m.objetivo}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{m.duracao_dias} dias</p>
                </div>
                <button
                  onClick={() => ativarMissao(m)}
                  disabled={ativando === m.tipo}
                  className="flex-shrink-0 px-3 py-2 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {ativando === m.tipo ? 'Ativando...' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Missoes concluidas */}
      {tabAtiva === 'concluidas' && (
        <div className="space-y-3">
          {missoesConcluidas.length === 0 ? (
            <div className="text-center py-12 text-[#9CA3AF]">Nenhuma missao concluida ainda</div>
          ) : (
            missoesConcluidas.map(m => (
              <div key={m.id} className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1A1D26]">{m.titulo}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Concluida — Score: {m.score_execucao}</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}
