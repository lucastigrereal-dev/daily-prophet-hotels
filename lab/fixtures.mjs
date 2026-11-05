import fs from 'node:fs'
import * as d from '../lib/hotel/v2/domain.ts'
export const seed=JSON.parse(fs.readFileSync(new URL('../lib/hotel/v2/seed-original.json',import.meta.url),'utf8'))
export const catalog=d.editorialOverlay(seed.templates)
export const anchor='2026-10-23'
export function fixture(name='A',revision=4){
 const id=name==='A'?'11111111-1111-4111-8111-111111111111':'22222222-2222-4222-8222-222222222222'
 const snapshot={modulo_1:{nome:`Pousada LAB ${name} FICTÍCIA`,cidade:'Natal',estado:'RN',regiao:'Nordeste',timezone:'America/Fortaleza',tipo:'hotel_urbano',tipo_db:'urbano',categoria:'3',quartos:10,ticket_medio:0,publico_principal:'casal'},modulo_2:{diagnostico:{motivo_viagem:'Lazer FICTICIO',promessa:'Acolhimento FICTICIO',canal_consulta:'Recepção FICTICIA',pendencias:'Nenhum no LAB',fotos_autorizadas:false,pessoas_autorizadas:false},tom:'acolhedor',temas_vetados:[],vetos_confirmados:true,lugar_bonito:'Acomodação Jardim FICTÍCIA',detalhe_confirmado:'mesa de apoio FICTÍCIA',condicoes_confirmadas:'Consulte condições e categoria: exemplo FICTÍCIO',fatos_validos_ate:'2027-12-31',fatos_confirmados:true},modulo_3:{frequencia_posts:'semanal',responsavel_ig:'dono',posts_por_semana:3,minutos_disponiveis:10,video_disponivel:false},modulo_4:{objetivo_principal:'planejamento',prazo:'semana'}}
 return{actor:{id:`LAB-OWNER-${name}`},id,snapshot,profile:d.profileFrom(snapshot,id,revision)}
}
