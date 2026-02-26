'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
  hoteis_total: number
  hoteis_ativos: number
  posts_mes: number
  posts_pendentes: number
}

interface Hotel {
  id: string
  nome: string
  cidade: string
  estado: string
  tipo: string
  status: string
  instagram: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ hoteis_total: 0, hoteis_ativos: 0, posts_mes: 0, posts_pendentes: 0 })
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: hoteisData } = await supabase.from('hotels').select('*').order('created_at', { ascending: false })
      const { data: postsData } = await supabase.from('calendarios_gerados').select('id, status')

      const h = hoteisData || []
      const p = postsData || []

      setHoteis(h)
      setStats({
        hoteis_total: h.length,
        hoteis_ativos: h.filter(x => x.status === 'ativo').length,
        posts_mes: p.length,
        posts_pendentes: p.filter(x => x.status === 'rascunho').length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl font-bold">Dashboard</h1>
        <Link
          href="/onboarding"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors"
        >
          + Novo Hotel
        </Link>
      </div>

      {/* Stats cards - 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Hoteis" value={stats.hoteis_total} />
        <StatCard label="Ativos" value={stats.hoteis_ativos} color="green" />
        <StatCard label="Posts Gerados" value={stats.posts_mes} color="blue" />
        <StatCard label="Pendentes" value={stats.posts_pendentes} color="amber" />
      </div>

      {/* Hotels list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Seus Hoteis</h2>
        {hoteis.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <p className="text-zinc-400 mb-4">Nenhum hotel cadastrado ainda</p>
            <Link
              href="/onboarding"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
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
                className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{hotel.nome}</h3>
                    <p className="text-sm text-zinc-400">{hotel.cidade}/{hotel.estado} — {hotel.tipo}</p>
                    {hotel.instagram && (
                      <p className="text-xs text-zinc-500 mt-1">{hotel.instagram}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    hotel.status === 'ativo' ? 'bg-green-500/10 text-green-400' :
                    hotel.status === 'onboarding' ? 'bg-amber-500/10 text-amber-400' :
                    hotel.status === 'lead' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-zinc-500/10 text-zinc-400'
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
        <h2 className="text-lg font-semibold mb-3">Nossos Perfis</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { handle: '@lucastigrereal', seg: '690k', cor: '#d4a053' },
            { handle: '@oinatalrn', seg: '630k', cor: '#3b82f6' },
            { handle: '@agenteviajabrasil', seg: '440k', cor: '#10b981' },
            { handle: '@afamiliatigrereal', seg: '320k', cor: '#f59e0b' },
            { handle: '@oquecomeremnatal', seg: '220k', cor: '#ef4444' },
            { handle: '@resolutes', seg: '120k', cor: '#8b5cf6' },
          ].map((p) => (
            <div key={p.handle} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <p className="text-sm font-medium" style={{ color: p.cor }}>{p.handle}</p>
              <p className="text-lg font-bold text-white">{p.seg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'white' }: { label: string; value: number; color?: string }) {
  const colors: Record<string, string> = {
    white: 'text-white',
    green: 'text-green-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  )
}
