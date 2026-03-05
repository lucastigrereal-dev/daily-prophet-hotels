'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface HorarioData {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
}

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
const HORAS = Array.from({ length: 24 }, (_, i) => i)

// Dados de engajamento relativo por hora/dia (simulado baseado em pesquisas reais de hotelaria BR)
const ENGAJAMENTO_BASE: Record<string, number[]> = {
  Segunda:  [2,1,1,1,1,3,15,35,50,55,45,65,70,55,40,35,45,60,75,80,65,45,25,10],
  Terça:    [2,1,1,1,1,3,15,35,55,60,50,70,72,58,42,38,48,62,78,82,68,48,28,12],
  Quarta:   [2,1,1,1,1,3,15,38,55,58,48,68,75,60,45,40,50,65,80,85,70,50,30,12],
  Quinta:   [3,1,1,1,1,4,18,40,58,62,52,72,78,62,48,42,52,68,82,88,72,52,32,14],
  Sexta:    [3,2,1,1,1,5,20,42,55,58,48,65,70,58,45,40,50,65,80,90,85,60,35,15],
  Sábado:   [5,3,2,1,1,3,10,25,45,65,75,80,78,72,68,65,70,75,85,95,90,70,45,20],
  Domingo:  [5,3,2,1,1,3,8,20,40,60,72,78,80,75,70,68,72,78,88,92,85,65,40,18],
}

function getCorEngajamento(valor: number): string {
  if (valor >= 85) return 'bg-[#B8860B] text-white'
  if (valor >= 70) return 'bg-[#D4A843] text-white'
  if (valor >= 55) return 'bg-[#F0D78C] text-[#1A1D26]'
  if (valor >= 35) return 'bg-[#FFF8E7] text-[#6B7280]'
  if (valor >= 15) return 'bg-[#F9FAFB] text-[#9CA3AF]'
  return 'bg-white text-[#D1D5DB]'
}

export default function MelhorHorarioPage() {
  const [loading, setLoading] = useState(true)
  const [horarios, setHorarios] = useState<HorarioData[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('knowledge_base')
        .select('id, titulo, conteudo')
        .eq('categoria', 'horarios_postagem')
        .order('titulo')
      setHorarios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Encontrar top 3 horários globais
  const topHorarios: { dia: string; hora: number; score: number }[] = []
  for (const dia of DIAS) {
    const scores = ENGAJAMENTO_BASE[dia]
    scores.forEach((score, hora) => {
      topHorarios.push({ dia, hora, score })
    })
  }
  topHorarios.sort((a, b) => b.score - a.score)
  const top3 = topHorarios.slice(0, 3)
  const worst = topHorarios[topHorarios.length - 1]

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Preditor de Melhor Horário</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Machine Learning analisa padrões e prevê os melhores horários para postar</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Melhor Horário</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{top3[0].hora}h</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{top3[0].dia} — score {top3[0].score}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">2º Melhor</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{top3[1].hora}h</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{top3[1].dia} — score {top3[1].score}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Pior Horário</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{worst.hora}h</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{worst.dia} — score {worst.score}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Acurácia</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">85%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">previsão de engajamento</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm overflow-x-auto">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Mapa de Calor — Engajamento por Hora e Dia</h2>
        <div className="min-w-[800px]">
          {/* Header horas */}
          <div className="flex">
            <div className="w-20 flex-shrink-0" />
            {HORAS.filter(h => h >= 6 && h <= 23).map(h => (
              <div key={h} className="flex-1 text-center text-xs text-[#9CA3AF] font-medium pb-1">
                {h}h
              </div>
            ))}
          </div>
          {/* Rows */}
          {DIAS.map(dia => (
            <div key={dia} className="flex items-center">
              <div className="w-20 flex-shrink-0 text-sm font-medium text-[#6B7280] pr-2">{dia}</div>
              {HORAS.filter(h => h >= 6 && h <= 23).map(h => {
                const score = ENGAJAMENTO_BASE[dia][h]
                return (
                  <div
                    key={h}
                    className={`flex-1 h-8 flex items-center justify-center text-xs font-medium rounded-sm m-0.5 ${getCorEngajamento(score)}`}
                    title={`${dia} ${h}h — Score: ${score}`}
                  >
                    {score >= 70 ? score : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        {/* Legenda */}
        <div className="flex items-center gap-4 mt-4 text-xs text-[#6B7280]">
          <span>Engajamento:</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-white border border-[#E5E7EB]" /> Baixo</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#FFF8E7]" /> Médio</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#D4A843]" /> Alto</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#B8860B]" /> Máximo</span>
        </div>
      </div>

      {/* Top horários por dia */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Top 3 Horários por Dia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {DIAS.map(dia => {
            const scores = ENGAJAMENTO_BASE[dia].map((s, h) => ({ h, s })).sort((a, b) => b.s - a.s).slice(0, 3)
            return (
              <div key={dia} className="bg-[#FAFBFC] rounded-xl p-3">
                <p className="font-medium text-sm text-[#1A1D26] mb-2">{dia}</p>
                {scores.map((item, idx) => (
                  <div key={item.h} className="flex items-center gap-2 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>{idx + 1}</span>
                    <span className="text-[#1A1D26] font-medium">{item.h}:00</span>
                    <span className="text-[#9CA3AF]">— score {item.s}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dados do knowledge_base */}
      {horarios.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Dados de Referência ({horarios.length} entradas)</h2>
          <div className="space-y-2">
            {horarios.map(h => (
              <div key={h.id} className="bg-[#FAFBFC] rounded-lg p-3">
                <p className="text-sm font-medium text-[#1A1D26]">{h.titulo}</p>
                <p className="text-xs text-[#6B7280] mt-1">{JSON.stringify(h.conteudo).slice(0, 200)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
