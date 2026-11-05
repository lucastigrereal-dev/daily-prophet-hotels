import { createClient } from '@/lib/supabase/server'
import { HotelError, checked, ownedHotel, writable } from './v2/domain'
export async function ownerContext(requestedId?:string,mode:'read'|'write'|'onboarding'='read') {
  const client=await createClient(),session=await client.auth.getUser()
  if(session.error&&(['AuthSessionMissingError','AuthInvalidJwtError'].includes(session.error.name)||[401,403].includes(session.error.status??0)))throw new HotelError('SESSION_EXPIRED','SESSION_EXPIRED: Entre novamente para continuar com seu estabelecimento. Seus campos locais foram preservados.')
  checked({error:session.error},'a sessão')
  const actor=session.data.user
  if(!actor)throw new HotelError('SESSION_EXPIRED','SESSION_EXPIRED: Entre novamente para continuar com seu estabelecimento. Seus campos locais foram preservados.')
  const rows=checked(await client.from('hotels').select('*').eq('owner_id',actor.id).limit(2),'o estabelecimento')??[]
  const hotel=ownedHotel(actor,rows,requestedId)
  if(mode!=='read')writable(hotel,mode)
  return{client,actor,hotel}
}
