'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
}

const ESTRATEGIAS = [
  { nome: 'Engajamento Direto', desc: 'Comente nos posts dos seguidores do concorrente com respostas genuínas e úteis', eficacia: 85, icon: '💬' },
  { nome: 'Conteúdo Superior', desc: 'Crie conteúdo melhor sobre os mesmos temas que o concorrente posta', eficacia: 90, icon: '📸' },
  { nome: 'Hashtags Compartilhadas', desc: 'Use as mesmas hashtags de nicho que o concorrente usa, mas com melhor conteúdo', eficacia: 70, icon: '#️⃣' },
  { nome: 'Collab com Seguidores', desc: 'Identifique micro-influencers que seguem o concorrente e proponha parcerias', eficacia: 75, icon: '🤝' },
  { nome: 'Resposta Rápida', desc: 'Quando seguidores reclamarem do concorrente, esteja pronto com solução', eficacia: 60, icon: '⚡' },
  { nome: 'Geo-Targeting', desc: 'Publique com geolocation em áreas que o concorrente atende', eficacia: 65, icon: '📍' },
]

export default function TargetingPage() {
  const [loading, setLoading] = useState(true)
  const [benchmarks, setBenchmarks] = useState<KBEntry[]>([])
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('knowledge_base')
        .select('id, titulo, conteudo')
        .eq('categoria', 'top_hoteis_benchmark')
        .order('titulo')
      setBenchmarks(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const selected = benchmarks.find(b => b.id === selectedBenchmark)

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Targeting de Seguidores de Concorrentes</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Analise audiência dos {benchmarks.length} hotéis benchmark e conquiste seus seguidores</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Concorrentes</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{benchmarks.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">monitorados</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Estratégias</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{ESTRATEGIAS.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">táticas disponíveis</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Oportunidade</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">~30%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">sobreposição estimada</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Potencial</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">+500</p>
          <p className="text-xs text-[#9CA3AF] mt-1">seguidores/mês</p>
        </div>
      </div>

      {/* Grid de concorrentes */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Hotéis Benchmark — Selecione para Análise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {benchmarks.map(b => {
            const conteudo = b.conteudo as Record<string, string | number>
            const isSelected = selectedBenchmark === b.id
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBenchmark(isSelected ? null : b.id)}
                className={`text-left rounded-xl p-4 transition-all ${
                  isSelected ? 'bg-[#FFF8E7] border-2 border-[#B8860B]' : 'bg-[#FAFBFC] border border-transparent hover:bg-[#F3F4F6]'
                }`}
              >
                <p className="font-semibold text-[#1A1D26] text-sm">{b.titulo}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {conteudo?.seguidores && (
                    <span className="text-xs text-[#6B7280]">{String(conteudo.seguidores)} seg.</span>
                  )}
                  {conteudo?.regiao && (
                    <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">{String(conteudo.regiao)}</span>
                  )}
                  {conteudo?.engajamento && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{String(conteudo.engajamento)}% eng.</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalhe do benchmark selecionado */}
      {selected && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Análise: {selected.titulo}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(selected.conteudo as Record<string, unknown>).slice(0, 8).map(([key, val]) => (
              <div key={key} className="bg-[#FAFBFC] rounded-xl p-3">
                <p className="text-xs text-[#9CA3AF] capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-medium text-[#1A1D26] mt-0.5">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#FFF8E7] rounded-xl p-4">
            <p className="text-xs font-medium text-[#B8860B] uppercase mb-2">Plano de ação sugerido:</p>
            <ol className="text-sm text-[#1A1D26] space-y-1 list-decimal list-inside">
              <li>Siga os 50 seguidores mais engajados deste hotel</li>
              <li>Comente genuinamente nos posts deles (não no concorrente)</li>
              <li>Poste conteúdo similar mas com qualidade superior</li>
              <li>Use as mesmas hashtags de nicho/localização</li>
              <li>Repita semanalmente e monitore conversões</li>
            </ol>
          </div>
        </div>
      )}

      {/* Estratégias de Targeting */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">6 Estratégias de Targeting</h2>
        <div className="space-y-3">
          {ESTRATEGIAS.map(est => (
            <div key={est.nome} className="flex items-start gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <span className="text-2xl">{est.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1A1D26]">{est.nome}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    est.eficacia >= 80 ? 'bg-emerald-50 text-emerald-700' :
                    est.eficacia >= 60 ? 'bg-[#FFF8E7] text-[#B8860B]' :
                    'bg-[#F3F4F6] text-[#6B7280]'
                  }`}>{est.eficacia}% eficácia</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">{est.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
