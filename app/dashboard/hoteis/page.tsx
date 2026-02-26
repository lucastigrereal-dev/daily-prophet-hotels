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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hoteis</h1>
        <Link href="/onboarding" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">+ Novo</Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['todos', 'lead', 'onboarding', 'ativo', 'pausado'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
            {s === 'todos' ? `Todos (${hoteis.length})` : `${s} (${hoteis.filter(h => h.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Nenhum hotel encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(hotel => (
            <Link key={hotel.id} href={`/dashboard/hoteis/${hotel.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">{hotel.nome}</h3>
                  <p className="text-sm text-zinc-400">{hotel.cidade}/{hotel.estado} — {hotel.tipo}</p>
                  {hotel.instagram && <p className="text-xs text-zinc-500 mt-0.5">{hotel.instagram}</p>}
                </div>
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  hotel.status === 'ativo' ? 'bg-green-500/10 text-green-400' :
                  hotel.status === 'onboarding' ? 'bg-amber-500/10 text-amber-400' :
                  hotel.status === 'lead' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-zinc-500/10 text-zinc-400'
                }`}>{hotel.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
