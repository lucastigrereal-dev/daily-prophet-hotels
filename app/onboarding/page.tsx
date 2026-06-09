'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveContentDNA } from '@/lib/hotel/content-dna'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Screen = 'mod1' | 'entrega1' | 'mod2' | 'entrega2' | 'mod3' | 'entrega3' | 'mod4' | 'resultado'

interface M1 {
  nome: string; cidade: string; regiao: string; tipo: string; tipoLabel: string; tipoEmoji: string
  quartos: number; categoria: string; ticket_medio: number
  contexto_geo: string; publico_principal: string
}
interface M2 {
  diferenciais: string[]
  experiencias: string[]
  lugar_fotografado: string
  lugar_bonito: string
  espaco_oculto: string
}
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

// Mapper: valores do form -> valores aceitos pelo CHECK constraint do banco
const MAP_TIPO: Record<string, string> = {
  resort_praia:      'resort',
  pousada_romantica: 'boutique',
  hotel_urbano:      'urbano',
  hotel_fazenda:     'fazenda',
  eco_lodge:         'eco_resort',
  chales:            'glamping',
  resort_spa:        'resort',
  hotel_familia:     'resort',
  pet_friendly:      'pousada',
  hotel_historico:   'boutique',
}
function mapTipo(v: string): string { return MAP_TIPO[v] || v }

const CATEGORIAS = [
  { v: '2', l: '⭐⭐ Econômico' },
  { v: '3', l: '⭐⭐⭐ Standard' },
  { v: '4', l: '⭐⭐⭐⭐ Superior' },
  { v: '5', l: '⭐⭐⭐⭐⭐ Luxo' },
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

const CONTEXTO_GEO = [
  { v: 'praia',    e: '🏖️', l: 'Praia / Litoral' },
  { v: 'serra',    e: '⛰️', l: 'Serra / Montanha' },
  { v: 'campo',    e: '🌾', l: 'Campo / Interior' },
  { v: 'urbano',   e: '🏙️', l: 'Centro Urbano' },
  { v: 'natureza', e: '🌿', l: 'Natureza / Mata' },
]

const PUBLICO_PRINCIPAL = [
  { v: 'casal',       e: '💑', l: 'Casais' },
  { v: 'familia',     e: '👨‍👩‍👧', l: 'Família' },
  { v: 'corporativo', e: '👔', l: 'Corporativo' },
  { v: 'misto',       e: '👥', l: 'Público Misto' },
]

const EXPERIENCIAS = [
  { k: 'day_use',           e: '☀️', l: 'Day Use' },
  { k: 'passeios',          e: '🚢', l: 'Passeios' },
  { k: 'pacote_romantico',  e: '💑', l: 'Pacote Romântico' },
  { k: 'pacote_familia',    e: '👨‍👩‍👧', l: 'Pacote Família' },
  { k: 'lua_de_mel',        e: '💍', l: 'Lua de Mel' },
  { k: 'aniversario',       e: '🎂', l: 'Aniversário' },
  { k: 'eventos',           e: '🎉', l: 'Eventos' },
  { k: 'retiro_wellness',   e: '🧘', l: 'Retiro / Wellness' },
  { k: 'corporativo_evt',   e: '📊', l: 'Corporativo' },
  { k: 'jantar_especial',   e: '🍽️', l: 'Jantar Especial' },
  { k: 'degustacao',        e: '🍷', l: 'Degustação' },
  { k: 'trilha_guiada',     e: '🥾', l: 'Trilha Guiada' },
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

// diferencial → tema do banco (para Content DNA)
const DIF_TO_TEMA: Record<string, string> = {
  piscina: 'piscina', vista_mar: 'praia', vista_serra: 'serra',
  por_do_sol: 'por_do_sol', restaurante: 'gastronomia', cafe_incluso: 'cafe_da_manha',
  spa: 'spa', lareira: 'romantico', banheira: 'romantico',
  kids_club: 'familia', trilhas: 'aventura', natureza: 'aventura',
  adega: 'gastronomia', musica_ao_vivo: 'experiencias', pet_friendly: 'pet_friendly',
  praia_privativa: 'praia', piscina_natural: 'aventura', bar: 'gastronomia',
}

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
// DIAGNÓSTICO GENERATORS
// ─────────────────────────────────────────────
const ATIVO_CONTENT: Record<string, string> = {
  piscina: 'isso dá foto + reel', vista_mar: 'reel que converte', vista_serra: 'foto sazonal incrível',
  por_do_sol: 'foto que viraliza', restaurante: 'carrossel + reel', cafe_incluso: 'stories todo dia',
  spa: 'campanha premium', lareira: 'reel emocional', banheira: 'campanha de casal',
  kids_club: 'reel + carrossel família', trilhas: 'série de conteúdo', natureza: 'reels autorais',
  adega: 'harmonização + reels', musica_ao_vivo: 'stories ao vivo', pet_friendly: 'reel que engaja',
  praia_privativa: 'foto aspiracional', piscina_natural: 'foto viral', bar: 'reel do drink',
}
const EXPERIENCIA_CONTENT: Record<string, string> = {
  day_use: 'campanha de feriado', passeios: 'série de conteúdo', pacote_romantico: 'campanha de casal',
  pacote_familia: 'campanha de férias', lua_de_mel: 'campanha premium', aniversario: 'campanha de data',
  eventos: 'carrossel + stories', retiro_wellness: 'campanha de retiro', corporativo_evt: 'conteúdo B2B',
  jantar_especial: 'reel gastronômico', degustacao: 'reel premium', trilha_guiada: 'reel de aventura',
}

function gerarManchete(m1: M1, m2: M2): string {
  const total = m2.diferenciais.length + m2.experiencias.length
  const pub = { casal: 'casais', familia: 'família', corporativo: 'viagens corporativas', misto: 'todos os perfis' }[m1.publico_principal] || 'seus hóspedes'
  const geo = { praia: 'à beira-mar', serra: 'na serra', campo: 'no interior', urbano: 'no centro urbano', natureza: 'em meio à natureza' }[m1.contexto_geo] || ''
  if (total >= 10) return `Você tem ouro nas mãos. ${m1.nome} ${geo} possui ${total} ativos mapeados — conteúdo para meses de Instagram.`
  if (total >= 5) return `${m1.nome} tem mais conteúdo do que parece. Com ${total} ativos, dá pra postar todo dia com consistência.`
  return `Seu hotel tem um diferencial claro para ${pub}. Vamos transformar isso em reservas diretas.`
}

function gerarAtivos(m2: M2): Array<{ emoji: string; label: string; content: string }> {
  const result: Array<{ emoji: string; label: string; content: string }> = []
  for (const k of m2.diferenciais) {
    const d = DIFERENCIAIS.find(x => x.k === k)
    if (d && ATIVO_CONTENT[k]) result.push({ emoji: d.e, label: d.l, content: ATIVO_CONTENT[k] })
  }
  for (const k of m2.experiencias) {
    const e = EXPERIENCIAS.find(x => x.k === k)
    if (e && EXPERIENCIA_CONTENT[k]) result.push({ emoji: e.e, label: e.l, content: EXPERIENCIA_CONTENT[k] })
  }
  return result
}

const IDEAS_BY_KEY: Record<string, string> = {
  piscina: 'Reel da piscina ao entardecer', vista_mar: 'Reel do nascer do sol com vista mar',
  vista_serra: 'Foto da névoa na serra de manhã', por_do_sol: 'Reel time-lapse do pôr do sol',
  restaurante: 'Reel do prato principal em close', cafe_incluso: 'Carrossel "Nossa mesa do café da manhã"',
  spa: 'Reel da sala de massagem iluminada', lareira: 'Reel da lareira acesa à noite',
  banheira: 'Foto da banheira com pétalas e velas', kids_club: 'Reel do kids club em ação',
  trilhas: 'Reel de trilha guiada', natureza: 'Reel da fauna local',
  adega: 'Reel da harmonização de vinhos', musica_ao_vivo: 'Story ao vivo do show',
  pet_friendly: 'Reel do pet explorando o hotel', praia_privativa: 'Foto aérea da praia privativa',
  bar: 'Reel do drink sendo preparado no bar', day_use: 'Carrossel "Um dia perfeito de day use"',
  passeios: 'Carrossel "Roteiro de 1 dia na região"', pacote_romantico: 'Reel "Uma surpresa para seu amor"',
  lua_de_mel: 'Carrossel "Tudo incluso na lua de mel"', jantar_especial: 'Reel do jantar especial servido',
  degustacao: 'Reel da harmonização premium', trilha_guiada: 'Reel da trilha com guia local',
}
const BASE_IDEAS = [
  'Carrossel "X razões para fugir da rotina aqui"',
  'Story com enquete: "Você prefere praia ou piscina?"',
  'Reel "Chegou, relaxou" — check-in emocional',
  'Carrossel "Como é um dia completo no hotel"',
  'Story com avaliação 5★ do Google',
  'Reel "O que os hóspedes mais amam aqui"',
  'Carrossel "Como chegar — roteiro de acesso"',
  'Story com pergunta: "O que você faria no primeiro dia?"',
  'Reel bastidor da equipe preparando o hotel',
  'Foto detalhe que poucos hóspedes percebem',
]
function gerar20Ideias(m2: M2): string[] {
  const ideias: string[] = []
  for (const k of [...m2.diferenciais, ...m2.experiencias]) {
    if (IDEAS_BY_KEY[k] && !ideias.includes(IDEAS_BY_KEY[k]) && ideias.length < 15) {
      ideias.push(IDEAS_BY_KEY[k])
    }
  }
  if (m2.lugar_fotografado) ideias.push(`Foto do "${m2.lugar_fotografado}" — o lugar mais fotografado do hotel`)
  if (m2.espaco_oculto) ideias.push(`Reel revelação: "${m2.espaco_oculto} — poucos sabem que existe aqui"`)
  for (const idea of BASE_IDEAS) {
    if (ideias.length >= 20) break
    if (!ideias.includes(idea)) ideias.push(idea)
  }
  return ideias.slice(0, 20)
}

function gerarPlano14Dias(m1: M1, m2: M2): Array<{ dia: number; formato: string; tema: string; descricao: string }> {
  const hasCafe = m2.diferenciais.includes('cafe_incluso')
  const hasPiscina = m2.diferenciais.includes('piscina')
  const hasVista = m2.diferenciais.some(d => ['vista_mar', 'vista_serra', 'por_do_sol'].includes(d))
  const hasRest = m2.diferenciais.includes('restaurante')
  const hasLareira = m2.diferenciais.includes('lareira')
  const hasSpa = m2.diferenciais.includes('spa')
  return [
    { dia: 1,  formato: 'Reel',      tema: 'Abertura',      descricao: `"Você ainda não veio pra ${m1.nome}?"` },
    { dia: 2,  formato: 'Foto',      tema: hasCafe ? 'Café da Manhã' : 'Acomodação', descricao: hasCafe ? 'Mesa farta do café da manhã' : 'Suíte com melhor ângulo' },
    { dia: 3,  formato: 'Carrossel', tema: 'Destino',       descricao: `"O que fazer em ${m1.cidade} em 1 fim de semana"` },
    { dia: 4,  formato: 'Story',     tema: 'Engajamento',   descricao: 'Enquete interativa — deixe o público escolher' },
    { dia: 5,  formato: 'Foto',      tema: hasPiscina ? 'Piscina' : 'Área externa', descricao: hasPiscina ? 'Piscina ao entardecer' : 'Área de lazer ao fim de tarde' },
    { dia: 6,  formato: 'Reel',      tema: 'Check-in',      descricao: '"Chegou e relaxou" — experiência emocional' },
    { dia: 7,  formato: 'Carrossel', tema: 'Prova Social',  descricao: '"O que nossos hóspedes dizem de nós"' },
    { dia: 8,  formato: 'Foto',      tema: hasVista ? 'Vista' : 'Detalhe', descricao: hasVista ? 'Vista privilegiada ao pôr do sol' : 'Detalhe exclusivo que poucos percebem' },
    { dia: 9,  formato: 'Story',     tema: 'CTA',           descricao: 'Avaliação 5★ compartilhada + link na bio' },
    { dia: 10, formato: 'Reel',      tema: hasRest ? 'Gastronomia' : hasLareira ? 'Ambiente' : 'Destaque', descricao: hasRest ? 'Prato especial sendo preparado' : hasLareira ? 'Lareira acesa à noite' : `Destaque exclusivo do ${m1.nome}` },
    { dia: 11, formato: 'Carrossel', tema: 'Educativo',     descricao: '"Como escolher o quarto ideal pra você"' },
    { dia: 12, formato: 'Foto',      tema: hasSpa ? 'Spa' : 'Detalhe',  descricao: hasSpa ? 'Ambiente do spa iluminado' : 'Ângulo especial do hotel' },
    { dia: 13, formato: 'Story',     tema: 'Urgência',      descricao: '"Últimas vagas do mês — reserve pelo link na bio"' },
    { dia: 14, formato: 'Reel',      tema: 'Fechamento',    descricao: '"Você merece uma pausa. Venha."' },
  ]
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
    contexto_geo: '', publico_principal: '',
  })
  const [m2, setM2] = useState<M2>({
    diferenciais: [], experiencias: [],
    lugar_fotografado: '', lugar_bonito: '', espaco_oculto: '',
  })
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
          tipo: mapTipo(m1.tipo),
          classificacao: Number(m1.categoria),
          numero_quartos: m1.quartos,
          ticket_medio_diaria: m1.ticket_medio,
          status: 'onboarding',
          owner_id: userData.user.id,
        })
        // contexto_geo e publico_principal ficam no onboarding_respostas
        .select('id')
        .single()

      if (error || !hotel) { toast.error('Não foi possível salvar o hotel. Tente novamente.'); return null }

      // salva modulo_1 em background
      supabase.from('onboarding_respostas').insert({
        hotel_id: hotel.id,
        respostas: { modulo_1: m1 },
      }).then(() => {})

      setHotelId(hotel.id)
      return hotel.id
    } finally {
      setSaving(false)
    }
  }

  // ── Módulo 2: salvar diferenciais em onboarding_respostas ──
  async function saveM2(hid: string) {
    await supabase.from('onboarding_respostas').upsert({
      hotel_id: hid,
      respostas: { modulo_1: m1, modulo_2: m2 },
    }, { onConflict: 'hotel_id' })
  }

  // ── Módulo 3: salvar auditoria de marketing ──
  async function saveM3(hid: string) {
    const oportunidades = oportunidadesMod3(m3)
    await supabase.from('onboarding_respostas').upsert({
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

      const dueAt = new Date()
      dueAt.setDate(dueAt.getDate() + 30)

      await Promise.all([
        supabase.from('onboarding_respostas').upsert({
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
        // Starter Kit: primeira missao ativada automaticamente
        supabase.from('hotel_missoes').insert({
          hotel_id: hid,
          tipo: 'calendario_mensal',
          titulo: 'Calendario Editorial do Mes',
          descricao: 'Planejar e publicar posts 3x por semana durante 30 dias',
          objetivo: 'Consistencia e presenca digital',
          status: 'em_andamento',
          progresso: 0,
          started_at: new Date().toISOString(),
          due_at: dueAt.toISOString(),
        }),
        // Starter Kit: log de execucao
        supabase.from('hotel_execution_log').insert({
          hotel_id: hid,
          acao: 'onboarding_completo',
          categoria: 'onboarding',
          detalhes: { objetivo: m4.objetivo_principal, prazo: m4.prazo },
          pontos: 10,
        }),
      ])

      // ── Content DNA automático baseado no perfil do hotel ──
      const tipoTemas = TIPO_TEMAS[m1.tipo] || ['destino', 'experiencias']
      const difTemas = m2.diferenciais.map(k => DIF_TO_TEMA[k]).filter(Boolean)
      const temasUnicos = [...new Set([...tipoTemas, ...difTemas])].slice(0, 6)
      const formatos = ['praia', 'serra', 'natureza'].includes(m1.contexto_geo)
        ? ['reel', 'foto', 'carrossel']
        : ['carrossel', 'reel', 'foto']

      await saveContentDNA(hid, {
        publico_primario: m1.publico_principal || 'misto',
        temas_preferidos: temasUnicos,
        formatos_preferidos: formatos,
      })

      // ── Missões automáticas baseadas no diagnóstico do M3 ──
      const dueAt30 = new Date(); dueAt30.setDate(dueAt30.getDate() + 30)
      const dueAt14 = new Date(); dueAt14.setDate(dueAt14.getDate() + 14)
      const dueAt7  = new Date(); dueAt7.setDate(dueAt7.getDate() + 7)

      const missaoAuto = []
      if (m3.usa_ota === 'sim_muito') {
        missaoAuto.push(supabase.from('hotel_missoes').insert({
          hotel_id: hid, tipo: 'reducao_ota', status: 'em_andamento', progresso: 0,
          titulo: 'Redução de OTA: Canal Direto',
          descricao: 'Reduzir dependência de Booking/Airbnb gerando reservas diretas via Instagram',
          objetivo: 'Reduzir comissão de OTA em 20% nos próximos 21 dias',
          started_at: new Date().toISOString(), due_at: dueAt30.toISOString(),
        }))
      }
      if (m3.responsavel_ig === 'ninguem') {
        missaoAuto.push(supabase.from('hotel_missoes').insert({
          hotel_id: hid, tipo: 'bio_perfil', status: 'em_andamento', progresso: 0,
          titulo: 'Bio e Perfil Profissional',
          descricao: 'Otimizar bio, foto de perfil e destaques do Instagram',
          objetivo: 'Perfil profissional ativo em 7 dias',
          started_at: new Date().toISOString(), due_at: dueAt7.toISOString(),
        }))
      }
      if (m3.frequencia_posts === 'nunca' || m3.frequencia_posts === 'raramente') {
        missaoAuto.push(supabase.from('hotel_missoes').insert({
          hotel_id: hid, tipo: 'coleta_depoimentos', status: 'em_andamento', progresso: 0,
          titulo: 'Coleta de Depoimentos',
          descricao: 'Coletar 5 depoimentos reais de hóspedes para publicar como prova social',
          objetivo: '5 avaliações publicadas em 14 dias',
          started_at: new Date().toISOString(), due_at: dueAt14.toISOString(),
        }))
      }
      if (missaoAuto.length > 0) await Promise.allSettled(missaoAuto)

      // ── Posts sugestão (para Raio-X) ──
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
  const canNext = !!(data.nome && data.cidade && data.regiao && data.tipo && data.contexto_geo && data.publico_principal)

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

      {/* Contexto geográfico */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Onde fica o hotel? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CONTEXTO_GEO.map(c => (
            <button key={c.v} type="button" onClick={() => set('contexto_geo', c.v)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs transition-all border ${
                data.contexto_geo === c.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold shadow-sm'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]'
              }`}>
              <span className="text-xl">{c.e}</span>
              <span className="text-center leading-tight">{c.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Público principal */}
      <div>
        <label className="block text-sm font-medium text-[#6B7280] mb-2">
          Público principal <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PUBLICO_PRINCIPAL.map(p => (
            <button key={p.v} type="button" onClick={() => set('publico_principal', p.v)}
              className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-all border ${
                data.publico_principal === p.v
                  ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold shadow-sm'
                  : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB]'
              }`}>
              <span className="text-lg">{p.e}</span>
              <span>{p.l}</span>
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
  function toggleDif(k: string) {
    const arr = data.diferenciais.includes(k) ? data.diferenciais.filter(x => x !== k) : [...data.diferenciais, k]
    setData({ ...data, diferenciais: arr })
  }
  function toggleExp(k: string) {
    const arr = data.experiencias.includes(k) ? data.experiencias.filter(x => x !== k) : [...data.experiencias, k]
    setData({ ...data, experiencias: arr })
  }
  const totalAtivos = data.diferenciais.length + data.experiencias.length

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-[#B8860B] font-semibold uppercase tracking-wider mb-1">Módulo 2 · 5 minutos</p>
        <h2 className="text-xl font-bold text-[#1A1D26]">O que seu hotel tem e vende?</h2>
        <p className="text-sm text-[#6B7280] mt-1">Selecione tudo. Cada item vira conteúdo.</p>
      </div>

      {totalAtivos > 0 && (
        <div className="bg-[#FFF8E7] border border-[#B8860B]/20 rounded-xl px-4 py-2.5">
          <p className="text-xs text-[#B8860B] font-semibold">
            {totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''} mapeado{totalAtivos !== 1 ? 's' : ''} — cada um vira post
          </p>
        </div>
      )}

      {/* Seção A — Estrutura e diferenciais */}
      <div>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Estrutura e diferenciais</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {DIFERENCIAIS.map(d => {
            const sel = data.diferenciais.includes(d.k)
            return (
              <button key={d.k} type="button" onClick={() => toggleDif(d.k)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl text-xs transition-all border ${
                  sel ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold shadow-sm'
                      : 'bg-white border-[#E5E7EB] text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]'
                }`}>
                <span className="text-xl">{d.e}</span>
                <span className="text-center leading-tight">{d.l}</span>
                {sel && <span className="text-[10px] text-[#B8860B] font-bold">✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Seção B — Experiências e pacotes */}
      <div>
        <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">Experiências que você vende</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {EXPERIENCIAS.map(e => {
            const sel = data.experiencias.includes(e.k)
            return (
              <button key={e.k} type="button" onClick={() => toggleExp(e.k)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all border ${
                  sel ? 'bg-[#FFF8E7] border-[#B8860B] text-[#B8860B] font-semibold'
                      : 'bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                }`}>
                <span className="text-base flex-shrink-0">{e.e}</span>
                <span className="leading-tight">{e.l}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Seção C — O ouro escondido */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <p className="text-sm font-semibold text-[#1A1D26] mb-0.5">O ouro escondido do seu hotel</p>
          <p className="text-xs text-[#9CA3AF]">Esses detalhes viram os melhores reels. Deixe em branco se não souber agora.</p>
        </div>
        {[
          { field: 'lugar_fotografado' as keyof M2, label: 'Qual o lugar mais fotografado pelos hóspedes?', placeholder: 'Ex: a piscina com vista, a varanda do quarto...' },
          { field: 'lugar_bonito'     as keyof M2, label: 'Qual o espaço mais bonito do hotel?',             placeholder: 'Ex: o jardim à noite, o deck do pôr do sol...' },
          { field: 'espaco_oculto'   as keyof M2, label: 'Tem algo especial que quase ninguém mostra?',      placeholder: 'Ex: a adega particular, a trilha secreta...' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-xs font-medium text-[#6B7280] mb-1">{label}</label>
            <input
              type="text"
              value={data[field] as string}
              onChange={e => setData({ ...data, [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3.5 bg-[#F3F4F6] text-[#6B7280] font-medium rounded-xl hover:bg-[#E5E7EB] transition-colors">
          Voltar
        </button>
        <button onClick={onNext} className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all">
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
// RAIO-X FINAL
// ─────────────────────────────────────────────
function Resultado({
  m1, m2, m3, m4, posts, hotelId,
}: {
  m1: M1; m2: M2; m3: M3; m4: M4; posts: any[]; hotelId: string | null
}) {
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState<'ativos' | 'ideias' | 'plano'>('ativos')

  const manchete = gerarManchete(m1, m2)
  const ativos = gerarAtivos(m2)
  const ideias = gerar20Ideias(m2)
  const plano = gerarPlano14Dias(m1, m2)
  const oportunidades = oportunidadesMod3(m3)
  const foco = focoEstrategico(m4.objetivo_principal)
  const obj = OBJETIVOS.find(o => o.v === m4.objetivo_principal)
  const geo = CONTEXTO_GEO.find(c => c.v === m1.contexto_geo)
  const pub = PUBLICO_PRINCIPAL.find(p => p.v === m1.publico_principal)

  const FORMATO_COR: Record<string, string> = {
    Reel: 'bg-purple-100 text-purple-700', Foto: 'bg-blue-100 text-blue-700',
    Carrossel: 'bg-emerald-100 text-emerald-700', Story: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Cabeçalho celebratório */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#B8860B]/30 text-[#B8860B] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
          ✨ Raio-X do {m1.nome} — Pronto
        </div>
      </div>

      {/* Manchete de encantamento */}
      <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFF3CD] border border-[#B8860B]/20 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-[#B8860B] font-bold uppercase tracking-wider mb-2">Diagnóstico</p>
        <p className="text-base font-bold text-[#1A1D26] leading-snug">{manchete}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-white/80 text-[#92660A] border border-[#B8860B]/20 px-3 py-1 rounded-full font-medium">
            {m1.tipoEmoji} {m1.tipoLabel}
          </span>
          {geo && <span className="text-xs bg-white/80 text-[#92660A] border border-[#B8860B]/20 px-3 py-1 rounded-full font-medium">{geo.e} {geo.l}</span>}
          {pub && <span className="text-xs bg-white/80 text-[#92660A] border border-[#B8860B]/20 px-3 py-1 rounded-full font-medium">{pub.e} {pub.l}</span>}
        </div>
      </div>

      {/* Oportunidades */}
      {oportunidades.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-2">Oportunidades identificadas</p>
          <div className="space-y-2">
            {oportunidades.map(op => (
              <div key={op} className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl">
                <p className="text-sm text-amber-800">{op}</p>
              </div>
            ))}
          </div>
          {obj && (
            <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
              <p className="text-xs text-[#9CA3AF] mb-1">Foco recomendado</p>
              <p className="text-sm text-[#374151]">{foco}</p>
            </div>
          )}
        </div>
      )}

      {/* Abas — Ativos / 20 Ideias / Plano 14 dias */}
      <div>
        <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl mb-3">
          {([
            { id: 'ativos', label: `Ouro (${ativos.length})` },
            { id: 'ideias', label: '20 Ideias' },
            { id: 'plano',  label: 'Plano 14d' },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setAbaAtiva(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                abaAtiva === t.id ? 'bg-white text-[#1A1D26] shadow-sm' : 'text-[#6B7280]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Aba: Ouro nas mãos */}
        {abaAtiva === 'ativos' && (
          <div className="space-y-2">
            {ativos.length === 0 ? (
              <p className="text-sm text-[#9CA3AF] text-center py-6">Volte e selecione seus diferenciais para ver os ativos.</p>
            ) : ativos.map((a, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-sm">
                <span className="text-xl flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1D26]">{a.label}</p>
                  <p className="text-xs text-[#B8860B] font-medium">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aba: 20 Ideias */}
        {abaAtiva === 'ideias' && (
          <div className="space-y-2">
            {ideias.map((ideia, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-sm">
                <span className="text-xs bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/20 px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-[#374151]">{ideia}</p>
              </div>
            ))}
          </div>
        )}

        {/* Aba: Plano 14 dias */}
        {abaAtiva === 'plano' && (
          <div className="space-y-2">
            {plano.map(d => (
              <div key={d.dia} className="flex items-start gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-sm">
                <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5 w-10 text-center">
                  D{d.dia}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${FORMATO_COR[d.formato] || 'bg-gray-100 text-gray-600'}`}>
                      {d.formato}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">{d.tema}</span>
                  </div>
                  <p className="text-sm text-[#374151]">{d.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => router.push('/dashboard/post-do-dia')}
          className="w-full py-4 bg-[#B8860B] hover:brightness-110 text-white font-bold rounded-xl transition-all text-base shadow-md"
        >
          Gerar Post do Dia →
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/dashboard/calendario')}
            className="py-3 bg-white border border-[#E5E7EB] text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors text-sm"
          >
            Ver Calendário
          </button>
          <button
            onClick={() => router.push('/dashboard/biblioteca')}
            className="py-3 bg-white border border-[#E5E7EB] text-[#6B7280] font-medium rounded-xl hover:bg-[#F3F4F6] transition-colors text-sm"
          >
            Ver Biblioteca
          </button>
        </div>
      </div>
    </div>
  )
}
