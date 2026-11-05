'use server'
import { ownerContext } from '@/lib/hotel/server-access'
import { checked,hotelTimezone,identity,persistOnboarding,profileFrom,editorialPreferences } from '@/lib/hotel/v2/domain'
export async function resumeOnboarding() {
  const{client,actor,hotel}=await ownerContext()
  if(!hotel)return{actor_id:actor.id,hotel_id:null,answers:{},revision:0,complete:false,last_module:0}
  const row=checked<any>(await client.from('onboarding_respostas').select('respostas,completado,ultima_secao_completada').eq('hotel_id',hotel.id).maybeSingle(),'a retomada do diagnóstico')
  return{actor_id:actor.id,hotel_id:hotel.id,answers:row?.respostas??{},revision:row?.respostas?._v2?.revision??0,complete:row?.completado===true,last_module:Number.isInteger(row?.ultima_secao_completada)?row.ultima_secao_completada:0}
}
export async function saveOnboarding(input:{hotelId:string;module:number;snapshot:Record<string,any>;revision:number;operationId:string}) {
  const{client,hotel}=await ownerContext(undefined,'onboarding')
  if(hotel&&hotel.id!==input.hotelId)throw new Error('ACCESS_DENIED')
  if(!/^[0-9a-f-]{36}$/i.test(input.hotelId)||!/^[0-9a-f-]{36}$/i.test(input.operationId)||!Number.isInteger(input.module)||input.module<1||input.module>4||!Number.isInteger(input.revision)||input.revision<0)throw new Error('INVALID_REQUEST')
  identity(input.snapshot.modulo_1);hotelTimezone(input.snapshot.modulo_1?.timezone)
  const m1=input.snapshot.modulo_1
  if(!Number.isInteger(Number(m1.quartos))||Number(m1.quartos)<0||![2,3,4,5].includes(Number(m1.categoria))||!Number.isFinite(Number(m1.ticket_medio))||Number(m1.ticket_medio)<0)throw new Error('Confirme quartos, categoria e valor informado; nenhum valor foi inferido.')
  if(input.module>=2)editorialPreferences(input.snapshot.modulo_2)
  if(input.module>=3&&(!input.snapshot.modulo_3?.frequencia_posts||!input.snapshot.modulo_3?.responsavel_ig))throw new Error('Confirme as perguntas obrigatórias de rotina.')
  if(input.module===4){if(!input.snapshot.modulo_4?.objetivo_principal||!input.snapshot.modulo_4?.prazo)throw new Error('Confirme objetivo e prazo.');input.snapshot.editorial_profile=profileFrom(input.snapshot,input.hotelId,input.revision+1)}
  return persistOnboarding(async()=>{
    const result=await client.rpc('hotel_v2_save_onboarding',{p_hotel_id:input.hotelId,p_module:input.module,p_snapshot:input.snapshot,p_expected_revision:input.revision,p_operation_id:input.operationId})
    if(result.error?.code==='PGRST202')throw new Error('ADAPTER_NOT_INSTALLED: contrato transacional candidato ainda não aplicado. Nenhum salvamento foi presumido.')
    if(result.error?.message?.includes('REVISION_CONFLICT'))throw new Error('REVISION_CONFLICT: existe revisão mais recente. Seus campos foram preservados; compare antes de substituir.')
    if(result.error?.message?.includes('IDEMPOTENCY_CONFLICT'))throw new Error('IDEMPOTENCY_CONFLICT: a tentativa anterior usou outros dados. Compare antes de reenviar.')
    return{data:result.data,error:result.error}
  },{hotelId:input.hotelId,previousRevision:input.revision,module:input.module,operationId:input.operationId})
}
