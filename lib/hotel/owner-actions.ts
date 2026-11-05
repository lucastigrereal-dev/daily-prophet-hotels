'use server'
import { ownerContext } from './server-access'
export async function getOwnedHotel() {
  const {hotel}=await ownerContext()
  if(!hotel)return null
  const{id,nome,cidade,estado,tipo,status,instagram,onboarding_completo,cor,numero_quartos,classificacao}=hotel
  return{id,nome,cidade,estado,tipo,status,instagram,onboarding_completo,cor,numero_quartos,classificacao}
}
