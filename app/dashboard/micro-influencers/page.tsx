'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Profile {
  id: string
  nome: string
  instagram: string
  seguidores: number
  engajamento: number
  nicho: string
  regiao: string
}

interface Collab {
  id: string
  influencer_nome: string
  tipo_parceria: string
  status: string
  alcance_estimado: number
  custo: number
}

const TEMPLATE_ABORDAGEM = `Olá [NOME]! 😊

Somos o [HOTEL] e adoramos o seu conteúdo sobre [NICHO]! ✨

Gostaríamos de propor uma parceria: uma estadia cortesia de [X] noites em troca de [ENTREGÁVEIS].

📸 Entregas sugeridas:
- 3 Stories mostrando o hotel
- 1 Reel no quarto/área comum
- 1 Post no feed com tag e localização

Topamos conversar sobre os detalhes? 💛

Abraços,
Equipe [HOTEL]`

const FAIXAS_SEGUIDORES = [
  { label: 'Nano (1k-10k)', min: 1000, max: 10000 },
  { label: 'Micro (10k-50k)', min: 10000, max: 50000 },
  { label: 'Mid (50k-100k)', min: 50000, max: 100000 },
]

export default function MicroInfluencersPage() {
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [collabs, setCollabs] = useState<Collab[]>([])
  const [filtroNicho, setFiltroNicho] = useState('')
  const [filtroRegiao, setFiltroRegiao] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [profRes, collabRes] = await Promise.all([
        supabase
          .from('portfolio_profiles')
          .select('id, nome, instagram, seguidores, engajamento, nicho, regiao')
          .order('engajamento', { ascending: false }),
        supabase
          .from('collabs')
          .select('id, influencer_nome, tipo_parceria, status, alcance_estimado, custo')
          .order('alcance_estimado', { ascending: false }),
      ])
      setProfiles(profRes.data || [])
      setCollabs(collabRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const nichos = [...new Set(profiles.map(p => p.nicho).filter(Boolean))]
  const regioes = [...new Set(profiles.map(p => p.regiao).filter(Boolean))]
  const filtradas = profiles.filter(p => {
    if (filtroNicho && p.nicho !== filtroNicho) return false
    if (filtroRegiao && p.regiao !== filtroRegiao) return false
    return true
  })

  const alcanceTotal = collabs.reduce((a, b) => a + (b.alcance_estimado || 0), 0)
  const collabsAtivas = collabs.filter(c => c.status === 'ativo' || c.status === 'confirmado').length

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast.success('Copiado!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Localizador de Micro-Influencers</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Encontre influencers ideais por nicho, região e engajamento — ROI 11x vs anúncios</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Perfis</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{profiles.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">influencers mapeados</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Collabs</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{collabsAtivas}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">parcerias ativas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alcance Total</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{alcanceTotal >= 1000 ? `${(alcanceTotal / 1000).toFixed(0)}k` : alcanceTotal}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">pessoas estimadas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">ROI Médio</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">11x</p>
          <p className="text-xs text-[#9CA3AF] mt-1">vs anúncios tradicionais</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltroNicho('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filtroNicho ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>Todos Nichos</button>
        {nichos.map(n => (
          <button key={n} onClick={() => setFiltroNicho(n)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filtroNicho === n ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{n}</button>
        ))}
        {regioes.length > 0 && (
          <>
            <span className="text-[#E5E7EB]">|</span>
            <button onClick={() => setFiltroRegiao('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filtroRegiao ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>Todas Regiões</button>
            {regioes.map(r => (
              <button key={r} onClick={() => setFiltroRegiao(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtroRegiao === r ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{r}</button>
            ))}
          </>
        )}
      </div>

      {/* Grid de perfis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtradas.map(profile => (
          <div key={profile.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#1A1D26]">{profile.nome}</h3>
                <p className="text-sm text-[#B8860B]">@{profile.instagram}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                profile.engajamento >= 5 ? 'bg-emerald-50 text-emerald-700' :
                profile.engajamento >= 3 ? 'bg-[#FFF8E7] text-[#B8860B]' :
                'bg-[#F3F4F6] text-[#6B7280]'
              }`}>{profile.engajamento}% eng.</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-[#FAFBFC] rounded-lg p-2 text-center">
                <p className="text-xs text-[#9CA3AF]">Seguidores</p>
                <p className="font-bold text-[#1A1D26]">{profile.seguidores >= 1000 ? `${(profile.seguidores / 1000).toFixed(1)}k` : profile.seguidores}</p>
              </div>
              <div className="bg-[#FAFBFC] rounded-lg p-2 text-center">
                <p className="text-xs text-[#9CA3AF]">Nicho</p>
                <p className="font-medium text-[#1A1D26] capitalize">{profile.nicho || '-'}</p>
              </div>
              <div className="bg-[#FAFBFC] rounded-lg p-2 text-center">
                <p className="text-xs text-[#9CA3AF]">Região</p>
                <p className="font-medium text-[#1A1D26]">{profile.regiao || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtradas.length === 0 && <p className="text-center text-[#9CA3AF] py-8">Nenhum perfil encontrado para estes filtros.</p>}

      {/* Faixas de seguidores */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Faixas Recomendadas para Hotéis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FAIXAS_SEGUIDORES.map(faixa => {
            const count = profiles.filter(p => p.seguidores >= faixa.min && p.seguidores < faixa.max).length
            return (
              <div key={faixa.label} className="bg-[#FAFBFC] rounded-xl p-4 text-center">
                <p className="text-sm font-medium text-[#1A1D26]">{faixa.label}</p>
                <p className="text-2xl font-bold text-[#B8860B] mt-1">{count}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">perfis mapeados</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Collabs existentes */}
      {collabs.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Parcerias Registradas</h2>
          <div className="space-y-2">
            {collabs.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-[#FAFBFC] rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1D26]">{c.influencer_nome}</p>
                  <p className="text-xs text-[#6B7280] capitalize">{c.tipo_parceria}</p>
                </div>
                <span className="text-xs text-[#9CA3AF]">{c.alcance_estimado >= 1000 ? `${(c.alcance_estimado / 1000).toFixed(0)}k alcance` : `${c.alcance_estimado} alcance`}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  c.status === 'ativo' || c.status === 'confirmado' ? 'bg-emerald-50 text-emerald-700' :
                  c.status === 'pendente' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-[#F3F4F6] text-[#6B7280]'
                }`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template de abordagem */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-3">Template de Abordagem</h2>
        <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed bg-[#FAFBFC] rounded-xl p-4">{TEMPLATE_ABORDAGEM}</pre>
        <button onClick={() => copiar(TEMPLATE_ABORDAGEM)} className="mt-3 px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#9A7209]">📋 Copiar Template</button>
      </div>
    </div>
  )
}
