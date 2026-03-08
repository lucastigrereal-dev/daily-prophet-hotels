'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CurrentHotel {
  id: string
  nome: string
  cidade: string
  estado: string
  tipo: string
  status: string
  instagram: string | null
  onboarding_completo: boolean
  cor: string | null
  numero_quartos: number | null
  classificacao: number | null
}

interface UseCurrentHotelResult {
  hotel: CurrentHotel | null
  hotelId: string | null
  loading: boolean
}

export function useCurrentHotel(): UseCurrentHotelResult {
  const supabase = createClient()
  const [hotel, setHotel] = useState<CurrentHotel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('hotels')
        .select('id, nome, cidade, estado, tipo, status, instagram, onboarding_completo, cor, numero_quartos, classificacao')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!cancelled) {
        setHotel(data || null)
        setLoading(false)
      }
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return { hotel, hotelId: hotel?.id || null, loading }
}
