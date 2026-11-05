'use server'
import { ownerContext } from './server-access'
import { checked,localDay,week,validDate,exportable,exportText,revise,lowerEffortAlternative,hasEditorialProfile,type Profile,type Draft } from './v2/domain'
import { draftCatalog } from './v2/catalog'
function validProfile(p:any,hotelId:string):p is Profile{return p?.hotel_id===hotelId&&hasEditorialProfile(p)&&typeof p.dna_version==='string'&&!!p.dna_version&&p.facts&&typeof p.facts==='object'&&Array.isArray(p.preferred)&&Array.isArray(p.avoid)&&typeof p.audience==='string'&&Number.isFinite(p.minutes)&&Number.isInteger(p.posts_per_week)}
async function readProfile(client:any,hotelId:string):Promise<Profile>{const row=checked<any>(await client.from('hotel_content_preferences').select('regras_extras').eq('hotel_id',hotelId).maybeSingle(),'os fatos atuais');const p=row?.regras_extras?.profile;if(!validProfile(p,hotelId))throw new Error('Confirme ou reconfirme o perfil factual V2. Nenhum perfil padrão foi usado.');return p}
async function readDraft(client:any,hotelId:string,draftId:string):Promise<Draft>{const rows=checked<any[]>(await client.from('calendarios_gerados').select('v2').eq('hotel_id',hotelId).eq('v2->draft->>id',draftId).limit(2),'o rascunho')??[];if(rows.length!==1||!rows[0].v2?.draft)throw new Error('Rascunho não encontrado ou não autorizado.');return rows[0].v2.draft}
export async function getWorkspace(anchor:string,resolveCurrent=false){
  if(anchor&&!validDate(anchor))throw new Error('Data inválida.')
  const{client,actor,hotel}=await ownerContext();if(!hotel)throw new Error('Confirme primeiro o estabelecimento.')
  const response=checked<any>(await client.from('hotel_content_preferences').select('*').eq('hotel_id',hotel.id).maybeSingle(),'o DNA'),candidate=response?.regras_extras?.profile
  if(!anchor){if(!validProfile(candidate,hotel.id))return{hotel:{id:hotel.id,nome:hotel.nome,status:hotel.status,actorId:actor.id},profile:null,anchor:'',day:'',drafts:[]};anchor=localDay(candidate.timezone);resolveCurrent=true}
  const identity={id:hotel.id,nome:hotel.nome,status:hotel.status,actorId:actor.id}
  const end=new Date(anchor+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+6)
  const start=new Date(anchor+'T12:00:00Z');if(resolveCurrent)start.setUTCDate(start.getUTCDate()-6)
  const rows=checked(await client.from('calendarios_gerados').select('id,v2').eq('hotel_id',hotel.id).gte('data_post',start.toISOString().slice(0,10)).lte('data_post',end.toISOString().slice(0,10)),'a janela salva')??[]
  const containing=resolveCurrent?rows.filter(r=>r.v2?.draft?.date===anchor&&validDate(r.v2?.anchor)&&r.v2.anchor<=anchor).map(r=>r.v2.anchor as string).sort().at(-1):undefined
  const resolvedAnchor=containing??anchor
  return{day:anchor,hotel:identity,profile:validProfile(candidate,hotel.id)?candidate:null,anchor:resolvedAnchor,drafts:rows.filter(r=>r.v2?.anchor===resolvedAnchor).map(r=>r.v2.draft as Draft).sort((a,b)=>a.date.localeCompare(b.date))}
}
export async function createWindow(anchor:string,operationId:string){
  const workspace=await getWorkspace(anchor),{client,hotel}=await ownerContext(workspace.hotel.id,'write')
  if(!workspace.profile)throw new Error('Confirme o DNA e os fatos no Meu negócio antes de gerar.')
  if(workspace.drafts.length){if(workspace.drafts.length!==7)throw new Error('INCOMPLETE_WINDOW: preserve a janela existente para reconciliação.');return workspace.drafts}
  const drafts=week(draftCatalog,workspace.profile,anchor)
  const r=await client.rpc('hotel_v2_create_window',{p_hotel_id:hotel!.id,p_anchor:anchor,p_drafts:drafts,p_operation_id:operationId})
  if(r.error?.code==='PGRST202')throw new Error('ADAPTER_NOT_INSTALLED: persistência transacional candidata ainda não aplicada. Nenhum plano foi marcado como salvo.')
  checked(r,'a criação da janela');const confirmed=(await getWorkspace(anchor)).drafts
  if(confirmed.length!==7)throw new Error('O serviço não confirmou a janela completa. Não foi presumido sucesso.')
  return confirmed
}
export async function latestDraft(hotelId:string,draftId:string){const{client}=await ownerContext(hotelId);return readDraft(client,hotelId,draftId)}
export async function saveDraft(hotelId:string,input:Draft,text:string,confirmExact=false,expectedDnaVersion?:string,title?:string){
  const{client,actor}=await ownerContext(hotelId,'write'),saved=await readDraft(client,hotelId,input.id)
  if(saved.revision!==input.revision)throw new Error('REVISION_CONFLICT: compare a revisão remota sem descartar seu texto local.')
  const profile=confirmExact?await readProfile(client,hotelId):null
  if(confirmExact&&expectedDnaVersion!==profile?.dna_version)throw new Error('PROFILE_CHANGED: o perfil mudou desde sua leitura. Compare fatos atualizados; seu texto foi preservado.')
  const prepared=revise(saved,profile,draftCatalog,text,actor.id,profile?localDay(profile.timezone):saved.date,confirmExact,title)
  const r=await client.rpc('hotel_v2_edit_draft',{p_hotel_id:hotelId,p_draft_id:saved.id,p_expected_revision:saved.revision,p_reviewed_draft:prepared})
  if(r.error?.message?.includes('REVISION_CONFLICT'))throw new Error('REVISION_CONFLICT: compare a revisão remota sem descartar seu texto local.')
  const result=checked(r,'a revisão') as Draft|undefined
  if(!result||result.id!==saved.id||result.revision!==prepared.revision||result.text!==text||result.title!==prepared.title)throw new Error('O serviço não confirmou esta revisão. Seu texto local foi preservado.')
  return result
}
export async function getExport(hotelId:string,draftId:string,revision:number){const{client,actor}=await ownerContext(hotelId,'write'),draft=await readDraft(client,hotelId,draftId);if(draft.revision!==revision)throw new Error('A revisão mudou. Compare antes de exportar.');const profile=await readProfile(client,hotelId);exportable(draft,profile,draftCatalog,localDay(profile.timezone),actor.id);return exportText(draft)}
export async function recordExport(hotelId:string,draftId:string,revision:number,operationId:string){
  const{client}=await ownerContext(hotelId,'write');await getExport(hotelId,draftId,revision)
  const r=await client.rpc('hotel_v2_record_export',{p_hotel_id:hotelId,p_draft_id:draftId,p_expected_revision:revision,p_operation_id:operationId})
  checked(r,'o histórico da exportação')
}
export async function listCalendar(first:string,last:string){if(!validDate(first)||!validDate(last))throw new Error('Datas inválidas.');const{client,hotel}=await ownerContext();if(!hotel)throw new Error('Estabelecimento ausente.');return checked(await client.from('calendarios_gerados').select('*').eq('hotel_id',hotel.id).gte('data_post',first).lte('data_post',last).order('data_post'),'o calendário')??[]}
export async function insertCalendar(form:{data_post:string;formato:string;tema:string;hook:string;legenda_completa:string;hashtags:string}){
  const{client,hotel}=await ownerContext(undefined,'write')
  if(!hotel||!validDate(form.data_post)||!['foto','carrossel','story','reel'].includes(form.formato)||!form.legenda_completa.trim())throw new Error('Confirme data, formato e texto do rascunho.')
  checked(await client.rpc('hotel_c10_manual_draft',{p_hotel_id:hotel.id,p_form:form}),'o rascunho do calendário')
}

export async function getAlternative(hotelId:string,draftId:string){const{client}=await ownerContext(hotelId);const draft=await readDraft(client,hotelId,draftId),profile=await readProfile(client,hotelId);return{profile,alternative:lowerEffortAlternative(draft,profile,draftCatalog,localDay(profile.timezone))}}
