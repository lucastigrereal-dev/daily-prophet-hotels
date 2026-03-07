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

interface WeeklyTask {
  id: string
  task_key: string
  label: string
  categoria: string
  done: boolean
}

const CHECKLIST_TEMPLATE = [
  { task_key: 'c1', label: 'Planejar posts da semana no calendario', categoria: 'planejamento' },
  { task_key: 'c2', label: 'Selecionar hooks para cada post', categoria: 'planejamento' },
  { task_key: 'c3', label: 'Gravar ou fotografar conteudo', categoria: 'producao' },
  { task_key: 'c4', label: 'Editar imagens/videos', categoria: 'producao' },
  { task_key: 'c5', label: 'Escrever legendas com CTAs claros', categoria: 'producao' },
  { task_key: 'c6', label: 'Agendar posts no Instagram', categoria: 'publicacao' },
  { task_key: 'c7', label: 'Responder comentarios e DMs', categoria: 'engajamento' },
  { task_key: 'c8', label: 'Curtir e comentar em perfis do nicho', categoria: 'engajamento' },
  { task_key: 'c9', label: 'Checar metricas: alcance e engajamento', categoria: 'analise' },
  { task_key: 'c10', label: 'Atualizar stories com reacao dos hospedes', categoria: 'reputacao' },
  { task_key: 'c11', label: 'Verificar link da bio esta atualizado', categoria: 'perfil' },
  { task_key: 'c12', label: 'Pedido de depoimento para hospedes da semana', categoria: 'reputacao' },
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

function getSemanaInicio(): string {
  const hoje = new Date()
  const dow = hoje.getDay()
  const inicio = new Date(hoje)
  inicio.setDate(hoje.getDate() - dow)
  return inicio.toISOString().split('T')[0]
}

export default function ExecucaoPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<CalendarPost[]>([])
  const [tasks, setTasks] = useState<WeeklyTask[]>([])
  const [hotelId, setHotelId] = useState<string | null>(null)
  const semana = getSemanaDates()
  const hoje = new Date()
  const semanaInicio = getSemanaInicio()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: hotelData } = await supabase
      .from('hotels')
      .select('id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!hotelData) { setLoading(false); return }

    setHotelId(hotelData.id)

    // Posts da semana
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

    // Tarefas da semana — busca ou cria
    const { data: existingTasks } = await supabase
      .from('hotel_weekly_tasks')
      .select('id, task_key, label, categoria, done')
      .eq('hotel_id', hotelData.id)
      .eq('semana_inicio', semanaInicio)

    if (existingTasks && existingTasks.length > 0) {
      setTasks(existingTasks)
    } else {
      // Cria tarefas da semana no banco
      const newTasks = CHECKLIST_TEMPLATE.map(t => ({
        hotel_id: hotelData.id,
        semana_inicio: semanaInicio,
        task_key: t.task_key,
        label: t.label,
        categoria: t.categoria,
        done: false,
      }))
      const { data: inserted } = await supabase
        .from('hotel_weekly_tasks')
        .insert(newTasks)
        .select('id, task_key, label, categoria, done')
      setTasks(inserted || [])
    }

    setLoading(false)
  }

  async function toggleTask(taskId: string) {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: newDone } : t))

    await supabase
      .from('hotel_weekly_tasks')
      .update({ done: newDone, done_at: newDone ? new Date().toISOString() : null })
      .eq('id', taskId)

    // Log de execucao
    if (newDone && hotelId) {
      await supabase.from('hotel_execution_log').insert({
        hotel_id: hotelId,
        acao: `tarefa_concluida:${task.task_key}`,
        categoria: task.categoria === 'planejamento' ? 'planejamento' : task.categoria === 'engajamento' ? 'engajamento' : 'conteudo',
        detalhes: { task_key: task.task_key, label: task.label },
      })
    }
  }

  async function marcarPostPublicado(postId: string) {
    await supabase
      .from('calendarios_gerados')
      .update({ status: 'publicado' })
      .eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'publicado' } : p))
    toast.success('Post marcado como publicado!')

    if (hotelId) {
      await supabase.from('hotel_execution_log').insert({
        hotel_id: hotelId,
        acao: 'post_publicado',
        categoria: 'conteudo',
        detalhes: { post_id: postId },
        pontos: 3,
      })
    }
  }

  const done = tasks.filter(i => i.done).length
  const total = tasks.length
  const progresso = total > 0 ? Math.round((done / total) * 100) : 0
  const categorias = [...new Set(tasks.map(i => i.categoria))]

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
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${CATEGORIA_COLOR[cat] || ''}`}>{cat}</span>
            </p>
            <div className="space-y-1.5">
              {tasks.filter(i => i.categoria === cat).map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#F8F9FB] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleTask(item.id)}
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
