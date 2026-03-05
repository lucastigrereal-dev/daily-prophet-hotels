'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface StoryTemplate {
  id: string
  tema: string
  hook: string
  legenda_completa: string
  hashtags: string[]
  intencao: string
  publico: string
  qualidade_score: number
}

const TIPOS_STORY = ['bom_dia', 'enquete', 'quiz', 'promo', 'countdown', 'ugc', 'bastidores', 'dica']

export default function StoriesPage() {
  const [loading, setLoading] = useState(true)
  const [stories, setStories] = useState<StoryTemplate[]>([])
  const [filtro, setFiltro] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('benchmarks_posts')
        .select('id, tema, hook, legenda_completa, hashtags, intencao, publico, qualidade_score')
        .eq('formato', 'story')
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
      setStories(data || [])
      setLoading(false)
    }
    load()
  }, [])

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast.success('Texto copiado!')
  }

  const temas = [...new Set(stories.map(s => s.tema).filter(Boolean))]
  const filtradas = filtro ? stories.filter(s => s.tema === filtro) : stories

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Gerador de Stories Profissionais</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">50+ templates prontos — economize R$ 6.000-18.000/ano em designer</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Templates</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{stories.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">stories prontos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Temas</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{temas.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">categorias</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Economia</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">R$12k</p>
          <p className="text-xs text-[#9CA3AF] mt-1">por ano estimado</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Velocidade</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">30s</p>
          <p className="text-xs text-[#9CA3AF] mt-1">para publicar</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltro('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filtro ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>Todos</button>
        {temas.map(t => (
          <button key={t} onClick={() => setFiltro(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filtro === t ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>{t.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {/* Grid de Stories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtradas.map(story => {
          const isExpanded = expandedId === story.id
          return (
            <div key={story.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : story.id)} className="w-full p-4 text-left hover:bg-[#FAFBFC] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-[#1A1D26] text-sm">{story.hook}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-[#FFF8E7] text-[#B8860B] px-2 py-0.5 rounded-full capitalize">{story.tema?.replace(/_/g, ' ')}</span>
                      <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full capitalize">{story.intencao}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#B8860B]">{story.qualidade_score}/10</span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#F3F4F6]">
                  <div className="mt-3 bg-[#FAFBFC] rounded-xl p-4">
                    <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed">{story.legenda_completa}</pre>
                  </div>
                  {story.hashtags && story.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {story.hashtags.map((h, i) => <span key={i} className="text-xs text-[#6B7280]">{h}</span>)}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => copiar(story.legenda_completa)} className="px-3 py-1.5 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:bg-[#9A7209]">📋 Copiar Legenda</button>
                    {story.hashtags?.length > 0 && (
                      <button onClick={() => copiar(story.hashtags.join(' '))} className="px-3 py-1.5 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium rounded-lg hover:bg-[#E5E7EB]"># Copiar Hashtags</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {filtradas.length === 0 && <p className="text-center text-[#9CA3AF] py-8">Nenhum template de story encontrado para este filtro.</p>}
    </div>
  )
}
