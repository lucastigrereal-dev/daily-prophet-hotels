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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
    </div>
  )
  if (!hotel) return <p className="text-center text-[#6B7280] py-20">Hotel não encontrado</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/hoteis" className="text-[#6B7280] hover:text-[#1A1D26] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[#1A1D26]">{hotel.nome}</h1>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6B7280]">{hotel.cidade}/{hotel.estado}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            hotel.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' :
            hotel.status === 'onboarding' ? 'bg-[#FFF8E7] text-[#B8860B]' :
            'bg-[#F3F4F6] text-[#6B7280]'
          }`}>{hotel.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F3F4F6] rounded-xl p-3">
            <p className="text-xs text-[#9CA3AF] font-medium">Tipo</p>
            <p className="text-sm font-semibold text-[#1A1D26] mt-0.5">{hotel.tipo}</p>
          </div>
          <div className="bg-[#F3F4F6] rounded-xl p-3">
            <p className="text-xs text-[#9CA3AF] font-medium">Quartos</p>
            <p className="text-sm font-semibold text-[#1A1D26] mt-0.5">{hotel.numero_quartos || '-'}</p>
          </div>
          <div className="bg-[#F3F4F6] rounded-xl p-3">
            <p className="text-xs text-[#9CA3AF] font-medium">Diária média</p>
            <p className="text-sm font-semibold text-[#1A1D26] mt-0.5">R${hotel.ticket_medio_diaria || '-'}</p>
          </div>
          <div className="bg-[#F3F4F6] rounded-xl p-3">
            <p className="text-xs text-[#9CA3AF] font-medium">Posts gerados</p>
            <p className="text-sm font-semibold text-[#1A1D26] mt-0.5">{postsCount}</p>
          </div>
        </div>
        {hotel.instagram && (
          <p className="text-sm text-[#6B7280]">
            Instagram: <span className="text-[#B8860B] font-medium">{hotel.instagram}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Link href={`/dashboard/hoteis/${hotelId}/calendario`}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-4 hover:border-[#D1D5DB] hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1A1D26]">Calendário de Posts</h3>
            <p className="text-sm text-[#6B7280]">Ver e gerenciar posts agendados</p>
          </div>
          <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
