'use client'

import { useEffect, useState } from 'react'
import { getOwnedHotel } from './owner-actions'

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
  error: string | null
}

export function useCurrentHotel(): UseCurrentHotelResult {
  const [hotel, setHotel] = useState<CurrentHotel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function resolve() {
      try { const data=await getOwnedHotel(); if(!cancelled)setHotel(data) }
      catch(err){if(!cancelled){setHotel(null);setError(err instanceof Error?err.message:'Não foi possível carregar seu estabelecimento.')}}
      finally{if(!cancelled)setLoading(false)}
    }

    resolve()
    return () => { cancelled = true }
  }, [])

  return { hotel, hotelId: hotel?.id || null, loading, error }
}
