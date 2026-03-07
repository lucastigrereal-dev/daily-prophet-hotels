'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Hotel {
  id: string
  nome: string
  cidade: string
  estado: string
  tipo: string
  status: string
  instagram: string
  onboarding_completo: boolean
  cor: string | null
}

interface Hook {
  id: string
  hook: string
  tema: string
  formato: string
}

interface Benchmark {
  id: string
  hook: string
  tema: string
  formato: string
  qualidade_score: number
  hashtags: string
}

interface CalendarPost {
  id: string
  data_post: string
  tipo: string
  tema_especifico: string
  status: string
  hotel_id: string
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

function getSemanaDates(): Date[] {
  const hoje = new Date()
  const dow = hoje.getDay()
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return d
  })
}

export default function DashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [stats, setStats] = useState({ total_legendas: 0, total_hooks: 0 })
  const [postDia, setPostDia] = useState<{ hook: Hook | null; benchmark: Benchmark | null }>({ hook: null, benchmark: null })
  const [postsCalendario, setPostsCalendario] = useState<CalendarPost[]>([])
  const semana = getSemanaDates()
  const hoje = new Date()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    // Busca o hotel do usuario logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!hotelData) {
      setLoading(false)
      return
    }

    setHotel(hotelData)

    const [
      { count: totalLegendas },
      { count: totalHooks },
      { data: hooksData },
      { data: benchData },
    ] = await Promise.all([
      supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true }),
      supabase.from('hooks').select('*', { count: 'exact', head: true }),
      supabase.from('hooks').select('id, hook, tema, formato').limit(50),
      supabase
        .from('benchmarks_posts')
        .select('id, hook, tema, formato, qualidade_score, hashtags')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(20),
    ])

    setStats({ total_legendas: totalLegendas || 0, total_hooks: totalHooks || 0 })

    // Post do dia: deterministic por dia do ano
    const hooks = hooksData || []
    const benchmarks = benchData || []
    const dayOfYear = Math.floor((hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / 86400000)
    const hookDoDia = hooks.length > 0 ? hooks[dayOfYear % hooks.length] : null
    const benchDoDia = benchmarks.length > 0 ? benchmarks[dayOfYear % benchmarks.length] : null
    setPostDia({ hook: hookDoDia, benchmark: benchDoDia })

    // Posts da semana do hotel
    const inicioSemana = semana[0].toISOString().split('T')[0]
    const fimSemana = semana[6].toISOString().split('T')[0]
    const { data: posts } = await supabase
      .from('calendarios_gerados')
      .select('id, data_post, tipo, tema_especifico, status, hotel_id')
      .eq('hotel_id', hotelData.id)
      .gte('data_post', inicioSemana)
      .lte('data_post', fimSemana)
    setPostsCalendario(posts || [])

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  // Sem hotel — direciona para onboarding
  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF8E7] flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-[#1A1D26] mb-2">Bem-vindo ao Daily Prophet</h1>
        <p className="text-sm text-[#6B7280] mb-6 max-w-sm">
          Cadastre seu hotel para receber seu Starter Kit personalizado com calendario, hooks e campanhas.
        </p>
        <Link
          href="/onboarding"
          className="px-6 py-3 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg transition-all"
        >
          Cadastrar meu hotel
        </Link>
      </div>
    )
  }

  const scoreConteudo = Math.min(100, Math.round(((stats.total_legendas + stats.total_hooks) / 3500) * 100))
  const scoreExecucao = hotel.onboarding_completo ? 60 : 20
  const scoreTotal = Math.round((scoreConteudo + scoreExecucao) / 2)
  const nivel = scoreTotal >= 80 ? 'Dominando' : scoreTotal >= 60 ? 'Estrategico' : scoreTotal >= 40 ? 'Ativo' : scoreTotal >= 20 ? 'Organizado' : 'Travado'
  const corTema = hotel.cor || '#B8860B'

  return (
    <div className="space-y-5">

      {/* Header — single hotel */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Posto de Comando</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {hotel.nome} — {hotel.cidade}/{hotel.estado}
        </p>
      </div>

      {/* Score bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1A1D26]">Nivel: {nivel}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] font-medium">{scoreTotal}%</span>
          </div>
          <div className="flex gap-4 text-xs text-[#9CA3AF]">
            <span>Conteudo <strong className="text-[#1A1D26]">{scoreConteudo}</strong></span>
            <span>Execucao <strong className="text-[#1A1D26]">{scoreExecucao}</strong></span>
          </div>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${scoreTotal}%`, backgroundColor: corTema }}
          />
        </div>
      </div>

      {/* Grid principal 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Missao ativa */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1D26] text-sm">Missao Ativa</h2>
            <Link href="/dashboard/missoes" className="text-xs text-[#B8860B] hover:underline">Ver todas</Link>
          </div>
          {hotel.onboarding_completo ? (
            <div className="space-y-3">
              <div className="bg-[#FFF8E7] rounded-xl p-3">
                <p className="font-medium text-sm text-[#B8860B]">Calendario Editorial do Mes</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Criar e publicar posts 3x por semana</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-white rounded-full h-1.5">
                    <div className="bg-[#B8860B] h-1.5 rounded-full" style={{ width: '35%' }} />
                  </div>
                  <span className="text-xs text-[#B8860B] font-medium">35%</span>
                </div>
              </div>
              <Link href="/dashboard/missoes" className="block text-center text-xs py-2 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB]">
                Ativar nova missao
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#9CA3AF] mb-3">Complete o onboarding para receber sua primeira missao</p>
              <Link href="/onboarding" className="inline-block px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg">
                Completar Onboarding
              </Link>
            </div>
          )}
        </div>

        {/* Post do Dia */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1D26] text-sm">Post do Dia</h2>
            <Link href="/dashboard/post-do-dia" className="text-xs text-[#B8860B] hover:underline">Ver completo</Link>
          </div>
          {postDia.hook ? (
            <div className="space-y-2">
              <div className="bg-[#F8F9FB] rounded-xl p-3">
                <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">Hook</p>
                <p className="text-sm text-[#1A1D26] leading-snug line-clamp-3">{postDia.hook.hook}</p>
              </div>
              <div className="flex gap-2 text-xs">
                {postDia.hook.tema && (
                  <span className="px-2 py-0.5 bg-[#EFF6FF] text-blue-700 rounded-full">{postDia.hook.tema}</span>
                )}
                {postDia.hook.formato && (
                  <span className="px-2 py-0.5 bg-[#ECFDF5] text-emerald-700 rounded-full">{postDia.hook.formato}</span>
                )}
              </div>
              <Link href="/dashboard/post-do-dia" className="block text-center text-xs py-2 bg-[#B8860B] text-white rounded-lg font-medium hover:brightness-110">
                Ver legenda completa + CTA
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-[#9CA3AF]">
              Carregando sugestao do dia...
            </div>
          )}
        </div>

      </div>

      {/* Semana + Campanha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Calendario da semana */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1D26] text-sm">Semana</h2>
            <Link href="/dashboard/calendario" className="text-xs text-[#B8860B] hover:underline">Calendario completo</Link>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {semana.map((dia, i) => {
              const isHoje = dia.toDateString() === hoje.toDateString()
              const dateStr = dia.toISOString().split('T')[0]
              const temPost = postsCalendario.some(p => String(p.data_post).startsWith(dateStr))
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center p-2 rounded-xl text-center ${
                    isHoje ? 'bg-[#FFF8E7] border border-[#B8860B]/30' : 'bg-[#F8F9FB]'
                  }`}
                >
                  <span className="text-[10px] text-[#9CA3AF]">{DIAS_SEMANA[i]}</span>
                  <span className={`text-sm font-bold mt-0.5 ${isHoje ? 'text-[#B8860B]' : 'text-[#1A1D26]'}`}>
                    {dia.getDate()}
                  </span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${temPost ? 'bg-emerald-500' : 'bg-[#E5E7EB]'}`} />
                </div>
              )
            })}
          </div>
          <p className="text-xs text-[#9CA3AF] mt-2 text-center">
            {postsCalendario.length} post{postsCalendario.length !== 1 ? 's' : ''} planejado{postsCalendario.length !== 1 ? 's' : ''} esta semana
          </p>
        </div>

        {/* Campanha do mes */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1D26] text-sm">Campanha do Mes</h2>
            <Link href="/dashboard/campanhas" className="text-xs text-[#B8860B] hover:underline">Ver campanhas</Link>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFFBF0] rounded-xl p-3 border border-[#B8860B]/20">
            <p className="font-semibold text-sm text-[#B8860B]">Semana Santa / Pascoa</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Antecedencia recomendada: 14 dias</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-full text-[#6B7280]">Reel</span>
              <span className="text-xs px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-full text-[#6B7280]">Story</span>
              <span className="text-xs px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-full text-[#6B7280]">Carrossel</span>
            </div>
            <Link href="/dashboard/campanhas" className="block text-center text-xs py-2 mt-3 border border-[#B8860B]/40 text-[#B8860B] rounded-lg hover:bg-[#B8860B] hover:text-white transition-colors">
              Montar campanha
            </Link>
          </div>
        </div>

      </div>

      {/* Acoes rapidas */}
      <div>
        <h2 className="text-base font-semibold text-[#1A1D26] mb-3">Acoes Rapidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/gerador" title="Gerador" desc={`${stats.total_legendas.toLocaleString('pt-BR')} legendas`} icon="M13 10V3L4 14h7v7l9-11h-7z" color="#B8860B" bg="#FFF8E7" />
          <QuickAction href="/dashboard/biblioteca" title="Biblioteca" desc={`${stats.total_hooks.toLocaleString('pt-BR')} hooks`} icon="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" color="#2563EB" bg="#EFF6FF" />
          <QuickAction href="/dashboard/missoes" title="Missoes" desc="Executar missao" icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" color="#059669" bg="#ECFDF5" />
          <QuickAction href="/dashboard/campanhas" title="Campanhas" desc="Planejar campanha" icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" color="#7C3AED" bg="#F5F3FF" />
        </div>
      </div>

    </div>
  )
}

function QuickAction({ href, title, desc, icon, color, bg }: {
  href: string; title: string; desc: string; icon: string; color: string; bg: string
}) {
  return (
    <Link href={href} className="block bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:shadow-md transition-all duration-200 group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: bg }}>
        <svg className="w-4 h-4" fill="none" stroke={color} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <p className="font-semibold text-sm text-[#1A1D26]">{title}</p>
      <p className="text-xs text-[#9CA3AF] mt-0.5">{desc}</p>
    </Link>
  )
}
