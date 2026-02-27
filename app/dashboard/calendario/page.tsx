'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PostCalendario {
  id: string
  data_post: string
  formato: string
  tema: string
  publico: string
  hook: string
  legenda_completa: string
  hashtags: string[]
  status: string
  hotel_id?: string
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const TEMAS = [
  'all_inclusive','aventura','bastidores','cafe_da_manha','casamento','checkin',
  'corporativo','datas_comemorativas','destino','experiencias','familia','fazenda',
  'gastronomia','noite','pet_friendly','piscina','por_do_sol','praia','promocoes',
  'quarto','romantico','serra','spa','sustentabilidade','ugc','workation',
]

const COR_FORMATO: Record<string, string> = {
  foto: 'bg-blue-400',
  carrossel: 'bg-emerald-400',
  reel: 'bg-purple-400',
}

export default function CalendarioPage() {
  const today = new Date()
  const [mes, setMes] = useState(today.getMonth())
  const [ano, setAno] = useState(today.getFullYear())
  const [posts, setPosts] = useState<PostCalendario[]>([])
  const [loading, setLoading] = useState(true)
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    data_post: '', tema: '', formato: 'foto', publico: 'misto',
    hook: '', legenda_completa: '', hashtags: '', status: 'rascunho',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function loadPosts() {
    setLoading(true)
    const firstDay = new Date(ano, mes, 1).toISOString().split('T')[0]
    const lastDay = new Date(ano, mes + 1, 0).toISOString().split('T')[0]
    const { data } = await supabase.from('calendarios_gerados')
      .select('*')
      .gte('data_post', firstDay)
      .lte('data_post', lastDay)
      .order('data_post')
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, [mes, ano])

  function navMes(dir: number) {
    const d = new Date(ano, mes + dir, 1)
    setMes(d.getMonth())
    setAno(d.getFullYear())
    setDiaSelecionado(null)
  }

  // Montar grid do mês
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]
  // Completar semana final
  while (cells.length % 7 !== 0) cells.push(null)

  function postsNoDia(dia: number) {
    const key = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return posts.filter(p => p.data_post === key)
  }

  function abrirCriar(dia: number) {
    const key = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    setForm(f => ({ ...f, data_post: key }))
    setShowModal(true)
  }

  async function salvarPost(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      data_post: form.data_post,
      tema: form.tema,
      formato: form.formato,
      publico: form.publico,
      hook: form.hook,
      legenda_completa: form.legenda_completa,
      hashtags: form.hashtags ? form.hashtags.split(/[\s,]+/).filter(Boolean) : [],
      status: form.status,
      tipo: form.formato,
      categoria: form.tema,
    }
    const { error } = await supabase.from('calendarios_gerados').insert(payload)
    if (error) {
      toast.error('Erro ao salvar post')
    } else {
      toast.success('Post criado!')
      setShowModal(false)
      setForm({ data_post: '', tema: '', formato: 'foto', publico: 'misto', hook: '', legenda_completa: '', hashtags: '', status: 'rascunho' })
      await loadPosts()
    }
    setSaving(false)
  }

  const postsDiaSelecionado = diaSelecionado ? postsNoDia(diaSelecionado) : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Calendário Editorial</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">{posts.length} posts em {MESES[mes]}</p>
        </div>
        <button
          onClick={() => { setForm(f => ({ ...f, data_post: '' })); setShowModal(true) }}
          className="px-4 py-2.5 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg text-sm transition-all"
        >
          + Criar Post
        </button>
      </div>

      {/* Navegação mês */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navMes(-1)} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-[#1A1D26]">{MESES[mes]} {ano}</h2>
          <button onClick={() => navMes(1)} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Cabeçalho dias semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs font-medium text-[#9CA3AF] py-1">{d}</div>
          ))}
        </div>

        {/* Grid dias */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-[#B8860B] border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((dia, idx) => {
              if (!dia) return <div key={idx} />
              const ps = postsNoDia(dia)
              const isToday = dia === today.getDate() && mes === today.getMonth() && ano === today.getFullYear()
              const isSelected = dia === diaSelecionado
              return (
                <button
                  key={idx}
                  onClick={() => setDiaSelecionado(isSelected ? null : dia)}
                  className={`min-h-[52px] p-1 rounded-xl text-left transition-all ${
                    isSelected ? 'bg-[#FFF8E7] border border-[#B8860B]' :
                    isToday ? 'bg-[#F3F4F6] border border-[#D1D5DB]' :
                    'hover:bg-[#F3F4F6] border border-transparent'
                  }`}
                >
                  <span className={`text-xs font-medium block text-center ${
                    isToday ? 'text-[#B8860B] font-bold' :
                    isSelected ? 'text-[#B8860B]' :
                    'text-[#6B7280]'
                  }`}>{dia}</span>
                  {ps.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                      {ps.slice(0, 3).map(p => (
                        <span key={p.id} className={`w-1.5 h-1.5 rounded-full ${COR_FORMATO[p.formato] || 'bg-[#9CA3AF]'}`} />
                      ))}
                      {ps.length > 3 && <span className="text-[8px] text-[#9CA3AF]">+{ps.length - 3}</span>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Legenda cores */}
        <div className="flex gap-4 mt-3 pt-3 border-t border-[#E5E7EB]">
          {Object.entries(COR_FORMATO).map(([fmt, cor]) => (
            <div key={fmt} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${cor}`} />
              <span className="text-xs text-[#9CA3AF] capitalize">{fmt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts do dia selecionado */}
      {diaSelecionado && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#1A1D26]">
              {String(diaSelecionado).padStart(2,'0')}/{String(mes+1).padStart(2,'0')}/{ano}
              <span className="text-sm font-normal text-[#9CA3AF] ml-2">({postsDiaSelecionado.length} posts)</span>
            </h2>
            <button
              onClick={() => abrirCriar(diaSelecionado)}
              className="text-sm text-[#B8860B] hover:text-[#DAA520] font-medium transition-colors"
            >
              + Adicionar
            </button>
          </div>

          {postsDiaSelecionado.length === 0 ? (
            <p className="text-sm text-[#9CA3AF] text-center py-4">Nenhum post neste dia</p>
          ) : (
            <div className="space-y-2">
              {postsDiaSelecionado.map(p => (
                <div key={p.id} className="flex items-start gap-3 p-3 bg-[#F3F4F6] rounded-xl">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${COR_FORMATO[p.formato] || 'bg-[#9CA3AF]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A1D26] truncate">{p.hook || p.tema || 'Post'}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[10px] text-[#9CA3AF] capitalize">{p.formato}</span>
                      <span className="text-[10px] text-[#9CA3AF] capitalize">{p.tema?.replace(/_/g,' ')}</span>
                      <span className={`text-[10px] px-1.5 py-0 rounded-full ${
                        p.status === 'aprovado' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'publicado' ? 'bg-green-50 text-green-700' :
                        'bg-[#E5E7EB] text-[#6B7280]'
                      }`}>{p.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal criar post */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="font-bold text-[#1A1D26]">Criar Post</h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#9CA3AF] hover:text-[#1A1D26]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={salvarPost} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Data</label>
                <input
                  type="date"
                  value={form.data_post}
                  onChange={e => setForm(f => ({ ...f, data_post: e.target.value }))}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Formato</label>
                  <select
                    value={form.formato}
                    onChange={e => setForm(f => ({ ...f, formato: e.target.value }))}
                    className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                  >
                    <option value="foto">Foto</option>
                    <option value="carrossel">Carrossel</option>
                    <option value="reel">Reel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Público</label>
                  <select
                    value={form.publico}
                    onChange={e => setForm(f => ({ ...f, publico: e.target.value }))}
                    className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                  >
                    <option value="misto">Misto</option>
                    <option value="casal">Casal</option>
                    <option value="familia">Família</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="solo">Solo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Tema</label>
                <select
                  value={form.tema}
                  onChange={e => setForm(f => ({ ...f, tema: e.target.value }))}
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                  required
                >
                  <option value="">Selecionar tema</option>
                  {TEMAS.map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Hook</label>
                <input
                  type="text"
                  value={form.hook}
                  onChange={e => setForm(f => ({ ...f, hook: e.target.value }))}
                  placeholder="Frase de abertura..."
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Legenda</label>
                <textarea
                  value={form.legenda_completa}
                  onChange={e => setForm(f => ({ ...f, legenda_completa: e.target.value }))}
                  rows={4}
                  placeholder="Texto do post..."
                  className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Hashtags</label>
                <input
                  type="text"
                  value={form.hashtags}
                  onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))}
                  placeholder="#hotel #viagem ..."
                  className="w-full h-11 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#E5E7EB] text-[#6B7280] rounded-lg text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white rounded-lg text-sm font-semibold transition-all"
                >
                  {saving ? 'Salvando...' : 'Criar Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
