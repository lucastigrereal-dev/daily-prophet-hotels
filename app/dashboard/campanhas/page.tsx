'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Campanha {
  id: string
  nome: string
  tipo: string
  objetivo: string
  antecedencia_dias: number
  data_inicio: string
  data_fim: string
  formatos_sugeridos: string[]
  cta_principal: string
  descricao: string
  ativo: boolean
}

interface CampanhaLocal {
  id: string
  nome: string
  tipo: string
  objetivo: string
  antecedencia_dias: number
  data_inicio: string
  data_fim: string
  formatos_sugeridos: string[]
  cta_principal: string
  descricao: string
  ativo: boolean
  dias_restantes: number
}

interface Enrollment {
  campanha_id: string
  status: string
  progresso: number
}

const CAMPANHAS_ESTATICAS: CampanhaLocal[] = [
  {
    id: 'pascoa',
    nome: 'Pascoa 2026',
    tipo: 'feriado',
    objetivo: 'Lotacao total no feriado',
    antecedencia_dias: 14,
    data_inicio: '2026-04-02',
    data_fim: '2026-04-05',
    formatos_sugeridos: ['reel', 'story', 'carrossel'],
    cta_principal: 'Reserve agora com desconto de Pascoa',
    descricao: 'Campanha especial para o feriado de Pascoa. Foco em pacotes de 3 noites.',
    ativo: true,
    dias_restantes: Math.max(0, Math.ceil((new Date('2026-04-02').getTime() - Date.now()) / 86400000)),
  },
  {
    id: 'dia_maes',
    nome: 'Dia das Maes',
    tipo: 'data_comemorativa',
    objetivo: 'Pacotes romanticos e familiares',
    antecedencia_dias: 21,
    data_inicio: '2026-05-10',
    data_fim: '2026-05-11',
    formatos_sugeridos: ['reel', 'story'],
    cta_principal: 'Presente que ela vai amar — reserve ja',
    descricao: 'Uma das datas mais fortes para hotelaria de lazer. Comece a campanha 3 semanas antes.',
    ativo: true,
    dias_restantes: Math.max(0, Math.ceil((new Date('2026-05-10').getTime() - Date.now()) / 86400000)),
  },
  {
    id: 'ferias_julho',
    nome: 'Ferias de Julho',
    tipo: 'ferias_escolares',
    objetivo: 'Ocupacao maxima durante as ferias escolares',
    antecedencia_dias: 30,
    data_inicio: '2026-07-01',
    data_fim: '2026-07-31',
    formatos_sugeridos: ['reel', 'carrossel', 'story'],
    cta_principal: 'Julho ja tem data — garanta o seu',
    descricao: 'Ferias de julho sao a temporada mais disputada. Inicie a campanha em junho.',
    ativo: true,
    dias_restantes: Math.max(0, Math.ceil((new Date('2026-07-01').getTime() - Date.now()) / 86400000)),
  },
  {
    id: 'baixa_temporada_may',
    nome: 'Promocao Baixa Temporada',
    tipo: 'baixa_temporada',
    objetivo: 'Aumentar ocupacao no periodo fraco',
    antecedencia_dias: 7,
    data_inicio: '2026-05-15',
    data_fim: '2026-06-30',
    formatos_sugeridos: ['post', 'story'],
    cta_principal: 'Preco especial so para quem reservar agora',
    descricao: 'Baixa temporada entre feriados. Foco em casais e viagens individuais com precos agressivos.',
    ativo: true,
    dias_restantes: Math.max(0, Math.ceil((new Date('2026-05-15').getTime() - Date.now()) / 86400000)),
  },
  {
    id: 'dia_namorados',
    nome: 'Dia dos Namorados',
    tipo: 'data_comemorativa',
    objetivo: 'Pacotes romanticos para casais',
    antecedencia_dias: 21,
    data_inicio: '2026-06-12',
    data_fim: '2026-06-14',
    formatos_sugeridos: ['reel', 'story', 'carrossel'],
    cta_principal: 'A noite perfeita para voces dois',
    descricao: 'Data forte para pousadas romanticas e resorts. Foco em pacotes com jantar e spa.',
    ativo: true,
    dias_restantes: Math.max(0, Math.ceil((new Date('2026-06-12').getTime() - Date.now()) / 86400000)),
  },
]

function urgenciaColor(dias: number) {
  if (dias <= 7) return 'bg-red-50 text-red-700 border-red-200'
  if (dias <= 14) return 'bg-[#FFF8E7] text-[#B8860B] border-[#B8860B]/30'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export default function CampanhasPage() {
  const supabase = createClient()
  const [campanhasDB, setCampanhasDB] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todas' | 'urgentes' | 'planejamento'>('todas')
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [enrolling, setEnrolling] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (hotelData) {
      setHotelId(hotelData.id)

      const [{ data: campanhasData }, { data: enrollData }] = await Promise.all([
        supabase
          .from('campanhas')
          .select('*')
          .eq('ativo', true)
          .order('data_inicio', { ascending: true })
          .limit(50),
        supabase
          .from('campaign_hotel_status')
          .select('campanha_id, status, progresso')
          .eq('hotel_id', hotelData.id),
      ])
      setCampanhasDB(campanhasData || [])
      setEnrollments(enrollData || [])
    }
    setLoading(false)
  }

  async function enrollCampanha(campanhaId: string) {
    if (!hotelId) return
    setEnrolling(campanhaId)

    // Para campanhas estaticas (sem UUID), registra no log de execucao
    const isStaticId = !campanhaId.includes('-')
    if (isStaticId) {
      await supabase.from('hotel_execution_log').insert({
        hotel_id: hotelId,
        acao: `campanha_inscrita:${campanhaId}`,
        categoria: 'campanha',
        detalhes: { campanha_nome: campanhaId },
        pontos: 2,
      })
      toast.success('Inscrito na campanha!')
      setEnrolling(null)
      return
    }

    // Para campanhas do banco (com UUID real)
    const { error } = await supabase
      .from('campaign_hotel_status')
      .upsert({
        hotel_id: hotelId,
        campanha_id: campanhaId,
        status: 'inscrito',
        started_at: new Date().toISOString(),
      }, { onConflict: 'hotel_id,campanha_id' })

    if (error) {
      toast.error('Não foi possível entrar na campanha. Tente novamente.')
    } else {
      setEnrollments(prev => [...prev, { campanha_id: campanhaId, status: 'inscrito', progresso: 0 }])
      toast.success('Inscrito na campanha!')

      await supabase.from('hotel_execution_log').insert({
        hotel_id: hotelId,
        acao: 'campanha_inscrita',
        categoria: 'campanha',
        detalhes: { campanha_id: campanhaId },
        pontos: 2,
      })
    }
    setEnrolling(null)
  }

  function getEnrollment(campanhaId: string): Enrollment | undefined {
    return enrollments.find(e => e.campanha_id === campanhaId)
  }

  const campanhas = CAMPANHAS_ESTATICAS.sort((a, b) => a.dias_restantes - b.dias_restantes)
  const campanhsFiltradas = campanhas.filter(c => {
    if (filtro === 'urgentes') return c.dias_restantes <= 14
    if (filtro === 'planejamento') return c.dias_restantes > 14
    return true
  })

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Campanhas</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Sazonalidade e datas importantes para o seu hotel</p>
      </div>

      {/* Alerta urgente */}
      {campanhas.filter(c => c.dias_restantes <= 7).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700">
            Atencao: {campanhas.filter(c => c.dias_restantes <= 7).length} campanha(s) em menos de 7 dias!
          </p>
          <p className="text-xs text-red-600 mt-0.5">Comece a producao de conteudo agora.</p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-xl p-1">
        {(['todas', 'urgentes', 'planejamento'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              filtro === f ? 'bg-white text-[#1A1D26] shadow-sm' : 'text-[#6B7280] hover:text-[#1A1D26]'
            }`}
          >
            {f === 'urgentes' ? 'Urgentes' : f === 'planejamento' ? 'Planejamento' : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista de campanhas */}
      <div className="space-y-3">
        {campanhsFiltradas.map(c => (
          <div key={c.id} className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${urgenciaColor(c.dias_restantes)}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#1A1D26]">{c.nome}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${urgenciaColor(c.dias_restantes)}`}>
                    {c.dias_restantes === 0 ? 'HOJE' : `${c.dias_restantes}d`}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-2">{c.descricao}</p>
                <p className="text-xs font-medium text-[#1A1D26]">Objetivo: {c.objetivo}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">CTA: {c.cta_principal}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {c.formatos_sugeridos.map(f => (
                <span key={f} className="text-xs px-2 py-0.5 bg-white/80 border border-current/20 rounded-full">{f}</span>
              ))}
              <span className="text-xs text-[#9CA3AF] ml-auto">
                {new Date(c.data_inicio).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                {c.data_fim !== c.data_inicio && ` — ${new Date(c.data_fim).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-current/10">
              <p className="text-xs text-[#6B7280]">
                Comece a producao <strong>{c.antecedencia_dias} dias antes</strong> — {
                  (() => {
                    const inicioIdeal = new Date(c.data_inicio)
                    inicioIdeal.setDate(inicioIdeal.getDate() - c.antecedencia_dias)
                    return inicioIdeal.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
                  })()
                }
              </p>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => enrollCampanha(c.id)}
                disabled={enrolling === c.id}
                className="flex-1 py-2 text-xs font-medium bg-[#B8860B] text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {enrolling === c.id ? 'Inscrevendo...' : 'Participar desta campanha'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Campanhas do banco */}
      {campanhasDB.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-3">Campanhas personalizadas</p>
          <div className="space-y-2">
            {campanhasDB.map(c => {
              const enrollment = getEnrollment(c.id)
              return (
                <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-[#1A1D26]">{c.nome}</p>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{c.objetivo}</p>
                    </div>
                    {enrollment ? (
                      <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                        {enrollment.status === 'inscrito' ? 'Inscrito' : enrollment.status}
                      </span>
                    ) : (
                      <button
                        onClick={() => enrollCampanha(c.id)}
                        disabled={enrolling === c.id}
                        className="text-xs px-3 py-1.5 bg-[#B8860B] text-white rounded-lg hover:brightness-110 disabled:opacity-50"
                      >
                        {enrolling === c.id ? '...' : 'Participar'}
                      </button>
                    )}
                  </div>
                  {enrollment && enrollment.progresso > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-[#F3F4F6] rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${enrollment.progresso}%` }} />
                      </div>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{enrollment.progresso}% concluido</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
