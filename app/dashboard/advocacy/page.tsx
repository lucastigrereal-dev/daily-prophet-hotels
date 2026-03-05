'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Hotel {
  id: string
  nome: string
}

const FUNCIONARIOS_SIMULADOS = [
  { nome: 'Ana Oliveira', cargo: 'Recepção', posts: 12, alcance: 3400, pontos: 240, avatar: '👩' },
  { nome: 'Carlos Silva', cargo: 'Gerência', posts: 8, alcance: 5200, pontos: 180, avatar: '👨' },
  { nome: 'Maria Santos', cargo: 'Housekeeping', posts: 15, alcance: 2800, pontos: 300, avatar: '👩' },
  { nome: 'Pedro Lima', cargo: 'Cozinha', posts: 6, alcance: 1900, pontos: 120, avatar: '👨‍🍳' },
  { nome: 'Juliana Costa', cargo: 'Marketing', posts: 20, alcance: 8100, pontos: 400, avatar: '👩‍💼' },
  { nome: 'Roberto Alves', cargo: 'Manutenção', posts: 3, alcance: 600, pontos: 60, avatar: '👨‍🔧' },
]

const CONTEUDOS_SUGERIDOS = [
  { titulo: 'Bastidores do café da manhã', tipo: 'Story', desc: 'Filme a preparação do café mostrando frescor dos alimentos', pontos: 20 },
  { titulo: 'Antes e depois do quarto', tipo: 'Reel', desc: 'Transição rápida de quarto bagunçado → arrumado impecável', pontos: 30 },
  { titulo: 'Depoimento de hóspede', tipo: 'Post', desc: 'Peça para um hóspede dar depoimento rápido no checkout', pontos: 25 },
  { titulo: 'Tour pelo hotel', tipo: 'Reel', desc: 'Caminhe pelos espaços do hotel mostrando cada área', pontos: 35 },
  { titulo: 'Dica de passeio local', tipo: 'Carrossel', desc: 'Top 5 passeios na região recomendados pela equipe', pontos: 20 },
  { titulo: 'Apresentação da equipe', tipo: 'Story', desc: 'Cada funcionário se apresenta com uma curiosidade', pontos: 15 },
]

export default function AdvocacyPage() {
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('hotels').select('id, nome').limit(6)
      setHotels(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalPosts = FUNCIONARIOS_SIMULADOS.reduce((a, b) => a + b.posts, 0)
  const totalAlcance = FUNCIONARIOS_SIMULADOS.reduce((a, b) => a + b.alcance, 0)
  const funcionariosAtivos = FUNCIONARIOS_SIMULADOS.filter(f => f.posts > 0).length

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Employee Advocacy</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Mobilize sua equipe para amplificar o alcance — funcionários alcançam 10x mais que a página</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Equipe Ativa</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{funcionariosAtivos}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">de {FUNCIONARIOS_SIMULADOS.length} funcionários</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Posts Total</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{totalPosts}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">este mês</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Alcance Extra</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{(totalAlcance / 1000).toFixed(1)}k</p>
          <p className="text-xs text-[#9CA3AF] mt-1">pessoas atingidas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Amplificação</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">10x</p>
          <p className="text-xs text-[#9CA3AF] mt-1">vs página oficial</p>
        </div>
      </div>

      {/* Ranking de funcionários */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Ranking da Equipe</h2>
        <div className="space-y-2">
          {FUNCIONARIOS_SIMULADOS.sort((a, b) => b.pontos - a.pontos).map((func, idx) => (
            <div key={func.nome} className="flex items-center gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                idx < 3 ? 'bg-[#B8860B] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}>{idx + 1}</span>
              <span className="text-2xl">{func.avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A1D26]">{func.nome}</p>
                <p className="text-xs text-[#6B7280]">{func.cargo}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#B8860B]">{func.pontos} pts</p>
                <p className="text-xs text-[#9CA3AF]">{func.posts} posts • {func.alcance >= 1000 ? `${(func.alcance / 1000).toFixed(1)}k` : func.alcance} alcance</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdos sugeridos */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Conteúdos Sugeridos para a Equipe</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {CONTEUDOS_SUGERIDOS.map((c, idx) => (
            <div key={idx} className="bg-[#FAFBFC] rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-[#1A1D26] text-sm">{c.titulo}</p>
                  <span className="text-xs bg-[#FFF8E7] text-[#B8860B] px-2 py-0.5 rounded-full">{c.tipo}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">+{c.pontos} pts</span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">{c.desc}</p>
              <button onClick={() => copiar(c.desc)} className="mt-2 text-xs text-[#B8860B] font-medium hover:underline">📋 Copiar briefing</button>
            </div>
          ))}
        </div>
      </div>

      {/* Dicas */}
      <div className="bg-[#FFF8E7] border border-[#B8860B]/20 rounded-2xl p-4">
        <p className="text-sm text-[#1A1D26]"><span className="font-semibold">💡 Como funciona:</span> Cada post que o funcionário faz mencionando o hotel gera pontos. Os pontos podem ser trocados por folgas, bônus ou benefícios. Funciona como gamificação — o ranking motiva a equipe naturalmente.</p>
      </div>
    </div>
  )
}
