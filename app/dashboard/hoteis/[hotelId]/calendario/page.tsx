'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface Post {
  id: string; data_post: string; tipo: string; categoria: string
  hook: string; legenda_completa: string; cta: string
  hashtags: string[]; status: string; horario_sugerido: string
}

export default function HotelCalendarioPage() {
  const { hotelId } = useParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('calendarios_gerados')
        .select('*').eq('hotel_id', hotelId).order('data_post', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [hotelId])

  async function updateStatus(postId: string, newStatus: string) {
    const { error } = await supabase.from('calendarios_gerados')
      .update({ status: newStatus, ...(newStatus === 'aprovado' ? { aprovado_em: new Date().toISOString() } : {}) })
      .eq('id', postId)
    if (error) { toast.error('Erro ao atualizar'); return }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p))
    toast.success(`Post ${newStatus}`)
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/hoteis/${hotelId}`} className="text-[#6B7280] hover:text-[#1A1D26] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[#1A1D26]">Calendário do Hotel</h1>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-sm">
          <p className="text-[#6B7280] mb-2">Nenhum post gerado ainda</p>
          <p className="text-sm text-[#9CA3AF]">Use o Gerador IA para criar o calendário deste hotel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-[#F3F4F6] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(post.data_post + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.tipo === 'feed' ? 'bg-blue-50 text-blue-700' :
                      post.tipo === 'reel' ? 'bg-red-50 text-red-600' :
                      'bg-purple-50 text-purple-700'
                    }`}>{post.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === 'aprovado' ? 'bg-emerald-50 text-emerald-700' :
                      post.status === 'publicado' ? 'bg-green-50 text-green-700' :
                      post.status === 'reprovado' ? 'bg-red-50 text-red-600' :
                      'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>{post.status}</span>
                  </div>
                  <p className="text-sm text-[#1A1D26] truncate">{post.hook || post.categoria || 'Sem hook'}</p>
                </div>
                <svg className={`w-5 h-5 text-[#9CA3AF] transition-transform ${expandedId === post.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === post.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#E5E7EB] pt-3">
                  {post.hook && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1 font-medium uppercase tracking-wide">Hook</p>
                      <p className="text-sm text-[#B8860B] font-medium">{post.hook}</p>
                    </div>
                  )}
                  {post.legenda_completa && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1 font-medium uppercase tracking-wide">Legenda</p>
                      <p className="text-sm text-[#374151] whitespace-pre-line">{post.legenda_completa}</p>
                    </div>
                  )}
                  {post.cta && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1 font-medium uppercase tracking-wide">CTA</p>
                      <p className="text-sm text-emerald-700 font-medium">{post.cta}</p>
                    </div>
                  )}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1 font-medium uppercase tracking-wide">Hashtags</p>
                      <p className="text-xs text-[#6B7280]">{post.hashtags.join(' ')}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {post.status === 'rascunho' && (
                      <>
                        <button onClick={() => updateStatus(post.id, 'aprovado')}
                          className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                          Aprovar
                        </button>
                        <button onClick={() => updateStatus(post.id, 'reprovado')}
                          className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                          Reprovar
                        </button>
                      </>
                    )}
                    {post.status === 'aprovado' && (
                      <button onClick={() => updateStatus(post.id, 'publicado')}
                        className="flex-1 py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                        Marcar Publicado
                      </button>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${post.hook}\n\n${post.legenda_completa}\n\n${post.cta}\n\n${(post.hashtags || []).join(' ')}`)
                        toast.success('Copiado!')
                      }}
                      className="px-4 py-2.5 bg-[#F3F4F6] text-[#6B7280] rounded-lg text-sm hover:bg-[#E5E7EB] transition-colors">
                      Copiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
