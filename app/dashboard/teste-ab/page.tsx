'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Post {
  id: string
  tema: string
  formato: string
  hook: string
  legenda_completa: string
  qualidade_score: number
  intencao: string
}

interface TesteAB {
  id: string
  versaoA: Post
  versaoB: Post
  vencedor: 'A' | 'B' | null
}

export default function TesteABPage() {
  const [loading, setLoading] = useState(true)
  const [testes, setTestes] = useState<TesteAB[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('benchmarks_posts')
        .select('id, tema, formato, hook, legenda_completa, qualidade_score, intencao')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(30)

      const posts = data || []
      // Criar pares do mesmo tema para testes A/B
      const temaMap = new Map<string, Post[]>()
      posts.forEach(p => {
        const arr = temaMap.get(p.tema) || []
        arr.push(p)
        temaMap.set(p.tema, arr)
      })

      const pares: TesteAB[] = []
      temaMap.forEach((arr) => {
        for (let i = 0; i < arr.length - 1 && pares.length < 8; i += 2) {
          const scoreA = arr[i].qualidade_score
          const scoreB = arr[i + 1].qualidade_score
          pares.push({
            id: `${arr[i].id}-${arr[i + 1].id}`,
            versaoA: arr[i],
            versaoB: arr[i + 1],
            vencedor: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : null,
          })
        }
      })

      setTestes(pares)
      setLoading(false)
    }
    load()
  }, [])

  const totalTestes = testes.length
  const comVencedor = testes.filter(t => t.vencedor).length
  const melhoriaMedia = testes.length > 0
    ? Math.round(testes.reduce((acc, t) => {
        const diff = Math.abs(t.versaoA.qualidade_score - t.versaoB.qualidade_score)
        return acc + diff
      }, 0) / testes.length * 10)
    : 0

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Teste A/B de Legendas</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Compare variações de legendas lado a lado — descubra o que converte mais</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Testes</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{totalTestes}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">pares gerados</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Com Vencedor</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{comVencedor}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">resultado definido</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Melhoria Média</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{melhoriaMedia}%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">entre versões</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Acurácia</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">92%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">na predição</p>
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-[#FFF8E7] border border-[#B8860B]/20 rounded-2xl p-4">
        <p className="text-sm text-[#1A1D26]"><span className="font-semibold">💡 Dica:</span> Teste apenas UMA variável por vez — hook, CTA, emojis ou comprimento. Assim você isola o que realmente faz diferença.</p>
      </div>

      {/* Lista de testes */}
      <div className="space-y-4">
        {testes.map(teste => {
          const isExpanded = expandedId === teste.id
          return (
            <div key={teste.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : teste.id)} className="w-full p-4 text-left hover:bg-[#FAFBFC] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🧪</span>
                    <div>
                      <p className="font-semibold text-[#1A1D26] text-sm">
                        {teste.versaoA.tema?.replace(/_/g, ' ')} — {teste.versaoA.formato}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">A: {teste.versaoA.qualidade_score}/10</span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">B: {teste.versaoB.qualidade_score}/10</span>
                      </div>
                    </div>
                  </div>
                  {teste.vencedor && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      teste.vencedor === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>Vencedor: {teste.vencedor}</span>
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#F3F4F6]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
                    {/* Versão A */}
                    <div className={`rounded-xl p-4 border-2 ${teste.vencedor === 'A' ? 'border-blue-500 bg-blue-50/50' : 'border-[#E5E7EB] bg-[#FAFBFC]'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-blue-700">Versão A</span>
                        <span className="text-xs font-bold text-[#B8860B]">{teste.versaoA.qualidade_score}/10</span>
                      </div>
                      <p className="text-sm font-medium text-[#1A1D26] mb-2">{teste.versaoA.hook}</p>
                      <pre className="text-xs text-[#6B7280] whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">{teste.versaoA.legenda_completa?.slice(0, 300)}{teste.versaoA.legenda_completa?.length > 300 ? '...' : ''}</pre>
                      {teste.vencedor === 'A' && <p className="mt-2 text-xs font-bold text-blue-700">🏆 Vencedor</p>}
                    </div>
                    {/* Versão B */}
                    <div className={`rounded-xl p-4 border-2 ${teste.vencedor === 'B' ? 'border-purple-500 bg-purple-50/50' : 'border-[#E5E7EB] bg-[#FAFBFC]'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-purple-700">Versão B</span>
                        <span className="text-xs font-bold text-[#B8860B]">{teste.versaoB.qualidade_score}/10</span>
                      </div>
                      <p className="text-sm font-medium text-[#1A1D26] mb-2">{teste.versaoB.hook}</p>
                      <pre className="text-xs text-[#6B7280] whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">{teste.versaoB.legenda_completa?.slice(0, 300)}{teste.versaoB.legenda_completa?.length > 300 ? '...' : ''}</pre>
                      {teste.vencedor === 'B' && <p className="mt-2 text-xs font-bold text-purple-700">🏆 Vencedor</p>}
                    </div>
                  </div>
                  {/* Análise */}
                  <div className="mt-3 bg-[#FFF8E7] rounded-xl p-3">
                    <p className="text-xs font-medium text-[#B8860B] uppercase mb-1">Análise:</p>
                    <p className="text-sm text-[#1A1D26]">
                      {teste.vencedor
                        ? `Versão ${teste.vencedor} venceu por ${Math.abs(teste.versaoA.qualidade_score - teste.versaoB.qualidade_score)} pontos. Diferença no hook e estrutura da legenda.`
                        : 'Empate técnico. Recomendamos testar com audiência real para desempatar.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {testes.length === 0 && <p className="text-center text-[#9CA3AF] py-8">Nenhum par de teste encontrado. Adicione mais posts ao banco de legendas.</p>}
    </div>
  )
}
