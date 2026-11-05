/** Pure recomposed product policy. No SDK, network, secrets, database or implicit LAB mode. */
export class HotelError extends Error {
  code: string
  constructor(code: string, message: string) { super(message); this.code = code }
}
export function checked<T>(result: { data?: T; error?: unknown }, operation: string): T | undefined {
  if (result.error) throw new HotelError('STORAGE_FAILED', `Não foi possível confirmar ${operation}. Seus campos foram preservados; tente novamente.`)
  return result.data
}
export function publicConfiguration(env: { NEXT_PUBLIC_SUPABASE_URL?: string; NEXT_PUBLIC_SUPABASE_ANON_KEY?: string }) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim(), key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !key) throw new HotelError('CONFIGURATION_REQUIRED', 'CONFIGURATION_REQUIRED: configuração operacional ausente. O LAB sintético é separado.')
  let parsed: URL
  try { parsed = new URL(url) } catch { throw new HotelError('CONFIGURATION_INVALID', 'CONFIGURATION_INVALID: URL pública inválida.') }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' || /example|placeholder|seu-projeto|localhost/i.test(parsed.hostname)) throw new HotelError('CONFIGURATION_INVALID', 'CONFIGURATION_INVALID: use destino HTTPS público válido, sem placeholders.')
  if (key.length < 30 || /placeholder|sua-chave|service_role|sb_secret_/i.test(key)) throw new HotelError('CONFIGURATION_INVALID', 'CONFIGURATION_INVALID: somente chave pública anon ou publishable.')
  if (!key.startsWith('sb_publishable_')) {
    try { const data = JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); if (data.role !== 'anon') throw Error('role') }
    catch { throw new HotelError('CONFIGURATION_INVALID', 'CONFIGURATION_INVALID: somente chave pública anon ou publishable.') }
  }
  return { url, key }
}
export const HOTEL_TIMEZONES = ['America/Noronha','America/Belem','America/Fortaleza','America/Recife','America/Araguaina','America/Maceio','America/Bahia','America/Sao_Paulo','America/Campo_Grande','America/Cuiaba','America/Santarem','America/Porto_Velho','America/Boa_Vista','America/Manaus','America/Eirunepe','America/Rio_Branco']
export function hotelTimezone(value:unknown):string {if(typeof value!=='string'||!HOTEL_TIMEZONES.includes(value))throw new HotelError('TIMEZONE_REQUIRED','Confirme o fuso horário da hospedagem; a UF não determina sozinha o fuso.');return value}
export function localDay(timezone:unknown,instant:Date=new Date()):string {return new Intl.DateTimeFormat('en-CA',{timeZone:hotelTimezone(timezone),year:'numeric',month:'2-digit',day:'2-digit'}).format(instant)}
export function minimumAccommodation(value:any) {if(!value||['lugar_bonito','detalhe_confirmado'].some(k=>typeof value[k]!=='string'||!value[k].trim()||Array.from(value[k]).length>1000))throw new HotelError('ACCOMMODATION_REQUIRED','Informe uma categoria ou experiência e sua descrição factual no módulo 2.');return {name:value.lugar_bonito.trim(),description:value.detalhe_confirmado.trim()}}
export function safeAuthReturn(value:string|null,origin:string):string {if(!value||!value.startsWith('/')||value.startsWith('//')||/[\\\x00-\x20]/.test(value))return '/dashboard';try{const url=new URL(value,origin);return url.origin===origin&&!url.username&&!url.password?url.pathname+url.search+url.hash:'/dashboard'}catch{return '/dashboard'}}
export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
export function audience(value: string) {
  const map: Record<string,string> = { casal:'casais',casais:'casais',familia:'familias',familias:'familias',corporativo:'negocios',negocios:'negocios',aventureiros:'aventureiros' }
  if (!map[value]) throw new HotelError('AUDIENCE_REQUIRED','Confirme um público principal entre as opções atendidas. Público misto não equivale a casais.')
  return map[value]
}
export function identity(value: { nome: string; cidade: string; estado: string; publico_principal: string }) {
  if (!value?.nome?.trim() || !value.cidade?.trim() || !UFS.includes(value.estado)) throw new HotelError('IDENTITY_REQUIRED','Confirme nome, município e UF. Região não determina o estado.')
  return { ...value,nome:value.nome.trim(),cidade:value.cidade.trim(),publico_primario:audience(value.publico_principal) }
}
export function ownedHotel<T extends { id: string; owner_id: string }>(actor: { id: string } | null, rows: T[], requestedId?: string): T | null {
  if (!actor) throw new HotelError('SESSION_EXPIRED','Entre novamente para continuar com seu estabelecimento.')
  if (rows.some(row => row.owner_id !== actor.id)) throw new HotelError('ACCESS_DENIED','Você não tem acesso a este conteúdo.')
  if (rows.length > 1) throw new HotelError('AMBIGUOUS_OWNER','Há mais de um estabelecimento vinculado. Reconcilie o vínculo; nenhum foi escolhido por padrão.')
  const hotel = rows[0] ?? null
  if (requestedId && requestedId !== hotel?.id) throw new HotelError('ACCESS_DENIED','Você não tem acesso a este conteúdo.')
  return hotel
}
export function writable(hotel: { status?: string } | null, purpose: 'onboarding' | 'write' = 'write') {
  if (!hotel && purpose === 'onboarding') return
  const allowed = purpose === 'onboarding' ? ['lead','onboarding','ativo'] : ['ativo']
  if (!hotel?.status || !allowed.includes(hotel.status)) throw new HotelError('WRITE_SUSPENDED','Novas alterações e exportações estão bloqueadas neste estado. O histórico autorizado permanece somente para leitura.')
}
export function internalAdmin(user: { app_metadata?: Record<string,unknown> } | null) {
  if (user?.app_metadata?.hotel_internal_admin !== true) throw new HotelError('ACCESS_DENIED','Acesso administrativo não autorizado.')
}
export async function readDNA<T>(read: () => Promise<{data?:T | null;error?:unknown}>): Promise<T | null> { return checked(await read(),'a leitura do DNA') ?? null }
export async function writeDNA(write: () => Promise<{error?:unknown}>) { checked(await write(),'o salvamento do DNA') }
export type Attempt = { hotelId:string; previousRevision:number; module:number; operationId:string }
export type Receipt = { hotel_id:string; revision:number; complete:boolean; module:number; operation_id:string }
export async function persistOnboarding(write: () => Promise<{data?:Receipt;error?:unknown}>, attempt: Attempt): Promise<Receipt> {
  const r = checked(await write(),'o diagnóstico')
  if (!attempt || !r || r.hotel_id !== attempt.hotelId || !Number.isInteger(r.revision) || r.revision < 1 || r.revision !== attempt.previousRevision + 1 || typeof r.complete !== 'boolean' || r.complete !== (attempt.module === 4) || r.module !== attempt.module || r.operation_id !== attempt.operationId) throw new HotelError('INVALID_RECEIPT','O serviço não confirmou esta tentativa e revisão. Não avance; seus campos foram preservados.')
  return r
}
export type Fact = { value:string; confirmed:boolean; source:string; valid_until:string }
export const EDITORIAL_TONES = {acolhedor:'Acolhedor',direto:'Direto',elegante:'Elegante'} as const
export type EditorialTone = keyof typeof EDITORIAL_TONES
export const EDITORIAL_PILLARS:Record<string,string> = {acomodacao:'Acomodação',hospitalidade:'Hospitalidade',ambiente:'Ambiente',planejamento:'Planejamento',identidade:'Identidade',destino:'Destino',bastidores:'Bastidores',conversa:'Conversa',confianca:'Confiança'}
const TONE_OPENINGS:Record<EditorialTone,string> = {acolhedor:'Conheça nossa hospedagem com calma.',direto:'Confira as informações da hospedagem.',elegante:'Apresentamos os detalhes da nossa hospedagem.'}
export function editorialPreferences(value:any):{tone:EditorialTone;avoid:string[]} {
  if (!value || typeof value.tom!=='string' || !Object.hasOwn(EDITORIAL_TONES,value.tom)) throw new HotelError('TONE_REQUIRED','Confirme o tom editorial: Acolhedor, Direto ou Elegante.')
  if (!Array.isArray(value.temas_vetados) || value.temas_vetados.some((v:unknown)=>typeof v!=='string'||!Object.hasOwn(EDITORIAL_PILLARS,v)) || new Set(value.temas_vetados).size!==value.temas_vetados.length || value.vetos_confirmados!==true) throw new HotelError('VETO_CONFIRMATION_REQUIRED','Confirme os temas vetados, inclusive quando nenhum tema estiver vetado.')
  return {tone:value.tom as EditorialTone,avoid:Object.keys(EDITORIAL_PILLARS).filter(p=>value.temas_vetados.includes(p))}
}
export function hasEditorialProfile(value:any):boolean {
  try{minimumDiagnosis(value?.diagnosis);hotelTimezone(value?.timezone);minimumAccommodation({lugar_bonito:value?.accommodation?.name,detalhe_confirmado:value?.accommodation?.description})}catch{return false}
  return !!value && typeof value.tone==='string' && Object.hasOwn(EDITORIAL_TONES,value.tone) && value.editorial_confirmed===true && Array.isArray(value.avoid) && value.avoid.every((p:unknown)=>typeof p==='string'&&Object.hasOwn(EDITORIAL_PILLARS,p)) && new Set(value.avoid).size===value.avoid.length
}
export function minimumDiagnosis(value:any) {
 if (!value || ['motivo_viagem','promessa','canal_consulta','pendencias'].some(k=>typeof value[k]!=='string'||!value[k].trim()||Array.from(value[k]).length>1000) || typeof value.fotos_autorizadas!=='boolean' || typeof value.pessoas_autorizadas!=='boolean') throw new HotelError('DIAGNOSIS_REQUIRED','Confirme motivo de viagem, promessa, canal, pendências e autorização de fotos e pessoas no módulo 2.')
 return {motivo_viagem:value.motivo_viagem.trim(),promessa:value.promessa.trim(),canal_consulta:value.canal_consulta.trim(),pendencias:value.pendencias.trim(),fotos_autorizadas:value.fotos_autorizadas,pessoas_autorizadas:value.pessoas_autorizadas}
}
export type Profile = { timezone?:string; accommodation?:{name:string;description:string}; diagnosis?:ReturnType<typeof minimumDiagnosis>; photography?:boolean; hotel_id:string; dna_version:string; tone:EditorialTone; editorial_confirmed:true; audience:string; preferred:string[]; avoid:string[]; minutes:number; filming:boolean; people:boolean; posts_per_week:number; facts:Record<string,Fact> }
export type Template = { id:string; version:number; title:string; format:string; pillar:string; production_minutes:number; requires_filming:boolean; requires_people:boolean; audience_tags:string[]; required_variables:string[]; content:Record<string,string | string[]>; origin:string; rights_status:string; editorial_reviewed?:boolean }
export type Review = { revision:number; exact_text:string; exact_title?:string; dna_version:string; actor_id:string; reviewed_on:string }
export type Draft = { id:string; revision:number; date:string; state:'DRAFT'; intention:'preparar'|'sugerir_publicacao'; template_id:string; template_version:number; dna_version:string; title:string; format:string; minutes:number; reason:string; text:string; facts_used:Record<string,Fact>; editorial_review:Review | null }
export function validDate(value:string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10) === value }
const prohibited = /últimas? vagas?|[5５]\s*(?:[★⭐]|estrelas?)|cinco estrelas|garant(?:ia|ido)|menor tarifa|melhor hospedagem|\b\d+%|viraliza/iu
export function profileFrom(snapshot:Record<string,any>, hotelId:string, revision:number): Profile {
  if (!Number.isInteger(revision) || revision < 1) throw new HotelError('DNA_REVISION_REQUIRED','A identidade do DNA precisa de revisão positiva confirmada.')
  const m1 = identity(snapshot.modulo_1), m2 = snapshot.modulo_2 ?? {}, m3 = snapshot.modulo_3 ?? {}
  const editorial=editorialPreferences(m2), diagnosis=minimumDiagnosis(m2.diagnostico), accommodation=minimumAccommodation(m2), timezone=hotelTimezone(snapshot.modulo_1?.timezone)
  const minutes = Number(m3.minutos_disponiveis), cadence = Number(m3.posts_por_semana)
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 120 || !Number.isInteger(cadence) || cadence < 1 || cadence > 7) throw new HotelError('CAPACITY_REQUIRED','Confirme de 5 a 120 minutos e de uma a sete publicações possíveis por semana.')
  const facts:Record<string,Fact> = {}
  const factual:Record<string,string> = { brand_name:m1.nome,location_hint:`${m1.cidade}/${m1.estado}`,highlight_name:m2.lugar_bonito,highlight_detail:m2.detalhe_confirmado,service_rule:m2.condicoes_confirmadas }
  for (const [key,value] of Object.entries(factual)) if (value?.trim()) facts[key] = {value:value.trim(),confirmed:m2.fatos_confirmados === true,source:'Informado e confirmado pelo proprietário no onboarding',valid_until:m2.fatos_validos_ate ?? ''}
  for (const [key,value] of Object.entries({cta:'Consulte datas e condições com a hospedagem. Solicitar informações não confirma reserva.',tone_open:TONE_OPENINGS[editorial.tone],visitor_tip:'Confirme condições diretamente com a hospedagem antes de planejar.'})) facts[key] = {value,confirmed:true,source:key==='tone_open'?`Tom ${EDITORIAL_TONES[editorial.tone]} confirmado pelo proprietário; abertura editorial, não promessa factual`:'Instrução editorial do produto, não promessa factual',valid_until:'9999-12-31'}
  return {timezone,accommodation,hotel_id:hotelId,dna_version:`hotel-recomposed:${hotelId}:r${revision}`,tone:editorial.tone,editorial_confirmed:true,audience:m1.publico_primario,preferred:['planejamento','identidade','conversa'],avoid:editorial.avoid,minutes,filming:m3.video_disponivel === true,people:diagnosis.pessoas_autorizadas,photography:diagnosis.fotos_autorizadas,diagnosis,posts_per_week:cadence,facts}
}
/** Server-owned text scope overlay only. No couples substitution or media/publication approval. */
export function editorialOverlay(templates:Template[]): Template[] {
  return templates.filter(t => t.id !== 'HO-TPL-015').map(t => ({...t,audience_tags:[...new Set([...t.audience_tags,'negocios','aventureiros'])],editorial_reviewed:true}))
}
export function eligible(templates:Template[], profile:Profile, date:string, used:Set<string> = new Set()): Template[] {
  if (!hasEditorialProfile(profile)) throw new HotelError('EDITORIAL_CONFIRMATION_REQUIRED','Confirme o tom e os vetos no Meu negócio. Nenhuma escolha padrão foi presumida.')
  if (!validDate(date) || !Number.isFinite(profile.minutes) || profile.minutes < 0) throw new HotelError('INVALID_SELECTION','Confirme data e capacidade.')
  const ids = new Set<string>()
  for (const t of templates) { if (!t.origin || ids.has(t.id) || !Number.isInteger(t.version) || t.version < 1) throw new HotelError('INVALID_LIBRARY','Origem, versão e identidade únicas são obrigatórias.'); ids.add(t.id) }
  return templates.filter(t => {
    if (used.has(t.id) || t.origin !== 'ORIGINAL_CREATED_FOR_N360_DOCS_20261022' || t.rights_status !== 'ORIGINAL_TEXT_SEED_REVIEW_REQUIRED' || t.editorial_reviewed !== true || !t.audience_tags.includes(profile.audience)) return false
    if (profile.avoid.includes(t.pillar) || t.production_minutes > profile.minutes || (t.requires_filming && !profile.filming) || (t.requires_people && !profile.people)) return false
    const values=Object.values(t.content)
    if (!values.length || values.some(v => typeof v !== 'string' && (!Array.isArray(v) || !v.length || v.some(x => typeof x !== 'string')))) return false
    const text=values.flat().join('\n'),variables=[...text.matchAll(/\{\{([a-z_]+)\}\}/g)].map(m=>m[1])
    if (variables.some(v=>!t.required_variables.includes(v)) || t.required_variables.some(v=>!variables.includes(v))) return false
    if (!t.required_variables.every(key => {const f=profile.facts[key];return f?.confirmed === true && !!f.source?.trim() && !!f.value?.trim() && validDate(f.valid_until) && f.valid_until >= date})) return false
    return !prohibited.test(text.replace(/\{\{([a-z_]+)\}\}/g,(_,key)=>profile.facts[key].value))
  }).sort((a,b)=>Number(profile.preferred.includes(b.pillar))-Number(profile.preferred.includes(a.pillar)) || a.id.localeCompare(b.id))
}
export function week(templates:Template[],profile:Profile,anchor:string): Draft[] {
  if (!validDate(anchor) || !Number.isInteger(profile.posts_per_week) || profile.posts_per_week < 1 || profile.posts_per_week > 7) throw new HotelError('INVALID_PLAN','Confirme a data e a cadência entre uma e sete.')
  const dates=Array.from({length:7},(_,i)=>{const day=new Date(anchor+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+i);return day.toISOString().slice(0,10)})
  const matrix=dates.map(date=>eligible(templates,profile,date)),order=dates.map((_,i)=>i).sort((a,b)=>matrix[a].length-matrix[b].length || a-b),chosen:Array<Template|undefined>=new Array(7)
  function match(depth:number,used:Set<string>):boolean { if(depth===7)return true;const day=order[depth];for(const t of matrix[day]){if(used.has(t.id))continue;used.add(t.id);chosen[day]=t;if(match(depth+1,used))return true;used.delete(t.id);chosen[day]=undefined}return false }
  if (!match(0,new Set())) throw new HotelError('NO_ELIGIBLE_WEEK','Não há sete modelos distintos válidos nesta janela. Confirme fatos, capacidade ou recursos; nenhum plano parcial foi salvo.')
  return chosen.map((t,i)=>{const template=t!;return{id:`${profile.hotel_id}:${anchor}:${i}`,revision:1,date:dates[i],state:'DRAFT',intention:i<profile.posts_per_week?'sugerir_publicacao':'preparar',template_id:template.id,template_version:template.version,dna_version:profile.dna_version,title:template.title,format:template.format,minutes:template.production_minutes,reason:'Combina com fatos, público e recursos confirmados. Revise antes de usar.',text:Object.values(template.content).flat().join('\n\n').replace(/\{\{([a-z_]+)\}\}/g,(_,key)=>profile.facts[key].value),facts_used:Object.fromEntries(template.required_variables.map(key=>[key,structuredClone(profile.facts[key])])),editorial_review:null}})
}
function currentFacts(draft:Draft,profile:Profile,templates:Template[],today:string) {
  const template=eligible(templates,profile,draft.date>today?draft.date:today).find(t=>t.id===draft.template_id && t.version===draft.template_version)
  if (!template) throw new HotelError('DRAFT_INELIGIBLE','Fatos, direitos ou recursos precisam de reconfirmação. O texto foi preservado.')
  return Object.fromEntries(template.required_variables.map(key=>[key,structuredClone(profile.facts[key])])) as Record<string,Fact>
}
export function currentDraft(draft:Draft,profile:Profile,templates:Template[],today:string) {
  const facts=currentFacts(draft,profile,templates,today),old=draft.facts_used
  if (draft.dna_version!==profile.dna_version || !old || Object.keys(old).length!==Object.keys(facts).length || !Object.keys(facts).every(key=>old[key]?.value===facts[key].value && old[key]?.source===facts[key].source && old[key]?.confirmed===true && old[key]?.valid_until===facts[key].valid_until)) throw new HotelError('STALE_FACT_SNAPSHOT','O perfil ou os fatos mudaram. Compare e reconfirme esta revisão, sem substituir seu texto automaticamente.')
}
export function exportable(draft:Draft,profile:Profile,templates:Template[],today:string,actorId:string) {
  currentDraft(draft,profile,templates,today)
  if (/\{\{|\}\}/.test(draft.title+'\n'+draft.text)) throw new HotelError('UNRESOLVED_PLACEHOLDER','Substitua os campos pendentes antes de revisar ou exportar.')
  if (prohibited.test(draft.title+'\n'+draft.text)) throw new HotelError('UNSUPPORTED_CLAIM','Remova a alegação não sustentada antes de revisar ou exportar.')
  const r=draft.editorial_review
  if (!r || r.revision!==draft.revision || r.exact_text!==draft.text || (r.exact_title!==undefined && r.exact_title!==draft.title) || r.dna_version!==draft.dna_version || r.actor_id!==actorId || !actorId || !validDate(r.reviewed_on)) throw new HotelError('EXACT_REVIEW_REQUIRED','Confirme explicitamente os fatos e a revisão editorial deste texto exato. Editar invalida a confirmação anterior.')
}
export function revise(draft:Draft,profile:Profile|null,templates:Template[],text:string,actorId:string,today:string,confirm:boolean,title:string=draft.title): Draft {
  if (typeof title!=='string' || !title.trim() || Array.from(title).length>240) throw new HotelError('INVALID_TITLE','Título obrigatório, com até 240 caracteres.')
  if (typeof text!=='string' || !text.trim() || Array.from(text).length>20000) throw new HotelError('INVALID_TEXT','Texto obrigatório, com até 20000 caracteres.')
  const next={...structuredClone(draft),revision:draft.revision+1,title,text,editorial_review:null} as Draft
  if (!confirm)return next
  if (!profile) throw new HotelError('PROFILE_REQUIRED','Reconfirme o perfil antes de aprovar. O texto não aprovado pode ser salvo.')
  if (!actorId || !validDate(today)) throw new HotelError('INVALID_REVIEW','Confirmação inválida.')
  const facts=currentFacts(draft,profile,templates,today),fold=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('pt-BR').replace(/\s+/g,' ').trim()
  // Mask exact current fact spans before looking for independent obsolete spans.
  // Case/Unicode/spacing-only changes are equivalent; no automatic text rewriting.
  for(const [key,old] of Object.entries(draft.facts_used??{})) {
    const current=facts[key];if(!current)continue
    const previous=fold(old.value),now=fold(current.value)
    if(previous===now||previous.length<=2)continue
    const remaining=fold(title+'\n'+text).split(now).join(' [fato atual] ')
    if(remaining.includes(previous))throw new HotelError('STALE_EMBEDDED_FACT','O texto ainda contém um fato antigo alterado no perfil. Edite esse trecho; seu texto local foi preservado.')
  }
  if(/\{\{|\}\}/.test(title+'\n'+text))throw new HotelError('UNRESOLVED_PLACEHOLDER','Substitua os campos pendentes antes de confirmar.')
  if(prohibited.test(title+'\n'+text))throw new HotelError('UNSUPPORTED_CLAIM','Remova a alegação não sustentada antes de confirmar.')
  next.dna_version=profile.dna_version;next.facts_used=facts;next.editorial_review={revision:next.revision,exact_text:text,exact_title:title,dna_version:profile.dna_version,actor_id:actorId,reviewed_on:today}
  return next
}
export function exportText(draft:Draft) {return `RASCUNHO • ${draft.id} • revisão ${draft.revision}\nDNA ${draft.dna_version} • modelo ${draft.template_id} v${draft.template_version}\n${draft.date} • ${draft.title}\n\n${draft.text}\n\nExportar não publica nem confirma reserva.`}
export async function copyAndRecord(text:string,copy:(text:string)=>Promise<void>,record:()=>Promise<void>){await copy(text);try{await record();return{copied:true,history:true}}catch{return{copied:true,history:false}}}
export type Conflict={localText:string;expectedRevision:number;remote?:{id:string;revision:number;text:string}}
export function compare(local:Conflict,remote:{id:string;revision:number;text:string}):Conflict{return{...local,remote:structuredClone(remote)}}
export function resolve(conflict:Conflict,decision:'reapply'|'remote'):Conflict{if(!conflict.remote)throw new HotelError('NO_REMOTE','Carregue a revisão remota para comparar.');return{localText:decision==='remote'?conflict.remote.text:conflict.localText,expectedRevision:conflict.remote.revision,remote:structuredClone(conflict.remote)}}
export function calendarFormat(format:string){const map:Record<string,{tipo:string;formato:string}>={caption:{tipo:'feed',formato:'foto'},carousel:{tipo:'feed',formato:'carrossel'},stories:{tipo:'story',formato:'story'},reel_script:{tipo:'reel',formato:'reel'}};if(!map[format])throw new HotelError('INVALID_FORMAT','Formato não suportado.');return map[format]}

/** Preview only: same date, strictly lower effort, trusted eligible template; never replaces human work. */
export function lowerEffortAlternative(draft:Draft,profile:Profile,templates:Template[],today:string):Draft|null {
  const date=draft.date>today?draft.date:today
  const t=eligible(templates,profile,date).filter(t=>t.id!==draft.template_id&&t.production_minutes<draft.minutes).sort((a,b)=>a.production_minutes-b.production_minutes||a.id.localeCompare(b.id))[0]
  if(!t)return null
  return {...structuredClone(draft),id:draft.id+':alternative:'+t.id,date,revision:1,title:t.title,template_id:t.id,template_version:t.version,dna_version:profile.dna_version,format:t.format,minutes:t.production_minutes,reason:'Alternativa elegível com menor esforço, sem substituir o rascunho salvo.',text:Object.values(t.content).flat().join('\n\n').replace(/\{\{([a-z_]+)\}\}/g,(_,key)=>profile.facts[key].value),facts_used:Object.fromEntries(t.required_variables.map(key=>[key,structuredClone(profile.facts[key])])),editorial_review:null}
}
/** Clipboard success follows the actual promise; caller supplies user-facing feedback. */
export async function copyWithFeedback(text:string,copy:(value:string)=>Promise<void>,success:()=>void,failure:(error:unknown)=>void){try{await copy(text);success();return true}catch(error){failure(error);return false}}
