'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { TEMAS, TEMA_LABEL, OBJETIVOS, OBJETIVO_LABEL, SAZONALIDADES, SAZONALIDADE_LABEL } from '@/lib/content/taxonomy'

type Tab = 'legendas' | 'templates' | 'hooks'

interface Legenda {
  id: string; tema: string; formato: string; publico: string
  intencao: string; hook: string; legenda_completa: string
  cta: string; hashtags: string[]; qualidade_score: number
}

interface Hook {
  id: string; hook: string; numero: number; publico: string; intencao: string; tema: string
}

interface Template {
  id: string; nome: string; descricao: string; estrutura: string; objetivo: string
}

export default function GeradorPage() {
  const [tab, setTab] = useState<Tab>('legendas')
  const [legendas, setLegendas] = useState<Legenda[]>([])
  const [totalLegendas, setTotalLegendas] = useState(0)
  const [hooks, setHooks] = useState<Hook[]>([])
  const [totalHooks, setTotalHooks] = useState(0)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  // Filtros legendas
  const [tema, setTema] = useState('')
  const [publico, setPublico] = useState('')
  const [formato, setFormato] = useState('')
  const [intencao, setIntencao] = useState('')
  const [busca, setBusca] = useState('')
  const [qualidadeMin, setQualidadeMin] = useState(1)

  // Filtros hooks
  const [hookTema, setHookTema] = useState('')
  const [hookPublico, setHookPublico] = useState('')
  const [hookPage, setHookPage] = useState(0)

  const supabase = createClient()

  // -------- Carregar legendas --------
  const loadLegendas = useCallback(async (p: number = 0) => {
    setLoading(true)
    let q = supabase.from('benchmarks_posts').select('*', { count: 'exact' }).eq('ativo', true)
    if (tema) q = q.eq('tema', tema)
    if (publico) q = q.eq('publico', publico)
    if (formato) q = q.eq('formato', formato)
    if (intencao) q = q.ilike('intencao', `%${intencao}%`)
    if (busca) q = q.ilike('legenda_completa', `%${busca}%`)
    if (qualidadeMin > 1) q = q.gte('qualidade_score', qualidadeMin)
    q = q.order('qualidade_score', { ascending: false }).range(p * 20, (p + 1) * 20 - 1)
    const { data, count } = await q
    setLegendas(data || [])
    setTotalLegendas(count || 0)
    setPage(p)
    setLoading(false)
  }, [tema, publico, formato, intencao, busca, qualidadeMin])

  // -------- Carregar hooks --------
  const loadHooks = useCallback(async (p: number = 0) => {
    setLoading(true)
    let q = supabase.from('hooks').select('*', { count: 'exact' })
    if (hookTema) q = q.eq('tema', hookTema)
    if (hookPublico) q = q.eq('publico', hookPublico)
    q = q.range(p * 50, (p + 1) * 50 - 1)
    const { data, count } = await q
    setHooks(data || [])
    setTotalHooks(count || 0)
    setHookPage(p)
    setLoading(false)
  }, [hookTema, hookPublico])

  // -------- Carregar templates --------
  async function loadTemplates() {
    setLoading(true)
    const { data } = await supabase.from('caption_templates').select('*')
    setTemplates(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'legendas') loadLegendas(0)
    else if (tab === 'hooks') loadHooks(0)
    else if (tab === 'templates') loadTemplates()
  }, [tab])

  useEffect(() => { loadTemplates() }, [])

  function aplicarFiltros() {
    setExpandedId(null)
    loadLegendas(0)
  }

  function copiarLegenda(l: Legenda) {
    navigator.clipboard.writeText(`${l.hook}\n\n${l.legenda_completa}\n\n${l.cta || ''}\n\n${(l.hashtags || []).join(' ')}`.trim())
    toast.success('Legenda copiada!')
  }

  function copiarHook(h: Hook) {
    navigator.clipboard.writeText(h.hook)
    toast.success('Hook copiado!')
  }

  const totalPaginas = Math.ceil(totalLegendas / 20)
  const totalPaginasHooks = Math.ceil(totalHooks / 50)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Gerador de Legendas</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Biblioteca completa de conteúdo para hotéis</p>
        </div>
        <span className="bg-[#FFF8E7] text-[#B8860B] text-xs font-semibold px-3 py-1.5 rounded-full">
          {totalLegendas.toLocaleString('pt-BR')} legendas
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl w-fit">
        {([
          { id: 'legendas', label: 'Legendas' },
          { id: 'templates', label: `Templates (${templates.length || '...'})` },
          { id: 'hooks', label: `Hooks (${totalHooks || '1.000'})` },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setExpandedId(null) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-[#1A1D26] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A1D26]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== TAB LEGENDAS ====== */}
      {tab === 'legendas' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Tema</label>
                <select
                  value={tema}
                  onChange={e => setTema(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                >
                  <option value="">Todos os temas</option>
                  {TEMAS.map(t => <option key={t} value={t}>{TEMA_LABEL[t] || t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Buscar texto</label>
                <input
                  type="text"
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && aplicarFiltros()}
                  placeholder="Palavra-chave na legenda..."
                  className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Intenção</label>
                <input
                  type="text"
                  value={intencao}
                  onChange={e => setIntencao(e.target.value)}
                  placeholder="ex: vender, engajar..."
                  className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                />
              </div>
            </div>

            {/* Pills público */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#9CA3AF] font-medium">Público:</span>
              {['','misto','casal','familia','corporativo','solo'].map(p => (
                <button
                  key={p}
                  onClick={() => setPublico(p)}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    publico === p
                      ? 'bg-[#B8860B] text-white font-semibold'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {p || 'Todos'}
                </button>
              ))}
            </div>

            {/* Pills formato */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#9CA3AF] font-medium">Formato:</span>
              {['','foto','carrossel','reel'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormato(f)}
                  className={`text-xs px-3 py-1 rounded-full transition-all ${
                    formato === f
                      ? 'bg-[#B8860B] text-white font-semibold'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {f || 'Todos'}
                </button>
              ))}
            </div>

            {/* Qualidade mínima */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#6B7280]">Qualidade mínima:</span>
              <input
                type="range"
                min={1}
                max={10}
                value={qualidadeMin}
                onChange={e => setQualidadeMin(Number(e.target.value))}
                className="flex-1 max-w-[200px] accent-[#B8860B]"
              />
              <span className="text-sm font-bold text-[#B8860B] w-6">{qualidadeMin}</span>
            </div>

            <button
              onClick={aplicarFiltros}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg text-sm transition-all"
            >
              Filtrar
            </button>
          </div>

          {/* Resultado */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <p className="text-sm text-[#6B7280]">
                {totalLegendas.toLocaleString('pt-BR')} resultados
                {(tema || publico || formato || busca) ? ' com filtros ativos' : ''}
              </p>

              <div className="space-y-3">
                {legendas.map(l => (
                  <div key={l.id} className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                    <button
                      onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] capitalize">{l.tema.replace(/_/g,' ')}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">{l.formato}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] capitalize">{l.publico}</span>
                          </div>
                          <p className="text-sm font-semibold text-[#1A1D26] line-clamp-1">{l.hook}</p>
                          <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{l.legenda_completa}</p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                              <div className="h-full bg-[#B8860B] rounded-full" style={{ width: `${(l.qualidade_score / 10) * 100}%` }} />
                            </div>
                            <span className="text-xs font-bold text-[#B8860B]">{l.qualidade_score}</span>
                          </div>
                          <svg className={`w-4 h-4 text-[#9CA3AF] transition-transform ${expandedId === l.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {expandedId === l.id && (
                      <div className="px-4 pb-4 space-y-3 border-t border-[#E5E7EB] pt-3">
                        <div>
                          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Hook</p>
                          <p className="text-sm font-semibold text-[#B8860B]">{l.hook}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Legenda completa</p>
                          <p className="text-sm text-[#374151] whitespace-pre-line">{l.legenda_completa}</p>
                        </div>
                        {l.cta && (
                          <div>
                            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">CTA</p>
                            <p className="text-sm text-emerald-700 font-medium">{l.cta}</p>
                          </div>
                        )}
                        {l.hashtags && l.hashtags.length > 0 && (
                          <div>
                            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium mb-1">Hashtags</p>
                            <div className="flex flex-wrap gap-1">
                              {l.hashtags.map(h => (
                                <span key={h} className="text-[10px] px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">{h}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => copiarLegenda(l)}
                          className="w-full py-2.5 bg-[#B8860B] hover:brightness-110 text-white rounded-lg text-sm font-semibold transition-all"
                        >
                          Copiar Legenda + Hashtags
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={page === 0}
                    onClick={() => loadLegendas(page - 1)}
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1D26] disabled:opacity-40 disabled:cursor-not-allowed border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-[#6B7280]">
                    {page + 1} / {totalPaginas}
                  </span>
                  <button
                    disabled={page >= totalPaginas - 1}
                    onClick={() => loadLegendas(page + 1)}
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1D26] disabled:opacity-40 disabled:cursor-not-allowed border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ====== TAB TEMPLATES ====== */}
      {tab === 'templates' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-[#1A1D26]">{t.nome}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] flex-shrink-0">{t.objetivo}</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-3">{t.descricao}</p>
                  {t.estrutura && (
                    <div className="bg-[#F3F4F6] rounded-lg p-3">
                      <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide mb-1">Estrutura</p>
                      <p className="text-xs text-[#374151] whitespace-pre-line">{t.estrutura}</p>
                    </div>
                  )}
                  <button
                    onClick={() => { navigator.clipboard.writeText(t.estrutura || t.nome); toast.success('Template copiado!') }}
                    className="mt-3 w-full py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] rounded-lg text-xs font-medium transition-colors"
                  >
                    Copiar estrutura
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== TAB HOOKS ====== */}
      {tab === 'hooks' && (
        <div className="space-y-4">
          {/* Filtros hooks */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Tema</label>
                <select
                  value={hookTema}
                  onChange={e => setHookTema(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                >
                  <option value="">Todos</option>
                  {TEMAS.map(t => <option key={t} value={t}>{TEMA_LABEL[t] || t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">Público</label>
                <select
                  value={hookPublico}
                  onChange={e => setHookPublico(e.target.value)}
                  className="h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
                >
                  <option value="">Todos</option>
                  <option value="misto">Misto</option>
                  <option value="casal">Casal</option>
                  <option value="familia">Família</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="solo">Solo</option>
                </select>
              </div>
              <button
                onClick={() => loadHooks(0)}
                className="h-10 px-5 bg-[#B8860B] hover:brightness-110 text-white font-semibold rounded-lg text-sm transition-all"
              >
                Filtrar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <p className="text-sm text-[#6B7280]">{totalHooks.toLocaleString('pt-BR')} hooks</p>
              <div className="space-y-2">
                {hooks.map(h => (
                  <div key={h.id} className="bg-white border border-[#E5E7EB] rounded-xl p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1A1D26]">{h.hook}</p>
                      <div className="flex gap-2 mt-1">
                        {h.tema && <span className="text-[10px] text-[#9CA3AF] capitalize">{h.tema.replace(/_/g,' ')}</span>}
                        {h.publico && <span className="text-[10px] text-[#9CA3AF]">· {h.publico}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => copiarHook(h)}
                      className="flex-shrink-0 px-3 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] rounded-lg text-xs font-medium transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                ))}
              </div>

              {/* Paginação hooks */}
              {totalPaginasHooks > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    disabled={hookPage === 0}
                    onClick={() => loadHooks(hookPage - 1)}
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1D26] disabled:opacity-40 disabled:cursor-not-allowed border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-[#6B7280]">
                    {hookPage + 1} / {totalPaginasHooks}
                  </span>
                  <button
                    disabled={hookPage >= totalPaginasHooks - 1}
                    onClick={() => loadHooks(hookPage + 1)}
                    className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1A1D26] disabled:opacity-40 disabled:cursor-not-allowed border border-[#E5E7EB] rounded-lg hover:bg-[#F3F4F6] transition-colors"
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
