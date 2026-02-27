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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1D26]">Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Total Hotéis</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{stats.hoteis}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Ativos</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.ativos}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Leads</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{stats.leads}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Collabs Ativas</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{stats.collabs}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">MRR</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">R${stats.mrr.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Posts Gerados</p>
          <p className="text-3xl font-bold text-purple-700 mt-1">{stats.posts}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link href="/admin/hoteis" className="block bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200">
          <h3 className="font-semibold text-[#1A1D26]">Pipeline de Hotéis</h3>
          <p className="text-sm text-[#6B7280]">Ver todos os hotéis por status</p>
        </Link>
        <Link href="/admin/financeiro" className="block bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200">
          <h3 className="font-semibold text-[#1A1D26]">Financeiro</h3>
          <p className="text-sm text-[#6B7280]">Receita, collabs e pagamentos</p>
        </Link>
      </div>
    </div>
  )
}
