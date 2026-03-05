'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
  categoria: string
}

const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const MESES_CORES = [
  'border-l-blue-500', 'border-l-pink-500', 'border-l-purple-500',
  'border-l-emerald-500', 'border-l-green-600', 'border-l-yellow-500',
  'border-l-orange-500', 'border-l-red-500', 'border-l-amber-600',
  'border-l-teal-500', 'border-l-indigo-500', 'border-l-rose-500',
]

export default function SazonalPage() {
  const [loading, setLoading] = useState(true)
  const [sazonalidade, setSazonalidade] = useState<KBEntry[]>([])
  const [campanhas, setCampanhas] = useState<KBEntry[]>([])
  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth())
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: saz }, { data: camp }] = await Promise.all([
        supabase.from('knowledge_base').select('*').eq('categoria', 'sazonalidade').order('titulo'),
        supabase.from('knowledge_base').select('*').eq('categoria', 'templates_campanha').order('titulo'),
      ])
      setSazonalidade(saz || [])
      setCampanhas(camp || [])
      setLoading(false)
    }
    load()
  }, [])

  const mesAtual = new Date().getMonth()
  const proximosMeses = [mesAtual, (mesAtual + 1) % 12, (mesAtual + 2) % 12]

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Planejador Sazonal Inteligente</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">200+ datas comemorativas com conteúdo automático 7 dias antes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Meses Mapeados</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{sazonalidade.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com temas e datas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Campanhas</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{campanhas.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">templates prontos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Mês Atual</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{MESES_NOMES[mesAtual].slice(0, 3)}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{MESES_NOMES[mesAtual]} 2026</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Aproveitamento</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">100%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">vs 20% sem planejamento</p>
        </div>
      </div>

      {/* Calendário de meses */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Calendário Anual de Sazonalidade</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {MESES_NOMES.map((nome, idx) => (
            <button
              key={nome}
              onClick={() => setMesAtivo(idx)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mesAtivo === idx
                  ? 'bg-[#B8860B] text-white'
                  : proximosMeses.includes(idx)
                    ? 'bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/20'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {nome.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Detalhe do mês selecionado */}
        {sazonalidade.length > 0 && (
          <div className="space-y-3">
            {sazonalidade
              .filter(s => s.titulo.toLowerCase().includes(MESES_NOMES[mesAtivo].toLowerCase().slice(0, 3)))
              .map(s => (
                <div key={s.id} className={`border-l-4 ${MESES_CORES[mesAtivo]} bg-[#FAFBFC] rounded-r-xl p-4`}>
                  <p className="font-semibold text-[#1A1D26]">{s.titulo}</p>
                  <div className="mt-2 text-sm text-[#6B7280]">
                    {typeof s.conteudo === 'object' && s.conteudo !== null ? (
                      <div className="space-y-1">
                        {Object.entries(s.conteudo).map(([key, val]) => (
                          <div key={key}>
                            <span className="font-medium text-[#1A1D26] capitalize">{key.replace(/_/g, ' ')}: </span>
                            <span>{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{JSON.stringify(s.conteudo)}</p>
                    )}
                  </div>
                </div>
              ))}
            {sazonalidade.filter(s => s.titulo.toLowerCase().includes(MESES_NOMES[mesAtivo].toLowerCase().slice(0, 3))).length === 0 && (
              <p className="text-sm text-[#9CA3AF] italic">Dados de sazonalidade para {MESES_NOMES[mesAtivo]} serão carregados em breve.</p>
            )}
          </div>
        )}
      </div>

      {/* Templates de Campanha */}
      {campanhas.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Templates de Campanha ({campanhas.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {campanhas.map(c => (
              <div key={c.id} className="bg-[#FAFBFC] rounded-xl p-4">
                <p className="font-medium text-[#1A1D26]">{c.titulo}</p>
                <div className="mt-2 text-sm text-[#6B7280]">
                  {typeof c.conteudo === 'object' && c.conteudo !== null ? (
                    Object.entries(c.conteudo).slice(0, 5).map(([key, val]) => (
                      <p key={key}><span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>{typeof val === 'string' ? val : JSON.stringify(val)}</p>
                    ))
                  ) : (
                    <p>{JSON.stringify(c.conteudo).slice(0, 200)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
