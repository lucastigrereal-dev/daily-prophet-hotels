'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Hotel {
  id: string; nome: string; cidade: string; estado: string; tipo: string
  status: string; instagram: string; onboarding_completo: boolean
  created_at: string
}

export default function HoteisPage() {
  const [hoteis, setHoteis] = useState<Hotel[]>([])
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('hotels').select('*').order('created_at', { ascending: false })
      setHoteis(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'todos' ? hoteis : hoteis.filter(h => h.status === filter)

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#1A1D26]">Hotéis</h1>
        <Link href="/onboarding" className="px-4 py-2.5 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg text-sm transition-all">
          + Novo
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['todos', 'lead', 'onboarding', 'ativo', 'pausado'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? 'bg-[#B8860B] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}>
            {s === 'todos' ? `Todos (${hoteis.length})` : `${s} (${hoteis.filter(h => h.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#6B7280]">Nenhum hotel encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(hotel => (
            <Link key={hotel.id} href={`/dashboard/hoteis/${hotel.id}`}
              className="block bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1A1D26] truncate">{hotel.nome}</h3>
                  <p className="text-sm text-[#6B7280]">{hotel.cidade}/{hotel.estado} — {hotel.tipo}</p>
                  {hotel.instagram && <p className="text-xs text-[#9CA3AF] mt-0.5">{hotel.instagram}</p>}
                </div>
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  hotel.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' :
                  hotel.status === 'onboarding' ? 'bg-[#FFF8E7] text-[#B8860B]' :
                  hotel.status === 'lead' ? 'bg-blue-50 text-blue-700' :
                  'bg-[#F3F4F6] text-[#6B7280]'
                }`}>{hotel.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
