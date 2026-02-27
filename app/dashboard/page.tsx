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
}

interface PortfolioPerfil {
  id: string
  handle: string
  nome: string
  seguidores: number
  nicho: string
  cor_tema: string
}

interface Stats {
  hoteis_total: number
  hoteis_ativos: number
  total_legendas: number
  total_hooks: number
  total_templates: number
  total_seguidores: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    hoteis_total: 0, hoteis_ativos: 0,
    total_legendas: 0, total_hooks: 0, total_templates: 0, total_seguidores: 0,
  })
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [perfis, setPerfis] = useState<PortfolioPerfil[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [
        { data: hoteisData },
        { count: totalLegendas },
        { count: totalHooks },
        { count: totalTemplates },
        { data: perfisData },
      ] = await Promise.all([
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
        supabase.from('benchmarks_posts').select('*', { count: 'exact', head: true }),
        supabase.from('hooks').select('*', { count: 'exact', head: true }),
        supabase.from('caption_templates').select('*', { count: 'exact', head: true }),
        supabase.from('portfolio_profiles').select('*').order('seguidores', { ascending: false }),
      ])

      const h = hoteisData || []
      const p = perfisData || []
      const totalSeg = p.reduce((acc, x) => acc + (x.seguidores || 0), 0)

      setHoteis(h)
      setPerfis(p)
      setStats({
        hoteis_total: h.length,
        hoteis_ativos: h.filter(x => x.status === 'ativo').length,
        total_legendas: totalLegendas || 0,
        total_hooks: totalHooks || 0,
        total_templates: totalTemplates || 0,
        total_seguidores: totalSeg,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Dashboard</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Bem-vindo ao Daily Prophet Hotels</p>
        </div>
        <Link
          href="/onboarding"
          className="px-4 py-2.5 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg text-sm transition-all"
        >
          + Novo Hotel
        </Link>
      </div>

      {/* Stats cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Hotéis" value={stats.hoteis_total} />
        <StatCard label="Ativos" value={stats.hoteis_ativos} color="green" />
        <StatCard label="Legendas" value={stats.total_legendas.toLocaleString('pt-BR')} color="amber" />
        <StatCard label="Hooks" value={stats.total_hooks.toLocaleString('pt-BR')} color="blue" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D26] mb-3">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction
            href="/dashboard/gerador"
            title="Gerador IA"
            desc={`${stats.total_legendas.toLocaleString('pt-BR')} legendas disponíveis`}
            icon="M13 10V3L4 14h7v7l9-11h-7z"
            color="#B8860B"
            bg="#FFF8E7"
          />
          <QuickAction
            href="/dashboard/calendario"
            title="Calendário Editorial"
            desc="Planejar posts do mês"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            color="#2563EB"
            bg="#EFF6FF"
          />
          <QuickAction
            href="/onboarding"
            title="Cadastrar Hotel"
            desc="Adicionar novo cliente"
            icon="M12 4v16m8-8H4"
            color="#059669"
            bg="#ECFDF5"
          />
        </div>
      </div>

      {/* Hotels list */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A1D26] mb-3">Seus Hotéis</h2>
        {hoteis.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-sm">
            <p className="text-[#6B7280] mb-4">Nenhum hotel cadastrado ainda</p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-3 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg transition-all"
            >
              Cadastrar primeiro hotel
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {hoteis.map((hotel) => (
              <Link
                key={hotel.id}
                href={`/dashboard/hoteis/${hotel.id}`}
                className="block bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1A1D26]">{hotel.nome}</h3>
                    <p className="text-sm text-[#6B7280]">{hotel.cidade}/{hotel.estado} — {hotel.tipo}</p>
                    {hotel.instagram && (
                      <p className="text-xs text-[#9CA3AF] mt-1">{hotel.instagram}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    hotel.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' :
                    hotel.status === 'onboarding' ? 'bg-[#FFF8E7] text-[#B8860B]' :
                    hotel.status === 'lead' ? 'bg-blue-50 text-blue-700' :
                    'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>
                    {hotel.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#1A1D26]">Nossos Perfis</h2>
          {perfis.length > 0 && (
            <span className="text-sm text-[#6B7280]">
              Total: <strong className="text-[#1A1D26]">{(stats.total_seguidores / 1000).toFixed(0)}k</strong> seguidores
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {perfis.map((p) => (
            <div key={p.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200">
              <p className="text-sm font-medium truncate" style={{ color: p.cor_tema || '#B8860B' }}>{p.handle}</p>
              <p className="text-2xl font-bold text-[#1A1D26] mt-0.5">
                {p.seguidores >= 1000 ? `${(p.seguidores / 1000).toFixed(0)}k` : p.seguidores}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{p.nicho}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'default' }: { label: string; value: number | string; color?: string }) {
  const colors: Record<string, string> = {
    default: 'text-[#1A1D26]',
    green: 'text-emerald-700',
    blue: 'text-blue-700',
    amber: 'text-[#B8860B]',
  }
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}

function QuickAction({ href, title, desc, icon, color, bg }: {
  href: string; title: string; desc: string; icon: string; color: string; bg: string
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[#1A1D26] text-sm">{title}</p>
        <p className="text-xs text-[#6B7280] mt-0.5">{desc}</p>
      </div>
    </Link>
  )
}
