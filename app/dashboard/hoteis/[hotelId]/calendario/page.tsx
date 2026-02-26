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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/dashboard/hoteis/${hotelId}`} className="text-zinc-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-xl font-bold">Calendario</h1>
      </div>

      {posts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <p className="text-zinc-400 mb-2">Nenhum post gerado ainda</p>
          <p className="text-sm text-zinc-500">Use o Gerador IA para criar o calendario deste hotel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                className="w-full p-4 text-left flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-500">{new Date(post.data_post + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.tipo === 'feed' ? 'bg-blue-500/10 text-blue-400' :
                      post.tipo === 'reel' ? 'bg-red-500/10 text-red-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>{post.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.status === 'aprovado' ? 'bg-green-500/10 text-green-400' :
                      post.status === 'publicado' ? 'bg-emerald-500/10 text-emerald-400' :
                      post.status === 'reprovado' ? 'bg-red-500/10 text-red-400' :
                      'bg-zinc-500/10 text-zinc-400'
                    }`}>{post.status}</span>
                  </div>
                  <p className="text-sm text-white truncate">{post.hook || post.categoria || 'Sem hook'}</p>
                </div>
                <svg className={`w-5 h-5 text-zinc-400 transition-transform ${expandedId === post.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedId === post.id && (
                <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
                  {post.hook && <div><p className="text-xs text-zinc-500 mb-1">Hook</p><p className="text-sm text-amber-400">{post.hook}</p></div>}
                  {post.legenda_completa && <div><p className="text-xs text-zinc-500 mb-1">Legenda</p><p className="text-sm text-zinc-300 whitespace-pre-line">{post.legenda_completa}</p></div>}
                  {post.cta && <div><p className="text-xs text-zinc-500 mb-1">CTA</p><p className="text-sm text-green-400">{post.cta}</p></div>}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div><p className="text-xs text-zinc-500 mb-1">Hashtags</p><p className="text-xs text-zinc-400">{post.hashtags.join(' ')}</p></div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {post.status === 'rascunho' && (
                      <>
                        <button onClick={() => updateStatus(post.id, 'aprovado')} className="flex-1 py-2.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30">Aprovar</button>
                        <button onClick={() => updateStatus(post.id, 'reprovado')} className="flex-1 py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30">Reprovar</button>
                      </>
                    )}
                    {post.status === 'aprovado' && (
                      <button onClick={() => updateStatus(post.id, 'publicado')} className="flex-1 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30">Marcar Publicado</button>
                    )}
                    <button onClick={() => { navigator.clipboard.writeText(`${post.hook}\n\n${post.legenda_completa}\n\n${post.cta}\n\n${(post.hashtags || []).join(' ')}`); toast.success('Copiado!') }}
                      className="px-4 py-2.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700">Copiar</button>
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
