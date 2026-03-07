'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CalendarPost {
  id: string
  data_post: string
  tipo: string
  tema_especifico: string
  status: string
  hook: string
  legenda_completa: string
  hotel_id: string
}

interface ChecklistItem {
  id: string
  label: string
  done: boolean
  categoria: string
}

const CHECKLIST_SEMANAL: ChecklistItem[] = [
  { id: 'c1', label: 'Planejar posts da semana no calendario', done: false, categoria: 'planejamento' },
  { id: 'c2', label: 'Selecionar hooks para cada post', done: false, categoria: 'planejamento' },
  { id: 'c3', label: 'Gravar ou fotografar conteudo', done: false, categoria: 'producao' },
  { id: 'c4', label: 'Editar imagens/videos', done: false, categoria: 'producao' },
  { id: 'c5', label: 'Escrever legendas com CTAs claros', done: false, categoria: 'producao' },
  { id: 'c6', label: 'Agendar posts no Instagram', done: false, categoria: 'publicacao' },
  { id: 'c7', label: 'Responder comentarios e DMs', done: false, categoria: 'engajamento' },
  { id: 'c8', label: 'Curtir e comentar em perfis do nicho', done: false, categoria: 'engajamento' },
  { id: 'c9', label: 'Checar metricas: alcance e engajamento', done: false, categoria: 'analise' },
  { id: 'c10', label: 'Atualizar stories com reacao dos hospedes', done: false, categoria: 'reputacao' },
  { id: 'c11', label: 'Verificar link da bio esta atualizado', done: false, categoria: 'perfil' },
  { id: 'c12', label: 'Pedido de depoimento para hospedes da semana', done: false, categoria: 'reputacao' },
]

const CATEGORIA_COLOR: Record<string, string> = {
  planejamento: 'bg-blue-50 text-blue-700',
  producao: 'bg-violet-50 text-violet-700',
  publicacao: 'bg-[#FFF8E7] text-[#B8860B]',
  engajamento: 'bg-emerald-50 text-emerald-700',
  analise: 'bg-orange-50 text-orange-700',
  reputacao: 'bg-pink-50 text-pink-700',
  perfil: 'bg-[#F3F4F6] text-[#6B7280]',
}

const STATUS_COLOR: Record<string, string> = {
  rascunho: 'bg-[#F3F4F6] text-[#6B7280]',
  agendado: 'bg-[#FFF8E7] text-[#B8860B]',
  publicado: 'bg-emerald-50 text-emerald-700',
  cancelado: 'bg-red-50 text-red-600',
}

function getSemanaDates(): { date: Date; label: string }[] {
  const hoje = new Date()
  const dow = hoje.getDay()
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - dow)
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    return { date: d, label: dias[i] }
  })
}

export default function ExecucaoPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_SEMANAL)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const semana = getSemanaDates()
  const hoje = new Date()

  const storageKey = `execucao_checklist_${hoje.toISOString().slice(0, 10)}`

  useEffect(() => {
    // Restaura checklist do localStorage
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved)
        setChecklist(prev => prev.map(item => ({ ...item, done: ids.includes(item.id) })))
      } catch {}
    }
    load()
  }, [])

  async function load() {
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id')
      .eq('status', 'ativo')
      .limit(1)
      .single()

    if (hotelData) {
      setHotelId(hotelData.id)
      const inicioSemana = semana[0].date.toISOString().split('T')[0]
      const fimSemana = semana[6].date.toISOString().split('T')[0]
        const { data: postsData } = await supabase
        .from('calendarios_gerados')
        .select('id, data_post, tipo, tema_especifico, status, hook, legenda_completa, hotel_id')
        .eq('hotel_id', hotelData.id)
        .gte('data_post', inicioSemana)
        .lte('data_post', fimSemana)
        .order('data_post', { ascending: true })
      setPosts(postsData || [])
    }

    setLoading(false)
  }

  function toggleChecklist(id: string) {
    const updated = checklist.map(item => item.id === id ? { ...item, done: !item.done } : item)
    setChecklist(updated)
    const doneIds = updated.filter(i => i.done).map(i => i.id)
    localStorage.setItem(storageKey, JSON.stringify(doneIds))
  }

  async function marcarPostPublicado(postId: string) {
    await supabase
      .from('calendarios_gerados')
      .update({ status: 'publicado' })
      .eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'publicado' } : p))
    toast.success('Post marcado como publicado!')
  }

  const done = checklist.filter(i => i.done).length
  const total = checklist.length
  const progresso = Math.round((done / total) * 100)

  const categorias = [...new Set(checklist.map(i => i.categoria))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-5">

      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Tarefas da Semana</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Semana de {semana[0].date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} a {semana[6].date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Progresso */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-[#1A1D26]">Progresso Semanal</p>
          <span className="text-sm font-bold text-[#B8860B]">{done}/{total}</span>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-3">
          <div
            className="bg-[#B8860B] h-3 rounded-full transition-all duration-300"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1">{progresso}% completo</p>
      </div>

      {/* Posts da semana */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1A1D26]">Posts da Semana</h2>
          <span className="text-xs text-[#9CA3AF]">{posts.length} planejados</span>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3">
          {semana.map(({ date, label }, i) => {
            const dateStr = date.toISOString().split('T')[0]
            const postsNoDia = posts.filter(p => p.data_post === dateStr)
            const isHoje = date.toDateString() === hoje.toDateString()
            return (
              <div
                key={i}
                className={`flex flex-col items-center p-1.5 rounded-lg text-center ${isHoje ? 'bg-[#FFF8E7]' : 'bg-[#F8F9FB]'}`}
              >
                <span className="text-[9px] text-[#9CA3AF]">{label}</span>
                <span className={`text-xs font-bold mt-0.5 ${isHoje ? 'text-[#B8860B]' : 'text-[#1A1D26]'}`}>{date.getDate()}</span>
                {postsNoDia.length > 0 && (
                  <span className={`text-[9px] font-medium mt-0.5 ${
                    postsNoDia.some(p => p.status === 'publicado') ? 'text-emerald-600' : 'text-[#B8860B]'
                  }`}>{postsNoDia.length}x</span>
                )}
              </div>
            )
          })}
        </div>

        {posts.length > 0 ? (
          <div className="space-y-2">
            {posts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-[#F8F9FB] rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#1A1D26]">
                      {new Date(p.data_post + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-[#EFF6FF] text-blue-700 rounded">{p.tipo}</span>
                    {p.tema_especifico && <span className="text-xs text-[#9CA3AF]">{p.tema_especifico}</span>}
                  </div>
                  {(p.hook || p.legenda_completa) && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{p.hook || p.legenda_completa}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] || STATUS_COLOR.rascunho}`}>
                    {p.status}
                  </span>
                  {p.status !== 'publicado' && (
                    <button
                      onClick={() => marcarPostPublicado(p.id)}
                      className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                      Publicar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-[#9CA3AF]">
            Nenhum post planejado para esta semana
          </div>
        )}
      </div>

      {/* Checklist operacional */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Checklist Operacional</h2>

        {categorias.map(cat => (
          <div key={cat} className="mb-4">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${CATEGORIA_COLOR[cat]}`}>{cat}</span>
            </p>
            <div className="space-y-1.5">
              {checklist.filter(i => i.categoria === cat).map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8F9FB] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklist(item.id)}
                    className="w-4 h-4 rounded border-[#E5E7EB] text-[#B8860B] focus:ring-[#B8860B]/20 cursor-pointer"
                  />
                  <span className={`text-sm transition-all ${item.done ? 'line-through text-[#9CA3AF]' : 'text-[#1A1D26]'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
