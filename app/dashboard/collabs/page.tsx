'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Collab {
  id: string; hotel_id: string; tipo_pacote: string; valor_mensal: number
  data_inicio: string; status: string; perfis_instagram: string[]
  posts_mes_contratados: number; status_pagamento: string
  responsavel_hotel_nome: string; total_alcance_mes: number
}

export default function CollabsPage() {
  const [collabs, setCollabs] = useState<Collab[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('v_collabs_ativas').select('*').order('created_at', { ascending: false })
      setCollabs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalMRR = collabs.reduce((acc, c) => acc + (c.valor_mensal || 0), 0)

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Collabs</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">Collabs ativas</p>
          <p className="text-2xl font-bold text-green-400">{collabs.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500">MRR</p>
          <p className="text-2xl font-bold text-amber-400">R${totalMRR.toLocaleString()}</p>
        </div>
      </div>

      {collabs.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400">Nenhuma collab ativa</p>
          <p className="text-sm text-zinc-500 mt-1">Cadastre hoteis e feche parcerias</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collabs.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white">{c.responsavel_hotel_nome || 'Hotel'}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  c.status_pagamento === 'em_dia' ? 'bg-green-500/10 text-green-400' :
                  c.status_pagamento === 'atrasado' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>{c.status_pagamento}</span>
              </div>
              <p className="text-sm text-zinc-400">{c.tipo_pacote} — R${c.valor_mensal}/mes</p>
              <p className="text-xs text-zinc-500 mt-1">{c.posts_mes_contratados} posts/mes | {(c.perfis_instagram || []).join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
