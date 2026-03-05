'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Screen = 'mod1' | 'entrega1' | 'mod2' | 'entrega2' | 'mod3' | 'entrega3' | 'mod4' | 'resultado'

interface M1 {
  nome: string; cidade: string; regiao: string; tipo: string; tipoLabel: string; tipoEmoji: string
  quartos: number; categoria: string; ticket_medio: number
}
interface M2 { diferenciais: string[] }
interface M3 {
  frequencia_posts: string; usa_ota: string; conhece_origem: string
  fez_publi: string; responsavel_ig: string; maior_desafio: string
}
interface M4 { pacotes: string[]; objetivo_principal: string; prazo: string }

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const REGIAO_TO_ESTADO: Record<string, string> = {
  'Interior SP': 'SP', 'Litoral SP': 'SP', 'Rio de Janeiro': 'RJ',
  'Minas Gerais': 'MG', 'Nordeste': 'BA', 'Sul': 'PR',
  'Centro-Oeste': 'GO', 'Outro': 'BR',
}

const REGIOES = [
  'Interior SP', 'Litoral SP', 'Rio de Janeiro', 'Minas Gerais',
  'Nordeste', 'Sul', 'Centro-Oeste', 'Outro',
]

const TIPOS = [
  { v: 'resort_praia',      e: '🏖️', l: 'Resort Praia / All-Inclusive' },
  { v: 'pousada_romantica', e: '💑', l: 'Pousada Boutique Romântica' },
  { v: 'hotel_urbano',      e: '🏙️', l: 'Hotel Urbano' },
  { v: 'hotel_fazenda',     e: '🌿', l: 'Hotel Fazenda / Rural' },
  { v: 'eco_lodge',         e: '🌲', l: 'Eco Lodge / Serra' },
  { v: 'chales',            e: '🛖', l: 'Chalés e Cabanas' },
  { v: 'resort_spa',        e: '♨️', l: 'Resort Termas / Spa' },
  { v: 'hotel_familia',     e: '👨‍👩‍👧', l: 'Hotel Família / Kids Club' },
  { v: 'pet_friendly',      e: '🐾', l: 'Pet Friendly' },
  { v: 'hotel_historico',   e: '🏛️', l: 'Hotel Histórico / Cultural' },
]

const CATEGORIAS = [
  { v: '1', l: '⭐ Simples' },
  { v: '2', l: '⭐⭐ Médio' },
  { v: '3', l: '⭐⭐⭐ Superior' },
  { v: '4', l: '⭐⭐⭐⭐ Luxo' },
  { v: '5', l: '⭐⭐⭐⭐⭐ Ultra Luxo' },
]

const DIFERENCIAIS = [
  { k: 'piscina',         e: '🏊', l: 'Piscina' },
  { k: 'vista_mar',       e: '🌊', l: 'Vista Mar' },
  { k: 'vista_serra',     e: '⛰️', l: 'Vista Serra' },
  { k: 'pet_friendly',    e: '🐾', l: 'Pet Friendly' },
  { k: 'banheira',        e: '🛁', l: 'Banheira' },
  { k: 'restaurante',     e: '🍽️', l: 'Restaurante' },
  { k: 'bar',             e: '🍹', l: 'Bar' },
  { k: 'spa',             e: '💆', l: 'Spa' },
  { k: 'kids_club',       e: '👶', l: 'Kids Club' },
  { k: 'academia',        e: '💪', l: 'Academia' },
  { k: 'natureza',        e: '🌿', l: 'Natureza' },
  { k: 'trilhas',         e: '🥾', l: 'Trilhas' },
  { k: 'praia_privativa', e: '🏖️', l: 'Praia Privativa' },
  { k: 'piscina_natural', e: '💧', l: 'Piscina Natural' },
  { k: 'cafe_incluso',    e: '☕', l: 'Café Incluso' },
  { k: 'all_inclusive',   e: '🍽️', l: 'All Inclusive' },
  { k: 'transfer',        e: '🚐', l: 'Transfer' },
  { k: 'heliponto',       e: '🚁', l: 'Heliponto' },
  { k: 'wifi',            e: '📶', l: 'Wi-Fi' },
  { k: 'estacionamento',  e: '🅿️', l: 'Estacionamento' },
  { k: 'por_do_sol',      e: '🌅', l: 'Pôr do Sol' },
  { k: 'lareira',         e: '🔥', l: 'Lareira' },
  { k: 'adega',           e: '🍷', l: 'Adega' },
  { k: 'musica_ao_vivo',  e: '🎵', l: 'Música ao Vivo' },
]

const PACOTES = [
  { k: 'romantico',         e: '💑', l: 'Pacote Romântico' },
  { k: 'day_use',           e: '☀️', l: 'Day Use' },
  { k: 'familia',           e: '👨‍👩‍👧', l: 'Pacote Família' },
  { k: 'feriados',          e: '🎉', l: 'Feriados' },
  { k: 'alta_temporada',    e: '🌞', l: 'Alta Temporada' },
  { k: 'baixa_temporada',   e: '🍂', l: 'Baixa Temporada' },
  { k: 'corporativo',       e: '👔', l: 'Corporativo' },
  { k: 'lua_de_mel',        e: '💍', l: 'Lua de Mel' },
  { k: 'aniversario',       e: '🎂', l: 'Aniversário' },
  { k: 'grupos',            e: '👥', l: 'Grupos' },
  { k: 'retiro_wellness',   e: '🧘', l: 'Retiro / Wellness' },
  { k: 'formatura_eventos', e: '🎓', l: 'Formatura / Eventos' },
]

const OBJETIVOS = [
  { v: 'reservas_diretas', l: '📈 Aumentar reservas diretas' },
  { v: 'seguidores',       l: '👁️ Crescer seguidores e alcance' },
  { v: 'engajamento',      l: '💬 Melhorar engajamento e prova social' },
  { v: 'parcerias',        l: '🤝 Atrair parcerias e influenciadores' },
  { v: 'estrategia',       l: '📊 Ter controle e estratégia de conteúdo' },
]

// tipo → temas relevantes em benchmarks_posts
const TIPO_TEMAS: Record<string, string[]> = {
  resort_praia:      ['praia', 'piscina', 'por_do_sol', 'all_inclusive'],
  pousada_romantica: ['romantico', 'quarto', 'cafe_da_manha', 'spa'],
  hotel_urbano:      ['corporativo', 'workation', 'checkin', 'destino'],
  hotel_fazenda:     ['fazenda', 'gastronomia', 'aventura', 'bastidores'],
  eco_lodge:         ['aventura', 'serra', 'sustentabilidade', 'experiencias'],
  chales:            ['romantico', 'serra', 'por_do_sol', 'quarto'],
  resort_spa:        ['spa', 'romantico', 'por_do_sol', 'experiencias'],
  hotel_familia:     ['familia', 'piscina', 'all_inclusive', 'cafe_da_manha'],
  pet_friendly:      ['pet_friendly', 'aventura', 'destino'],
  hotel_historico:   ['destino', 'experiencias', 'bastidores', 'ugc'],
}

// ─────────────────────────────────────────────
// INSIGHT GENERATORS
// ─────────────────────────────────────────────
function insightsMod2(diferenciais: string[]): string[] {
  const out: string[] = []
  const has = (...ks: string[]) => ks.every(k => diferenciais.includes(k))
  const hasAny = (...ks: string[]) => ks.some(k => diferenciais.includes(k))

  if (has('vista_mar', 'piscina', 'bar'))
    out.push('✅ Potencial forte para conteúdo de lifestyle e sundowner')
  if (has('kids_club', 'piscina', 'all_inclusive'))
    out.push('✅ Perfil ideal para conteúdo família e experiência completa')
  if (has('spa', 'banheira', 'vista_serra'))
    out.push('✅ Posicionamento premium para casais e retiro')
  if (hasAny('por_do_sol', 'vista_mar', 'vista_serra', 'praia_privativa'))
    out.push('✅ Potencial visual altíssimo — fotos e reels que convertem')
  if (hasAny('restaurante', 'all_inclusive', 'adega'))
    out.push('✅ Conteúdo gastronômico com alto engajamento e partilha')
  if (hasAny('trilhas', 'natureza', 'piscina_natural'))
    out.push('✅ Perfil de aventura e natureza — nicho em crescimento no Instagram')
  if (hasAny('lareira', 'adega', 'musica_ao_vivo'))
    out.push('✅ Experiências sensoriais únicas para stories e reels autorais')
  if (diferenciais.length >= 8)
    out.push('✅ Hotel completo — ampla variedade de temas para calendário 30 dias')

  if (out.length < 2) {
    out.push('✅ Potencial para conteúdo visual alto com os diferenciais mapeados')
    out.push('✅ Oportunidade de destacar experiências únicas ao hóspede')
  }
  return out.slice(0, 3)
}

function oportunidadesMod3(m3: M3): string[] {
  const out: string[] = []

  if (m3.frequencia_posts === 'nunca' || m3.frequencia_posts === 'raramente')
    out.push('⚠️ Baixa presença digital — hóspedes buscam no Instagram antes de reservar')
  if (m3.usa_ota === 'sim_muito')
    out.push('⚠️ Alta dependência de OTAs — cada reserva perde 15-25% de comissão')
  if (m3.conhece_origem === 'nao')
    out.push('⚠️ Sem rastreamento de origem — impossível otimizar investimento')
  if (m3.responsavel_ig === 'ninguem')
    out.push('⚠️ Perfil abandonado — recuperação rápida com ganhos imediatos')
  if (m3.maior_desafio === 'nao_gera_reservas')
    out.push('⚠️ Posts sem conversão — falta estratégia de conteúdo orientado à reserva')
  if (m3.maior_desafio === 'sem_fotos')
    out.push('⚠️ Acervo visual limitado — bloqueia crescimento orgânico')
  if (m3.maior_desafio === 'sem_tempo')
    out.push('⚠️ Gestão reativa — conteúdo criado na pressa perde qualidade e consistência')

  if (out.length < 2) {
    out.push('⚠️ Oportunidade de ampliar presença digital com estratégia consistente')
    out.push('⚠️ Potencial de crescimento orgânico com calendário estruturado')
  }
  return out.slice(0, 3)
}

function focoEstrategico(objetivo: string): string {
  const map: Record<string, string> = {
    reservas_diretas: 'CTAs de conversão, links na bio otimizados e conteúdo que gera urgência de reserva direta',
    seguidores:       'Reels de alto impacto visual, colaborações com microinfluenciadores regionais e conteúdo de destino',
    engajamento:      'Stories interativos com enquetes, UGC (fotos de hóspedes) e respostas ativas nos comentários',
    parcerias:        'Posicionamento aspiracional, press kit digital e estratégia de relacionamento com criadores de conteúdo',
    estrategia:       'Calendário editorial mensal estruturado, métricas de acompanhamento e ciclos de otimização contínua',
  }
  return map[objetivo] || 'Plano de conteúdo 360° com base nos seus diferenciais e público-alvo identificados'
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function screenToModulo(s: Screen): number {
  if (s === 'mod1' || s === 'entrega1') return 1
  if (s === 'mod2' || s === 'entrega2') return 2
  if (s === 'mod3' || s === 'entrega3') return 3
  return 4
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function OnboardingPage() {
  const [screen, setScreen] = useState<Screen>('mod1')
  const [visible, setVisible] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hotelId, setHotelId] = useState<string | null>(null)
  const [postsSugestoes, setPostsSugestoes] = useState<any[]>([])

  const [m1, setM1] = useState<M1>({
    nome: '', cidade: '', regiao: '', tipo: '', tipoLabel: '', tipoEmoji: '',
    quartos: 20, categoria: '3', ticket_medio: 0,
  })
  const [m2, setM2] = useState<M2>({ diferenciais: [] })
  const [m3, setM3] = useState<M3>({
    frequencia_posts: '', usa_ota: '', conhece_origem: '',
    fez_publi: '', responsavel_ig: '', maior_desafio: '',
  })
  const [m4, setM4] = useState<M4>({ pacotes: [], objetivo_principal: '', prazo: '' })

  const router = useRouter()
  const supabase = createClient()

  function go(next: Screen) {
    setVisible(false)
    setTimeout(() => { setScreen(next); setVisible(true) }, 250)
  }

  // ── Módulo 1: criar hotel ──
  async function saveM1(): Promise<string | null> {
    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { toast.error('Faça login primeiro'); return null }

      const { data: hotel, error } = await supabase
        .from('hotels')
        .insert({
          nome: m1.nome,
          cidade: m1.cidade,
          estado: REGIAO_TO_ESTADO[m1.regiao] || 'BR',
          regiao: m1.regiao,
          tipo: m1.tipo,
          classificacao: Number(m1.categoria),
          numero_quartos: m1.quartos,
          ticket_medio_diaria: m1.ticket_medio,
          status: 'onboarding',
          owner_id: userData.user.id,
        })
        .select('id')
        .single()

      if (error || !hotel) { toast.error('Erro ao salvar hotel: ' + (error?.message || 'desconhecido')); return null }

      // salva modulo_1 em background
      supabase.from('onboarding_responses').insert({
        hotel_id: hotel.id,
        respostas: { modulo_1: m1 },
      }).then(() => {})

      setHotelId(hotel.id)
      return hotel.id
    } finally {
      setSaving(false)
    }
  }

  // ── Módulo 2: salvar diferenciais em onboarding_responses + atualizar hotels ──
  async function saveM2(hid: string) {
    await Promise.all([
      supabase.from('onboarding_responses').upsert({
        hotel_id: hid,
        respostas: { modulo_1: m1, modulo_2: m2 },
      }, { onConflict: 'hotel_id' }),
      supabase.from('hotels').update({ diferenciais: m2.diferenciais }).eq('id', hid),
    ])
  }

  // ── Módulo 3: salvar auditoria de marketing ──
  async function saveM3(hid: string) {
    const oportunidades = oportunidadesMod3(m3)
    await supabase.from('onboarding_responses').upsert({
      hotel_id: hid,
      respostas: {
        modulo_1: m1,
        modulo_2: m2,
        modulo_3: m3,
        classificacao_gerada: { oportunidades },
      },
    }, { onConflict: 'hotel_id' })
  }

  // ── Módulo 4: salvar objetivos + finalizar hotel + buscar sugestões ──
  async function saveM4(hid: string) {
    setSaving(true)
    try {
      const classificacao = {
        perfil: `${m1.tipoEmoji} ${m1.tipoLabel} • ${m1.regiao} • ${CATEGORIAS.find(c => c.v === m1.categoria)?.l}`,
        pontos_fortes: insightsMod2(m2.diferenciais),
        oportunidades: oportunidadesMod3(m3),
        foco: focoEstrategico(m4.objetivo_principal),
      }

      await Promise.all([
        supabase.from('onboarding_responses').upsert({
          hotel_id: hid,
          respostas: {
            modulo_1: m1, modulo_2: m2, modulo_3: m3, modulo_4: m4,
            classificacao_gerada: classificacao,
          },
          completado_em: new Date().toISOString(),
        }, { onConflict: 'hotel_id' }),
        supabase.from('hotels')
          .update({ status: 'ativo', onboarding_completo: true })
          .eq('id', hid),
      ])

      const temas = TIPO_TEMAS[m1.tipo] || ['destino', 'experiencias', 'checkin']
      const { data: posts } = await supabase
        .from('benchmarks_posts')
        .select('id, tema, formato, hook, legenda_completa, qualidade_score')
        .in('tema', temas)
        .eq('ativo', true)
        .order('qualidade_score', { ascending: false })
        .limit(6)

      setPostsSugestoes(posts || [])
    } finally {
      setSaving(false)
    }
  }

  // ── handlers de cada módulo ──
  async function handleM1() {
    if (!m1.nome || !m1.cidade || !m1.regiao || !m1.tipo) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    const hid = await saveM1()
    if (!hid) return
    go('entrega1')
  }

  async function handleM2() {
    if (hotelId) saveM2(hotelId) // non-blocking
    go('entrega2')
  }

  async function handleM3() {
    if (!m3.frequencia_posts || !m3.responsavel_ig) {
      toast.error('Responda as perguntas obrigatórias')
      return
    }
    if (hotelId) saveM3(hotelId) // non-blocking
    go('entrega3')
  }

  async function handleM4() {
    if (!m4.objetivo_principal || !m4.prazo) {
      toast.error('Selecione objetivo e prazo')
      return
    }
    if (!hotelId) { toast.error('Erro: hotel não encontrado'); return }
    await saveM4(hotelId)
    go('resultado')
  }

  const moduloAtual = screenToModulo(screen)
  const progress = screen === 'resultado' ? 100 : (moduloAtual / 4) * 100

  return (
    <div className="space-y-5">
      {/* ── Progress bar ── */}
      {screen !== 'resultado' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#6B7280] font-medium">Módulo {moduloAtual} de 4</span>
            <span className="text-[#B8860B] font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#B8860B] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                  n <= moduloAtual ? 'bg-[#B8860B]' : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Screens com fade ── */}
      <div
        className={`transition-all duration-[250ms] ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {screen === 'mod1' && (
          <Modulo1 data={m1} setData={setM1} onNext={handleM1} saving={saving} />
        )}
        {screen === 'entrega1' && (
          <Entrega1 m1={m1} onNext={() => go('mod2')} />
        )}
        {screen === 'mod2' && (
          <Modulo2 data={m2} setData={setM2} onNext={handleM2} onBack={() => go('entrega1')} />
        )}
        {screen === 'entrega2' && (
          <Entrega2 m2={m2} onNext={() => go('mod3')} />
        )}
        {screen === 'mod3' && (
          <Modulo3 data={m3} setData={setM3} onNext={handleM3} onBack={() => go('entrega2')} />
        )}
        {screen === 'entrega3' && (
          <Entrega3 m3={m3} onNext={() => go('mod4')} />
        )}
        {screen === 'mod4' && (
          <Modulo4 data={m4} setData={setM4} onNext={handleM4} onBack={() => go('entrega3')} saving={saving} />
        )}
        {screen === 'resultado' && (
          <Resultado m1={m1} m2={m2} m3={m3} m4={m4} posts={postsSugestoes} hotelId={hotelId} />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MÓDULO 1 — IDENTIDADE DO HOTEL
// ─────────────────────────────────────────────
function Modulo1({
  data, setData, onNext, saving,
}: {
  data: M1; setData: (d: M1) => void; onNext: () => void; saving: boolean
}) {
  const set = (k: keyof M1, v: any) => setData({ ...data, [k]: v })
  const canNext = !!(data.nome && data.cidade && data.regiao && data.tipo)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-1">
          Módulo 1 · 3 minutos
        </p>
        <h2 className="text-xl font-bold text-[#1A1D26]">Vamos conhecer seu hotel</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Estamos mapeando seu perfil para gerar um diagnóstico personalizado.
        </p>
      </div>

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Nome do hotel <span className="text-red-500">*</span>
        </label>
        <input
          value={data.nome}
          onChange={e => set('nome', e.target.value)}
          placeholder="Ex: Pousada Villa do Sol"
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] transition-colors"
        />
      </div>

      {/* Cidade */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Cidade <span className="text-red-500">*</span>
        </label>
        <input
          value={data.cidade}
          onChange={e => set('cidade', e.target.value)}
          placeholder="Ex: Búzios"
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] transition-colors"
        />
      </div>

      {/* Região */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Região <span className="text-red-500">*</span>
        </label>
        <select
          value={data.regiao}
          onChange={e => set('regiao', e.target.value)}
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
        >
          <option value="">Selecione a região</option>
          {REGIOES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Tipo — grid visual */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Tipo do hotel <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map(t => (
            <button
              key={t.v}
              type="button"
              onClick={() => setData({ ...data, tipo: t.v, tipoLabel: t.l, tipoEmoji: t.e })}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-left transition-all border ${
                data.tipo === t.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold shadow-sm'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
              }`}
            >
              <span className="text-lg flex-shrink-0">{t.e}</span>
              <span className="leading-tight text-xs">{t.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quartos — slider */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Número de quartos:{' '}
          <span className="text-[#B8860B] font-bold">{data.quartos}</span>
        </label>
        <input
          type="range"
          min={1}
          max={200}
          value={data.quartos}
          onChange={e => set('quartos', Number(e.target.value))}
          className="w-full accent-[#B8860B]"
        />
        <div className="flex justify-between text-xs text-[#9CA3AF] mt-1">
          <span>1</span><span>200</span>
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">Categoria</label>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORIAS.map(c => (
            <button
              key={c.v}
              type="button"
              onClick={() => set('categoria', c.v)}
              className={`px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border ${
                data.categoria === c.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B]'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              {c.l}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket médio */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Ticket médio diária casal (R$)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-medium select-none">
            R$
          </span>
          <input
            type="number"
            value={data.ticket_medio || ''}
            onChange={e => set('ticket_medio', Number(e.target.value))}
            placeholder="0"
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] transition-colors"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canNext || saving}
        className="w-full py-3.5 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-bold rounded-xl transition-all text-base"
      >
        {saving ? 'Analisando seu hotel...' : 'Analisar Meu Hotel →'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// ENTREGA 1
// ─────────────────────────────────────────────
function Entrega1({ m1, onNext }: { m1: M1; onNext: () => void }) {
  const cat = CATEGORIAS.find(c => c.v === m1.categoria)

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFF3CD] border border-[#B8860B]/30 rounded-2xl p-6 shadow-sm">
        <p className="text-[#B8860B] font-semibold text-sm mb-4">✨ Seu hotel foi classificado como:</p>
        <p className="text-2xl font-bold text-[#1A1D26] mb-3">{m1.tipoEmoji} {m1.tipoLabel}</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-white/80 border border-[#B8860B]/20 text-[#92660A] px-3 py-1.5 rounded-full font-semibold">
            {m1.regiao}
          </span>
          <span className="text-xs bg-white/80 border border-[#B8860B]/20 text-[#92660A] px-3 py-1.5 rounded-full font-semibold">
            {cat?.l}
          </span>
          <span className="text-xs bg-white/80 border border-[#B8860B]/20 text-[#92660A] px-3 py-1.5 rounded-full font-semibold">
            {m1.quartos} quartos
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-[#6B7280]">
          <strong className="text-[#1A1D26]">Perfeito.</strong> Agora vamos identificar seus diferenciais —
          os atributos únicos que vão guiar toda a estratégia de conteúdo.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all text-base"
      >
        Identificar Meus Diferenciais →
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// MÓDULO 2 — DIFERENCIAIS
// ─────────────────────────────────────────────
function Modulo2({
  data, setData, onNext, onBack,
}: {
  data: M2; setData: (d: M2) => void; onNext: () => void; onBack: () => void
}) {
  function toggle(k: string) {
    const arr = data.diferenciais.includes(k)
      ? data.diferenciais.filter(x => x !== k)
      : [...data.diferenciais, k]
    setData({ diferenciais: arr })
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-1">
          Módulo 2 · 4 minutos
        </p>
        <h2 className="text-xl font-bold text-[#1A1D26]">O que torna seu hotel especial?</h2>
        <p className="text-sm text-[#6B7280] mt-1">Selecione tudo que seu hotel oferece</p>
      </div>

      {data.diferenciais.length > 0 && (
        <div className="bg-[#FFF8E7] border border-[#B8860B]/20 rounded-xl px-4 py-2.5">
          <p className="text-xs text-[#B8860B] font-semibold">
            {data.diferenciais.length} diferencial{data.diferenciais.length !== 1 ? 'is' : ''} selecionado{data.diferenciais.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Grid: 2 cols mobile → 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {DIFERENCIAIS.map(d => {
          const sel = data.diferenciais.includes(d.k)
          return (
            <button
              key={d.k}
              type="button"
              onClick={() => toggle(d.k)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs transition-all border ${
                sel
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold shadow-sm'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
              }`}
            >
              <span className="text-xl">{d.e}</span>
              <span className="text-center leading-tight">{d.l}</span>
              {sel && <span className="text-[10px] text-[#B8860B] font-bold">✓</span>}
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3.5 bg-[#F3F4F6] text-[#6B7280] font-medium rounded-xl hover:bg-[#E5E7EB] transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all"
        >
          Ver Análise →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ENTREGA 2
// ─────────────────────────────────────────────
function Entrega2({ m2, onNext }: { m2: M2; onNext: () => void }) {
  const top = m2.diferenciais.slice(0, 5).map(k => {
    const d = DIFERENCIAIS.find(x => x.k === k)
    return d ? `${d.e} ${d.l}` : k
  })
  const insights = insightsMod2(m2.diferenciais)

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1D26] mb-3">
          Seus principais diferenciais identificados:
        </p>
        {top.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {top.map(t => (
              <span
                key={t}
                className="text-xs bg-[#FFF8E7] text-[#92660A] border border-[#B8860B]/20 px-3 py-1.5 rounded-full font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF] mb-4">Nenhum diferencial selecionado ainda</p>
        )}
        <div className="space-y-2 border-t border-[#E5E7EB] pt-3">
          {insights.map(ins => (
            <p key={ins} className="text-sm text-[#374151]">{ins}</p>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-[#6B7280]">
          <strong className="text-[#1A1D26]">Ótimo perfil.</strong> Agora vamos entender como está
          seu Instagram hoje — sem julgamentos, só clareza.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all text-base"
      >
        Analisar Marketing Atual →
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// MÓDULO 3 — MARKETING ATUAL
// ─────────────────────────────────────────────
function Modulo3({
  data, setData, onNext, onBack,
}: {
  data: M3; setData: (d: M3) => void; onNext: () => void; onBack: () => void
}) {
  const set = (k: keyof M3, v: string) => setData({ ...data, [k]: v })

  const perguntas: Array<{
    campo: keyof M3
    titulo: string
    cols?: string
    opts: Array<{ v: string; l: string }>
  }> = [
    {
      campo: 'frequencia_posts',
      titulo: 'Com que frequência você posta?',
      cols: 'grid-cols-2 sm:grid-cols-3',
      opts: [
        { v: 'nunca',          l: 'Nunca' },
        { v: 'raramente',      l: 'Raramente' },
        { v: '1_2x',           l: '1-2x por semana' },
        { v: 'quase_todo_dia', l: 'Quase todo dia' },
        { v: 'todo_dia',       l: 'Todo dia' },
      ],
    },
    {
      campo: 'usa_ota',
      titulo: 'Você usa OTAs (Booking, Airbnb, Expedia)?',
      opts: [
        { v: 'sim_muito', l: 'Sim, muito — dependemos' },
        { v: 'sim_pouco', l: 'Sim, mas pouco' },
        { v: 'nao',       l: 'Não usamos' },
      ],
    },
    {
      campo: 'conhece_origem',
      titulo: 'Você sabe de onde vêm seus hóspedes?',
      opts: [
        { v: 'sim',           l: 'Sim, claramente' },
        { v: 'mais_ou_menos', l: 'Mais ou menos' },
        { v: 'nao',           l: 'Não faço ideia' },
      ],
    },
    {
      campo: 'fez_publi',
      titulo: 'Já fez publi com influenciador?',
      opts: [
        { v: 'sim_bons_resultados', l: 'Sim, com bons resultados' },
        { v: 'sim_nao_funcionou',   l: 'Sim, mas não funcionou' },
        { v: 'nao_quero',           l: 'Não, mas quero' },
        { v: 'nao_interesse',       l: 'Não tenho interesse' },
      ],
    },
    {
      campo: 'responsavel_ig',
      titulo: 'Quem cuida do Instagram hoje?',
      opts: [
        { v: 'eu_mesmo',   l: 'Eu mesmo' },
        { v: 'funcionario', l: 'Funcionário interno' },
        { v: 'agencia',     l: 'Agência terceirizada' },
        { v: 'ninguem',     l: 'Ninguém — está abandonado' },
      ],
    },
    {
      campo: 'maior_desafio',
      titulo: 'Qual seu maior desafio no Instagram?',
      cols: 'grid-cols-1',
      opts: [
        { v: 'sem_tempo',          l: 'Não tenho tempo' },
        { v: 'nao_sei_postar',     l: 'Não sei o que postar' },
        { v: 'nao_gera_reservas',  l: 'Posto mas não gera reservas' },
        { v: 'sem_fotos',          l: 'Não tenho fotos boas' },
        { v: 'sem_metricas',       l: 'Não sei medir resultados' },
      ],
    },
  ]

  const canNext = !!(data.frequencia_posts && data.responsavel_ig)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-1">
          Módulo 3 · 4 minutos
        </p>
        <h2 className="text-xl font-bold text-[#1A1D26]">Como está seu Instagram hoje?</h2>
        <p className="text-sm text-[#6B7280] mt-1">Sem julgamentos. Só clareza.</p>
      </div>

      {perguntas.map(p => (
        <div key={p.campo} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1A1D26] mb-3">{p.titulo}</p>
          <div className={`grid ${p.cols ?? 'grid-cols-1'} gap-2`}>
            {p.opts.map(o => (
              <button
                key={o.v}
                type="button"
                onClick={() => set(p.campo, o.v)}
                className={`px-4 py-3 rounded-xl text-sm text-left transition-all border font-medium ${
                  data[p.campo] === o.v
                    ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB]'
                }`}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3.5 bg-[#F3F4F6] text-[#6B7280] font-medium rounded-xl hover:bg-[#E5E7EB] transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-bold rounded-xl transition-all"
        >
          Ver Diagnóstico →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// ENTREGA 3
// ─────────────────────────────────────────────
function Entrega3({ m3, onNext }: { m3: M3; onNext: () => void }) {
  const ops = oportunidadesMod3(m3)

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1D26] mb-3">
          Oportunidades identificadas no seu perfil atual:
        </p>
        <div className="space-y-2">
          {ops.map(op => (
            <div
              key={op}
              className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl"
            >
              <p className="text-sm text-amber-800">{op}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-[#6B7280]">
          <strong className="text-[#1A1D26]">Diagnóstico claro.</strong> Agora defina seus objetivos
          para receber um plano de ação personalizado.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all text-base"
      >
        Definir Meus Objetivos →
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// MÓDULO 4 — PACOTES E OBJETIVOS
// ─────────────────────────────────────────────
function Modulo4({
  data, setData, onNext, onBack, saving,
}: {
  data: M4; setData: (d: M4) => void; onNext: () => void; onBack: () => void; saving: boolean
}) {
  function togglePacote(k: string) {
    const arr = data.pacotes.includes(k)
      ? data.pacotes.filter(x => x !== k)
      : [...data.pacotes, k]
    setData({ ...data, pacotes: arr })
  }

  const canNext = !!(data.objetivo_principal && data.prazo)

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-1">
          Módulo 4 · 3 minutos
        </p>
        <h2 className="text-xl font-bold text-[#1A1D26]">O que você quer vender mais?</h2>
      </div>

      {/* Seção A — Pacotes */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1D26] mb-3">Pacotes que você oferece:</p>
        <div className="grid grid-cols-2 gap-2">
          {PACOTES.map(p => {
            const sel = data.pacotes.includes(p.k)
            return (
              <button
                key={p.k}
                type="button"
                onClick={() => togglePacote(p.k)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all border ${
                  sel
                    ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
                }`}
              >
                <span>{p.e}</span>
                <span className="leading-tight">{p.l}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Seção B — Objetivo principal */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1D26] mb-3">
          Seu objetivo principal: <span className="text-red-500">*</span>
        </p>
        <div className="space-y-2">
          {OBJETIVOS.map(o => (
            <button
              key={o.v}
              type="button"
              onClick={() => setData({ ...data, objetivo_principal: o.v })}
              className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium text-left transition-all border ${
                data.objetivo_principal === o.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB]'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {/* Seção C — Prazo */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#1A1D26] mb-3">
          Prazo que você quer resultados: <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: '30_dias', l: '⚡ 30 dias' },
            { v: '90_dias', l: '📅 90 dias' },
            { v: '6_meses', l: '🚀 6 meses' },
          ].map(p => (
            <button
              key={p.v}
              type="button"
              onClick={() => setData({ ...data, prazo: p.v })}
              className={`py-3.5 rounded-xl text-sm font-medium transition-all border ${
                data.prazo === p.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-3.5 bg-[#F3F4F6] text-[#6B7280] font-medium rounded-xl hover:bg-[#E5E7EB] transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canNext || saving}
          className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white font-bold rounded-xl transition-all"
        >
          {saving ? 'Gerando diagnóstico...' : 'Concluir Diagnóstico →'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// TELA RESULTADO
// ─────────────────────────────────────────────
function Resultado({
  m1, m2, m3, m4, posts, hotelId,
}: {
  m1: M1; m2: M2; m3: M3; m4: M4; posts: any[]; hotelId: string | null
}) {
  const router = useRouter()
  const cat = CATEGORIAS.find(c => c.v === m1.categoria)
  const topDifs = m2.diferenciais.slice(0, 3)
    .map(k => DIFERENCIAIS.find(d => d.k === k))
    .filter(Boolean)
  const oportunidades = oportunidadesMod3(m3)
  const foco = focoEstrategico(m4.objetivo_principal)
  const obj = OBJETIVOS.find(o => o.v === m4.objetivo_principal)

  function copiarLink() {
    if (!hotelId) return
    navigator.clipboard.writeText(`${window.location.origin}/dashboard/hoteis/${hotelId}`)
    toast.success('Link copiado!')
  }

  return (
    <div className="space-y-5">
      {/* Badge celebratório */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#B8860B]/30 text-[#B8860B] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
          ✨ Diagnóstico Concluído — {m1.nome}
        </div>
        <p className="text-[#6B7280] text-sm mt-3">Seu plano personalizado está pronto.</p>
      </div>

      {/* Classificação */}
      <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFF3CD] border border-[#B8860B]/20 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-[#B8860B] font-bold uppercase tracking-wider mb-3">Classificação</p>
        <p className="text-xl font-bold text-[#1A1D26]">{m1.tipoEmoji} {m1.tipoLabel}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs bg-white/80 text-[#92660A] border border-[#B8860B]/20 px-3 py-1 rounded-full font-medium">
            {m1.regiao}
          </span>
          <span className="text-xs bg-white/80 text-[#92660A] border border-[#B8860B]/20 px-3 py-1 rounded-full font-medium">
            {cat?.l}
          </span>
        </div>
        {topDifs.length > 0 && (
          <div className="flex gap-2 mt-3">
            {topDifs.map(d => d && (
              <span key={d.k} className="text-xl" title={d.l}>{d.e}</span>
            ))}
          </div>
        )}
      </div>

      {/* Top 3 oportunidades */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">
          Top 3 Oportunidades
        </p>
        <div className="space-y-2">
          {oportunidades.map(op => (
            <div key={op} className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl">
              <p className="text-sm text-amber-800">{op}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Foco estratégico */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">
          Foco Estratégico Recomendado
        </p>
        {obj && (
          <p className="text-sm font-semibold text-[#B8860B] mb-2">{obj.l}</p>
        )}
        <p className="text-sm text-[#374151]">{foco}</p>
      </div>

      {/* Mini-calendário: 6 sugestões de posts */}
      {posts.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">
            Sugestões para os Próximos 7 Dias
          </p>
          <div className="space-y-2">
            {posts.map((p, i) => (
              <div
                key={p.id}
                className="flex items-start gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]"
              >
                <span className="text-xs bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/20 px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">
                  Dia {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1A1D26] capitalize">
                    {p.tema?.replace(/_/g, ' ')} · {p.formato}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{p.hook}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-3 pb-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-4 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all text-base shadow-md"
        >
          Ver meu Plano de 90 Dias →
        </button>
        {hotelId && (
          <button
            onClick={copiarLink}
            className="w-full py-3.5 bg-white border border-[#E5E7EB] text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors"
          >
            Compartilhar diagnóstico
          </button>
        )}
      </div>
    </div>
  )
}
