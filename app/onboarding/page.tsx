'use client'

import { useEffect,useRef,useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {saveOnboarding,resumeOnboarding} from './actions'
import {UFS,HOTEL_TIMEZONES,hotelTimezone,minimumAccommodation,profileFrom,identity,editorialPreferences,minimumDiagnosis} from '@/lib/hotel/v2/domain'
import {MinimumDiagnosisFields,type MinimumDiagnosis} from '@/components/hotel/minimum-diagnosis'
import {EditorialPreferencesFields,EditorialPreferencesSummary,type EditorialAnswers} from '@/components/hotel/editorial-preferences'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Screen = 'mod1' | 'entrega1' | 'mod2' | 'entrega2' | 'mod3' | 'entrega3' | 'mod4' | 'resultado'

interface M1 {
  timezone:string; nome: string; cidade: string; estado: string; regiao: string; tipo: string; tipoLabel: string; tipoEmoji: string
  quartos: number; categoria: string; ticket_medio: number
  contexto_geo: string; publico_principal: string
}
interface M2 extends EditorialAnswers {
  diagnostico?:MinimumDiagnosis
  diferenciais: string[]
  experiencias: string[]
  lugar_fotografado: string
  lugar_bonito: string
  espaco_oculto: string
  detalhe_confirmado:string;condicoes_confirmadas:string;fatos_validos_ate:string;fatos_confirmados:boolean
}
interface M3 {
  posts_por_semana:number;minutos_disponiveis:number;video_disponivel:boolean
  frequencia_posts: string; usa_ota: string; conhece_origem: string
  fez_publi: string; responsavel_ig: string; maior_desafio: string
}
interface M4 { pacotes: string[]; objetivo_principal: string; prazo: string }

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
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
  { v: 'aventureiros', e: '🌿', l: 'Aventureiros' },
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
function insightsMod2(diferenciais:string[]):string[]{return ['Itens selecionados são informações autodeclaradas; confirme categoria, condições e validade antes de usar.','Planeje texto ou foto própria conforme seus recursos. Nenhum alcance, reserva ou crescimento é presumido.']}
function oportunidadesMod3(m3:M3):string[]{return [`Capacidade informada: ${m3.posts_por_semana} sugestões por semana e ${m3.minutos_disponiveis} minutos por conteúdo.`,m3.video_disponivel?'Vídeo disponível por escolha sua; continua opcional e depende de direitos de mídia.':'Sem vídeo: priorize textos e fotos próprias. Não há API de criação obrigatória.']}
function focoEstrategico(objetivo:string):string{return 'Use o objetivo informado para acompanhar sua rotina. O calendário organiza preparação, não promete seguidores, engajamento ou reservas.'}
function gerarManchete(m1:M1,m2:M2):string{return `${m1.nome}: perfil informado em ${m1.cidade}/${m1.estado}. As informações e condições precisam de confirmação factual; o diagnóstico não certifica serviços nem resultados.`}
function gerarAtivos(m2:M2):Array<{emoji:string;label:string;content:string}>{return [...m2.diferenciais.map(k=>DIFERENCIAIS.find(d=>d.k===k)),...m2.experiencias.map(k=>EXPERIENCIAS.find(e=>e.k===k))].filter((v):v is {k:string;e:string;l:string}=>!!v).map(v=>({emoji:v.e,label:v.l,content:'Informado por você: confirme condições e direitos antes de preparar conteúdo.'}))}
function gerarPerguntas(m2:M2):string[]{return ['O nome e a localização correspondem à categoria divulgada?','O detalhe descrito está confirmado e ainda é válido?','As condições e restrições estão claras, sem amenidades presumidas?','A foto é própria e representa o espaço ou categoria correta?','Há autorização específica para pessoas, imagens ou músicas?','O texto respeita o tempo e os recursos disponíveis?','A revisão exata foi salva antes de exportar?']}

function gerarPlano7Dias(m1:M1,m2:M2):Array<{dia:number;formato:string;tema:string;descricao:string}>{return ['Confirme fatos e condições','Prepare foto própria da categoria correta','Revise a localização informada','Convide o público a compartilhar dúvidas','Confira o texto e os direitos da mídia','Adapte um rascunho à sua rotina','Revise a próxima semana sem prometer reserva'].map((descricao,i)=>({dia:i+1,formato:'Texto',tema:'Preparação',descricao}))}

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
    timezone:'', nome: '', cidade: '', estado: '', regiao: '', tipo: '', tipoLabel: '', tipoEmoji: '',
    quartos: 20, categoria: '3', ticket_medio: 0,
    contexto_geo: '', publico_principal: '',
  })
  const [m2, setM2] = useState<M2>({
    tom:'',temas_vetados:[],vetos_confirmados:false,
    diferenciais: [], experiencias: [],
    lugar_fotografado: '', lugar_bonito: '', espaco_oculto: '',detalhe_confirmado:'',condicoes_confirmadas:'',fatos_validos_ate:'',fatos_confirmados:false,
  })
  const [m3, setM3] = useState<M3>({
    posts_por_semana:3,minutos_disponiveis:10,video_disponivel:false,frequencia_posts: '', usa_ota: '', conhece_origem: '',
    fez_publi: '', responsavel_ig: '', maior_desafio: '',
  })
  const [m4, setM4] = useState<M4>({ pacotes: [], objetivo_principal: '', prazo: '' })

  const [resuming,setResuming]=useState(true)
  const [saveError,setSaveError]=useState<string|null>(null)
  const screenRef=useRef<HTMLDivElement|null>(null)
  useEffect(()=>{if(!resuming)screenRef.current?.focus()},[screen,resuming])
  const errorRef=useRef<HTMLParagraphElement|null>(null)
  useEffect(()=>{if(saveError)errorRef.current?.focus()},[saveError])
  const [actorId,setActorId]=useState<string|null>(null)
  const [remote,setRemote]=useState<Awaited<ReturnType<typeof resumeOnboarding>>|null>(null)
  const revision=useRef(0),stableHotelId=useRef<string|null>(null),pending=useRef<Record<number,string>>({}),busy=useRef(false)
  function applyAnswers(r:Record<string,any>){if(r.modulo_1)setM1(v=>({...v,...r.modulo_1}));if(r.modulo_2)setM2(v=>({...v,...r.modulo_2}));if(r.modulo_3)setM3(v=>({...v,...r.modulo_3}));if(r.modulo_4)setM4(v=>({...v,...r.modulo_4}))}
  useEffect(()=>{let active=true;resumeOnboarding().then(row=>{
    if(!active)return
    setActorId(row.actor_id);stableHotelId.current=row.hotel_id;setHotelId(row.hotel_id);revision.current=row.revision;applyAnswers(row.answers)
    let buffer:any=null;try{buffer=JSON.parse(sessionStorage.getItem('hotel-onboarding:'+row.actor_id)??'null')}catch{}
    if(!buffer?.answers||(row.hotel_id&&buffer.hotelId!==row.hotel_id))buffer=null
    if(buffer?.answers&&(!row.hotel_id||buffer.hotelId===row.hotel_id)){
      applyAnswers(buffer.answers);stableHotelId.current=buffer.hotelId??row.hotel_id;setHotelId(stableHotelId.current)
      if(Number.isInteger(buffer.revision))revision.current=buffer.revision
      if(buffer.pending&&typeof buffer.pending==='object')pending.current=buffer.pending
      if(buffer.revision!==row.revision){setRemote(row);setSaveError('Seu rascunho local foi preservado. Compare a revisão remota antes de substituir.')}
    }
    const bufferedScreen=buffer?.screen
    if(['mod1','entrega1','mod2','entrega2','mod3','entrega3','mod4','resultado'].includes(bufferedScreen))setScreen(bufferedScreen==='resultado'&&!row.complete?'mod2':bufferedScreen)
    else setScreen(row.complete?'resultado':row.last_module===1?'mod2':row.last_module===2?'mod3':row.last_module===3||row.last_module===4?'mod4':'mod1')
    if(row.complete){try{hotelTimezone((buffer?.answers??row.answers).modulo_1?.timezone)}catch{setScreen('mod1');setSaveError('Confirme o fuso da hospedagem no módulo 1. Os campos e textos anteriores foram preservados.');return}try{editorialPreferences(row.answers.modulo_2);minimumDiagnosis(row.answers.modulo_2?.diagnostico);profileFrom(row.answers,row.hotel_id,row.revision);if(buffer)editorialPreferences(buffer.answers.modulo_2??row.answers.modulo_2)}catch{setScreen('mod2');setSaveError('Confirme tom e vetos no módulo 2, incluindo os mínimos do diagnóstico, antes de concluir a reconfirmação. O perfil e os textos anteriores foram preservados.')}}
  }).catch(err=>{if(active)setSaveError(err instanceof Error?err.message:'Não foi possível retomar. Nenhum perfil padrão foi usado.')}).finally(()=>{if(active)setResuming(false)});return()=>{active=false}},[])
  useEffect(()=>{if(!actorId||resuming)return;sessionStorage.setItem('hotel-onboarding:'+actorId,JSON.stringify({hotelId:stableHotelId.current,revision:revision.current,pending:pending.current,screen,answers:{modulo_1:m1,modulo_2:m2,modulo_3:m3,modulo_4:m4}}))},[m1,m2,m3,m4,screen,saving,remote,saveError,actorId,resuming])
  function go(next:Screen){setScreen(next);setVisible(true)}
  async function saveModule(module:number,next:Screen){
    if(busy.current||resuming)return
    busy.current=true;setSaving(true);setSaveError(null)
    try{
      identity(m1);hotelTimezone(m1.timezone);const hid=stableHotelId.current??crypto.randomUUID();stableHotelId.current=hid;pending.current[module]??=crypto.randomUUID()
      const result=await saveOnboarding({hotelId:hid,module,revision:revision.current,operationId:pending.current[module],snapshot:{modulo_1:{...m1,tipo_db:mapTipo(m1.tipo)},modulo_2:m2,modulo_3:m3,modulo_4:m4}})
      revision.current=result.revision;setHotelId(result.hotel_id);delete pending.current[module];setRemote(null);go(next)
    }catch(err){const message=err instanceof Error?err.message:'Ainda não conseguimos confirmar o salvamento. Seus campos permanecem aqui.';setSaveError(message);toast.error(message);if(message.includes('REVISION_CONFLICT')||message.includes('IDEMPOTENCY_CONFLICT')){try{setRemote(await resumeOnboarding())}catch{}}}
    finally{busy.current=false;setSaving(false)}
  }
  async function handleM1(){await saveModule(1,'entrega1')}
  async function handleM2(){await saveModule(2,'entrega2')}
  async function handleM3(){await saveModule(3,'entrega3')}
  async function handleM4(){await saveModule(4,'resultado')}

  const moduloAtual = screenToModulo(screen)
  const progress = screen === 'resultado' ? 100 : (moduloAtual / 4) * 100

  return (
    <div className="space-y-5">
      {resuming&&<p role="status">Retomando seu diagnóstico confirmado...</p>}
      {screen==='resultado'&&<button type="button" onClick={()=>{setScreen('mod1');setSaveError(null)}} className="w-full p-4 border rounded-xl font-semibold text-left">Revisar e reconfirmar meu negócio e fatos. Planos e textos anteriores serão preservados.</button>}
      {screen==='resultado'&&<button type="button" onClick={()=>{setScreen('mod2');setSaveError(null)}} className="w-full p-4 border rounded-xl font-semibold text-left">Editar tom e vetos. Conclua a reconfirmação para ativar o novo DNA.</button>}
      {saveError&&<p ref={errorRef} tabIndex={-1} role="alert" className="p-3 rounded-xl bg-amber-50 text-amber-900 focus-visible:outline-2">{saveError}</p>}
      {remote&&<section aria-label="Conflito de diagnóstico" className="border rounded-xl p-3 space-y-3"><p>Revisão remota r{remote.revision}, sem apagar seus campos locais.</p><EditorialPreferencesSummary tone={remote.answers.modulo_2?.tom??''} avoid={remote.answers.modulo_2?.temas_vetados??[]}/><textarea aria-label="Dados remotos do diagnóstico" readOnly rows={8} value={JSON.stringify(remote.answers,null,2)} className="w-full p-3 border rounded-xl"/><button type="button" onClick={()=>{revision.current=remote.revision;stableHotelId.current=remote.hotel_id??stableHotelId.current;setHotelId(stableHotelId.current);pending.current={};setRemote(null);setSaveError('Campos locais mantidos. Revise antes de salvar explicitamente sobre a revisão remota.')}} className="p-3 border rounded-lg">Manter meus campos e usar a revisão remota esperada; salvar depois</button><button type="button" onClick={()=>{applyAnswers(remote.answers);revision.current=remote.revision;stableHotelId.current=remote.hotel_id??stableHotelId.current;pending.current={};setRemote(null);setSaveError('Dados remotos disponíveis carregados. Campos ainda não enviados foram mantidos como rascunho.')}} className="p-3 border rounded-lg">Carregar dados remotos disponíveis</button></section>}
      {!actorId&&!resuming&&<button type="button" onClick={()=>window.location.reload()} className="p-3 border rounded-lg">Retentar leitura segura antes de editar</button>}
      <fieldset disabled={saving||resuming||!actorId} aria-busy={saving||resuming} className="min-w-0 space-y-5">
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
        ref={screenRef} tabIndex={-1} role="group" aria-label="Etapa do diagnóstico"
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
      </fieldset>
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
  const canNext = !!(data.timezone && data.nome && data.cidade && data.estado && data.regiao && data.tipo && data.contexto_geo && data.publico_principal)

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
        <label htmlFor="onboarding-nome" className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Nome do hotel <span className="text-red-500">*</span>
        </label>
        <input
          id="onboarding-nome" value={data.nome}
          onChange={e => set('nome', e.target.value)}
          placeholder="Ex: Pousada Villa do Sol"
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] transition-colors"
        />
      </div>

      {/* Cidade */}
      <div>
        <label htmlFor="onboarding-cidade" className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Cidade <span className="text-red-500">*</span>
        </label>
        <input
          id="onboarding-cidade" value={data.cidade}
          onChange={e => set('cidade', e.target.value)}
          placeholder="Ex: Natal"
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-xl text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] transition-colors"
        />
      </div>

      <label className="block" htmlFor="hotel-timezone">Fuso horário confirmado *<select id="hotel-timezone" value={data.timezone??''} onChange={e=>set('timezone',e.target.value)} className="w-full h-11 px-4 border rounded-xl"><option value="">Selecione o fuso da hospedagem</option>{HOTEL_TIMEZONES.map(zone=><option key={zone} value={zone}>{zone}</option>)}</select></label>
      <div><label htmlFor="hotel-uf" className="block text-sm font-medium mb-1.5">UF confirmada *</label><select id="hotel-uf" value={data.estado} onChange={e=>set('estado',e.target.value)} className="w-full h-11 px-4 border rounded-xl"><option value="">Selecione a UF, sem inferir pela região</option>{UFS.map(uf=><option key={uf} value={uf}>{uf}</option>)}</select></div>
      {/* Região */}
      <div>
        <label htmlFor="onboarding-regiao" className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Região <span className="text-red-500">*</span>
        </label>
        <select
          id="onboarding-regiao" value={data.regiao}
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
              aria-pressed={data.tipo===t.v} onClick={() => setData({ ...data, tipo: t.v, tipoLabel: t.l, tipoEmoji: t.e })}
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
            <button key={c.v} type="button" aria-pressed={data.contexto_geo===c.v} onClick={() => set('contexto_geo', c.v)}
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
            <button key={p.v} type="button" aria-pressed={data.publico_principal===p.v} onClick={() => set('publico_principal', p.v)}
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
        <label htmlFor="onboarding-quartos" className="block text-sm font-medium text-[#6B7280] mb-2">
          Número de quartos:{' '}
          <span className="text-[#B8860B] font-bold">{data.quartos}</span>
        </label>
        <input
          id="onboarding-quartos" type="range"
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
              aria-pressed={data.categoria===c.v} onClick={() => set('categoria', c.v)}
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
        <label htmlFor="onboarding-ticket" className="block text-sm font-medium text-[#6B7280] mb-1.5">
          Ticket médio diária casal (R$)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-medium select-none">
            R$
          </span>
          <input
            type="number"
            id="onboarding-ticket" value={data.ticket_medio || ''}
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
  let editorialValid=false;try{editorialPreferences(data);minimumDiagnosis(data.diagnostico);minimumAccommodation(data);editorialValid=true}catch{}

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
          { field: 'lugar_bonito'     as keyof M2, label: 'Categoria ou experiência a apresentar (obrigatório)',             placeholder: 'Ex: o jardim à noite, o deck do pôr do sol...' },
          { field: 'espaco_oculto'   as keyof M2, label: 'Tem algo especial que quase ninguém mostra?',      placeholder: 'Ex: a adega particular, a trilha secreta...' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label htmlFor={'onboarding-'+field} className="block text-xs font-medium text-[#6B7280] mb-1">{label}</label>
            <input
              type="text"
              id={'onboarding-'+field} value={data[field] as string}
              onChange={e => setData({ ...data, [field]: e.target.value })}
              placeholder={placeholder}
              className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]"
            />
          </div>
        ))}
      </div>

      <div className="space-y-3 p-4 border rounded-xl"><h3 className="font-semibold">Fatos para os rascunhos</h3><p className="text-sm">Sem confirmação, modelos afetados ficam indisponíveis. Não afirme preço, nota ou disponibilidade.</p>
        <label className="block">Descrição factual da categoria ou experiência (obrigatório)<input value={data.detalhe_confirmado} onChange={e=>setData({...data,detalhe_confirmado:e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Ex.: mesa de apoio na acomodação Jardim"/></label>
        <label className="block">Condições confirmadas<input value={data.condicoes_confirmadas} onChange={e=>setData({...data,condicoes_confirmadas:e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Consulte a categoria e o que está incluído"/></label>
        <label className="block">Reconfirmar fatos até<input type="date" value={data.fatos_validos_ate} onChange={e=>setData({...data,fatos_validos_ate:e.target.value})} className="w-full p-3 border rounded-lg"/></label>
        <label className="flex gap-2"><input type="checkbox" checked={data.fatos_confirmados} onChange={e=>setData({...data,fatos_confirmados:e.target.checked})}/>Confirmo estes dados e revisarei condições e mídia antes de usar.</label></div>
      <MinimumDiagnosisFields value={data.diagnostico} onChange={diagnostico=>setData({...data,diagnostico})}/>
      <EditorialPreferencesFields value={data} onChange={editorial=>setData({...data,...editorial})}/>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3.5 bg-[#F3F4F6] text-[#6B7280] font-medium rounded-xl hover:bg-[#E5E7EB] transition-colors">
          Voltar
        </button>
        <button onClick={onNext} disabled={!editorialValid} className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
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
      <div className="p-4 border rounded-xl bg-white"><EditorialPreferencesSummary tone={m2.tom} avoid={m2.temas_vetados}/></div>
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

      <div className="space-y-3 p-4 border rounded-xl"><label className="block">Publicações possíveis por semana (sete datas não obrigam sete posts)<input type="number" min="1" max="7" value={data.posts_por_semana} onChange={e=>setData({...data,posts_por_semana:Number(e.target.value)})} className="w-full p-3 border rounded-lg"/></label><label className="block">Minutos disponíveis por conteúdo<input type="number" min="5" max="120" value={data.minutos_disponiveis} onChange={e=>setData({...data,minutos_disponiveis:Number(e.target.value)})} className="w-full p-3 border rounded-lg"/></label><label className="flex gap-2"><input type="checkbox" checked={data.video_disponivel} onChange={e=>setData({...data,video_disponivel:e.target.checked})}/>Tenho vídeo próprio/licenciado e posso filmar.</label></div>
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
  const ideias = gerarPerguntas(m2)
  const plano = gerarPlano7Dias(m1, m2)
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
      <section aria-label="Tom e vetos do diagnóstico" className="p-4 border rounded-xl bg-white"><EditorialPreferencesSummary tone={m2.tom} avoid={m2.temas_vetados}/><p className="mt-2 text-sm">A mudança de DNA orienta sugestões futuras. Textos já editados precisam de comparação e revisão humana.</p></section>
      {/* Cabeçalho celebratório */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-2 bg-[#FFF8E7] border border-[#B8860B]/30 text-[#B8860B] px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
          ✨ Raio-X do {m1.nome} — Pronto
        </div>
      </div>

      {/* Manchete de encantamento */}
      <div className="bg-gradient-to-br from-[#FFF8E7] to-[#FFF3CD] border border-[#B8860B]/20 rounded-2xl p-5 shadow-sm">
        <p className="text-xs text-[#B8860B] font-bold uppercase tracking-wider mb-2">Perfil e preparação, não certificação factual</p>
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

      {/* Abas — Ativos / Perguntas / Prévia de preparação: 7 dias */}
      <div>
        <div className="flex gap-1 bg-[#F3F4F6] p-1 rounded-xl mb-3">
          {([
            { id: 'ativos', label: `Informados (${ativos.length})` },
            { id: 'ideias', label: 'Perguntas' },
            { id: 'plano',  label: 'Prévia 7d' },
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

        {/* Aba: Perguntas */}
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

        {/* Aba: Prévia de preparação: 7 dias */}
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
