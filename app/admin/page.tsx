'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminPage() {
  const [stats, setStats] = useState({ hoteis: 0, ativos: 0, leads: 0, collabs: 0, mrr: 0, posts: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: hoteis } = await supabase.from('hotels').select('id, status')
      const { data: collabs } = await supabase.from('collabs').select('id, valor_mensal, status').eq('status', 'ativo')
      const { count: posts } = await supabase.from('calendarios_gerados').select('id', { count: 'exact', head: true })

      const h = hoteis || []
      const c = collabs || []
      setStats({
        hoteis: h.length,
        ativos: h.filter(x => x.status === 'ativo').length,
        leads: h.filter(x => x.status === 'lead').length,
        collabs: c.length,
        mrr: c.reduce((acc, x) => acc + (x.valor_mensal || 0), 0),
        posts: posts || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Total Hoteis</p>
          <p className="text-2xl font-bold text-white">{stats.hoteis}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Ativos</p>
          <p className="text-2xl font-bold text-green-400">{stats.ativos}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Leads</p>
          <p className="text-2xl font-bold text-blue-400">{stats.leads}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Collabs Ativas</p>
          <p className="text-2xl font-bold text-amber-400">{stats.collabs}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">MRR</p>
          <p className="text-2xl font-bold text-emerald-400">R${stats.mrr.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Posts Gerados</p>
          <p className="text-2xl font-bold text-purple-400">{stats.posts}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/admin/hoteis" className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <h3 className="font-medium text-white">Pipeline de Hoteis</h3>
          <p className="text-sm text-zinc-400">Ver todos os hoteis por status</p>
        </Link>
        <Link href="/admin/financeiro" className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
          <h3 className="font-medium text-white">Financeiro</h3>
          <p className="text-sm text-zinc-400">Receita, collabs e pagamentos</p>
        </Link>
      </div>
    </div>
  )
}
