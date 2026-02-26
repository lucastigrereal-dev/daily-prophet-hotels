'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface HotelFull {
  id: string; nome: string; cidade: string; estado: string; tipo: string
  status: string; instagram: string; numero_quartos: number
  ticket_medio_diaria: number; onboarding_completo: boolean
}

export default function HotelDetailPage() {
  const { hotelId } = useParams()
  const [hotel, setHotel] = useState<HotelFull | null>(null)
  const [postsCount, setPostsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: h } = await supabase.from('hotels').select('*').eq('id', hotelId).single()
      const { count } = await supabase.from('calendarios_gerados').select('id', { count: 'exact', head: true }).eq('hotel_id', hotelId)
      setHotel(h)
      setPostsCount(count || 0)
      setLoading(false)
    }
    load()
  }, [hotelId])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>
  if (!hotel) return <p className="text-center text-zinc-400 py-20">Hotel nao encontrado</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/hoteis" className="text-zinc-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-xl font-bold">{hotel.nome}</h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">{hotel.cidade}/{hotel.estado}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            hotel.status === 'ativo' ? 'bg-green-500/10 text-green-400' :
            hotel.status === 'onboarding' ? 'bg-amber-500/10 text-amber-400' :
            'bg-zinc-500/10 text-zinc-400'
          }`}>{hotel.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Tipo</p>
            <p className="text-sm font-medium text-white">{hotel.tipo}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Quartos</p>
            <p className="text-sm font-medium text-white">{hotel.numero_quartos || '-'}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Diaria media</p>
            <p className="text-sm font-medium text-white">R${hotel.ticket_medio_diaria || '-'}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-zinc-500">Posts gerados</p>
            <p className="text-sm font-medium text-white">{postsCount}</p>
          </div>
        </div>
        {hotel.instagram && (
          <p className="text-sm text-zinc-400">Instagram: <span className="text-amber-500">{hotel.instagram}</span></p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Link href={`/dashboard/hoteis/${hotelId}/calendario`}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/30 transition-colors flex items-center justify-between">
          <div>
            <h3 className="font-medium text-white">Calendario de Posts</h3>
            <p className="text-sm text-zinc-400">Ver e gerenciar posts agendados</p>
          </div>
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  )
}
