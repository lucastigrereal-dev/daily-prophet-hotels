'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ReelTemplate {
  id: string
  tema: string
  hook: string
  legenda_completa: string
  roteiro_reel: Record<string, unknown> | null
  qualidade_score: number
  hashtags: string[]
}

export default function EditorVideoPage() {
  const [loading, setLoading] = useState(true)
  const [reels, setReels] = useState<ReelTemplate[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('benchmarks_posts')
        .select('id, tema, hook, legenda_completa, roteiro_reel, qualidade_score, hashtags')
        .eq('formato', 'reel')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
      setReels(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const comRoteiro = reels.filter(r => r.roteiro_reel)

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Editor de Vídeos / Reels</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Templates de Reel com roteiro completo — economize R$ 2.400/mês em editor</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Reels</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{reels.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">templates disponíveis</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Com Roteiro</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{comRoteiro.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">roteiro cena a cena</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Economia</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">R$2.4k</p>
          <p className="text-xs text-[#9CA3AF] mt-1">por mês em editor</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alcance</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">2x</p>
          <p className="text-xs text-[#9CA3AF] mt-1">mais que foto estática</p>
        </div>
      </div>

      {/* Grid de Reels */}
      <div className="space-y-4">
        {reels.map(reel => {
          const isExpanded = expandedId === reel.id
          return (
            <div key={reel.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : reel.id)} className="w-full p-4 text-left hover:bg-[#FAFBFC] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎬</span>
                      <p className="font-semibold text-[#1A1D26]">{reel.hook}</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Reel</span>
                      <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full capitalize">{reel.tema?.replace(/_/g, ' ')}</span>
                      {reel.roteiro_reel && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Com Roteiro</span>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#B8860B]">{reel.qualidade_score}/10</span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#F3F4F6] space-y-3">
                  {/* Legenda */}
                  <div className="mt-3">
                    <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-1">Legenda:</p>
                    <div className="bg-[#FAFBFC] rounded-xl p-3">
                      <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed">{reel.legenda_completa}</pre>
                    </div>
                  </div>
                  {/* Roteiro */}
                  {reel.roteiro_reel && (
                    <div>
                      <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-1">Roteiro Cena a Cena:</p>
                      <div className="bg-purple-50 rounded-xl p-3">
                        {typeof reel.roteiro_reel === 'object' && !Array.isArray(reel.roteiro_reel) ? (
                          <div className="space-y-2">
                            {Object.entries(reel.roteiro_reel).map(([key, val]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-xs font-bold text-purple-700 uppercase min-w-[80px]">{key}:</span>
                                <span className="text-sm text-[#1A1D26]">{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                              </div>
                            ))}
                          </div>
                        ) : Array.isArray(reel.roteiro_reel) ? (
                          <div className="space-y-1">
                            {(reel.roteiro_reel as unknown[]).map((cena, idx) => (
                              <div key={idx} className="flex gap-2">
                                <span className="text-xs font-bold text-purple-700">Cena {idx + 1}:</span>
                                <span className="text-sm text-[#1A1D26]">{typeof cena === 'string' ? cena : JSON.stringify(cena)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans">{JSON.stringify(reel.roteiro_reel, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Hashtags */}
                  {reel.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {reel.hashtags.map((h, i) => <span key={i} className="text-xs text-[#6B7280]">{h}</span>)}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => copiar(reel.legenda_completa)} className="px-3 py-1.5 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:bg-[#9A7209]">📋 Copiar Legenda</button>
                    {reel.roteiro_reel && (
                      <button onClick={() => copiar(JSON.stringify(reel.roteiro_reel, null, 2))} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700">🎬 Copiar Roteiro</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {reels.length === 0 && <p className="text-center text-[#9CA3AF] py-8">Nenhum template de reel encontrado.</p>}
    </div>
  )
}
