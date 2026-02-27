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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#1A1D26]">Collabs</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">Collabs ativas</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{collabs.length}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">MRR</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">R${totalMRR.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {collabs.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#6B7280]">Nenhuma collab ativa</p>
          <p className="text-sm text-[#9CA3AF] mt-1">Cadastre hotéis e feche parcerias</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collabs.map(c => (
            <div key={c.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-[#1A1D26]">{c.responsavel_hotel_nome || 'Hotel'}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.status_pagamento === 'em_dia' ? 'bg-emerald-50 text-emerald-700' :
                  c.status_pagamento === 'atrasado' ? 'bg-red-50 text-red-600' :
                  'bg-[#FFF8E7] text-[#B8860B]'
                }`}>{c.status_pagamento}</span>
              </div>
              <p className="text-sm text-[#6B7280]">{c.tipo_pacote} — R${c.valor_mensal}/mês</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{c.posts_mes_contratados} posts/mês | {(c.perfis_instagram || []).join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
