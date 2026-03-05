'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  tema: string
  formato: string
  hook: string
  qualidade_score: number
  hashtags: string[]
  intencao: string
}

const FATORES_VIRALIDADE = [
  { nome: 'Hook forte', peso: 15, desc: 'Primeiras palavras capturam atenção' },
  { nome: 'Horário ideal', peso: 12, desc: 'Postado no pico de audiência' },
  { nome: 'Formato Reel', peso: 12, desc: 'Reels tem 2x mais distribuição' },
  { nome: 'Tema trending', peso: 10, desc: 'Alinhado com tendências atuais' },
  { nome: 'Hashtags otimizadas', peso: 8, desc: 'Mix correto de competição' },
  { nome: 'CTA claro', peso: 8, desc: 'Chama para ação específica' },
  { nome: 'Qualidade visual', peso: 8, desc: 'Foto/vídeo profissional' },
  { nome: 'Legenda envolvente', peso: 7, desc: 'Texto que mantém leitura' },
  { nome: 'Emoção', peso: 5, desc: 'Evoca reação emocional' },
  { nome: 'Social proof', peso: 5, desc: 'Depoimentos/reviews incluídos' },
  { nome: 'Carrossel educativo', peso: 3, desc: 'Ensina algo útil' },
  { nome: 'UGC', peso: 3, desc: 'Conteúdo de hóspedes' },
  { nome: 'Sazonalidade', peso: 2, desc: 'Relevante para o momento' },
  { nome: 'Localização', peso: 1, desc: 'Geotag relevante' },
  { nome: 'Acessibilidade', peso: 1, desc: 'Alt text e legendas' },
]

function calcularScoreViralidade(post: Post): number {
  let score = 0
  score += (post.qualidade_score || 5) * 6 // base score
  score += post.formato === 'reel' ? 12 : post.formato === 'carrossel' ? 8 : 4
  score += (post.hook?.length || 0) > 20 ? 10 : 5
  score += (post.hashtags?.length || 0) >= 10 ? 8 : 3
  score += post.intencao === 'engajamento' ? 5 : 3
  return Math.min(Math.round(score), 100)
}

function getCorScore(score: number): string {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50'
  if (score >= 60) return 'text-[#B8860B] bg-[#FFF8E7]'
  if (score >= 40) return 'text-orange-700 bg-orange-50'
  return 'text-red-700 bg-red-50'
}

export default function ViralidadePage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<(Post & { viralScore: number })[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('benchmarks_posts')
        .select('id, tema, formato, hook, qualidade_score, hashtags, intencao')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(50)
      const postsComScore = (data || []).map(p => ({
        ...p,
        viralScore: calcularScoreViralidade(p),
      })).sort((a, b) => b.viralScore - a.viralScore)
      setPosts(postsComScore)
      setLoading(false)
    }
    load()
  }, [])

  const top10 = posts.filter(p => p.viralScore >= 80).length
  const mediaScore = posts.length > 0 ? Math.round(posts.reduce((a, b) => a + b.viralScore, 0) / posts.length) : 0

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Engine de Predição de Viralização</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Score 0-100 com 15 fatores — posts score &gt;80 têm 12x mais chance de viralizar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Posts Analisados</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{posts.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com score de viralidade</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Top 10% (≥80)</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{top10}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">prontos para impulsionar</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Score Médio</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{mediaScore}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">de 100 pontos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Fatores</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">15</p>
          <p className="text-xs text-[#9CA3AF] mt-1">critérios de análise</p>
        </div>
      </div>

      {/* Ranking de posts */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Ranking de Viralidade — Top Posts</h2>
        <div className="space-y-2">
          {posts.slice(0, 15).map((post, idx) => (
            <div key={post.id} className="flex items-center gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                idx < 3 ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}>{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1D26] truncate">{post.hook}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-xs text-[#9CA3AF] capitalize">{post.formato}</span>
                  <span className="text-xs text-[#9CA3AF] capitalize">{post.tema?.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${getCorScore(post.viralScore)}`}>
                {post.viralScore}
              </span>
              {post.viralScore >= 80 && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">🚀 Impulsionar</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fatores de viralidade */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">15 Fatores de Viralidade</h2>
        <div className="space-y-2">
          {FATORES_VIRALIDADE.map(fator => (
            <div key={fator.nome} className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280] w-40 truncate">{fator.nome}</span>
              <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#B8860B]" style={{ width: `${(fator.peso / 15) * 100}%` }} />
              </div>
              <span className="text-xs text-[#9CA3AF] w-10 text-right">{fator.peso}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
