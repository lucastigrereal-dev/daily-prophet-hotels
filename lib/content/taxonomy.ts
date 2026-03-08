/**
 * TAXONOMIA OFICIAL — Daily Prophet Hotels
 *
 * Dicionario de valores padronizados para todas as tabelas de conteudo.
 * Todas as ingestoes de dados devem mapear para esses valores.
 * A UI usa esses arrays para popular selects/filtros.
 */

// ─────────────────────────────────────────────
// TIPO DE HOTEL
// ─────────────────────────────────────────────
export const TIPOS_HOTEL = [
  'resort', 'pousada', 'boutique', 'fazenda', 'urbano',
  'hostel', 'eco_resort', 'glamping', 'apart_hotel',
  'resort_praia', 'pousada_romantica', 'hotel_familia',
  'eco_lodge', 'chales', 'resort_spa', 'pet_friendly', 'hotel_historico',
] as const
export type TipoHotel = typeof TIPOS_HOTEL[number]

export const TIPO_HOTEL_LABEL: Record<string, string> = {
  resort: 'Resort', pousada: 'Pousada', boutique: 'Boutique',
  fazenda: 'Hotel Fazenda', urbano: 'Hotel Urbano', hostel: 'Hostel',
  eco_resort: 'Eco Resort', glamping: 'Glamping', apart_hotel: 'Apart Hotel',
  resort_praia: 'Resort Praia', pousada_romantica: 'Pousada Romantica',
  hotel_familia: 'Hotel Familia', eco_lodge: 'Eco Lodge', chales: 'Chales/Cabanas',
  resort_spa: 'Resort Spa', pet_friendly: 'Pet Friendly', hotel_historico: 'Hotel Historico',
}

// ─────────────────────────────────────────────
// PUBLICO-ALVO
// ─────────────────────────────────────────────
export const PUBLICOS = [
  'misto', 'casal', 'familia', 'corporativo', 'solo',
  'aventureiro', 'luxo', 'idosos', 'pets', 'mochileiro',
] as const
export type Publico = typeof PUBLICOS[number]

export const PUBLICO_LABEL: Record<string, string> = {
  misto: 'Misto', casal: 'Casais', familia: 'Familias',
  corporativo: 'Corporativo', solo: 'Solo / Individuais',
  aventureiro: 'Aventureiros', luxo: 'Luxo', idosos: 'Terceira Idade',
  pets: 'Pet Lovers', mochileiro: 'Mochileiros',
}

// ─────────────────────────────────────────────
// FORMATO DE CONTEUDO
// ─────────────────────────────────────────────
export const FORMATOS = [
  'foto', 'carrossel', 'reel', 'story', 'video',
] as const
export type Formato = typeof FORMATOS[number]

export const FORMATO_LABEL: Record<string, string> = {
  foto: 'Foto', carrossel: 'Carrossel', reel: 'Reel',
  story: 'Story', video: 'Video',
}

// ─────────────────────────────────────────────
// TEMA (macro)
// ─────────────────────────────────────────────
export const TEMAS = [
  'all_inclusive', 'aventura', 'bastidores', 'cafe_da_manha',
  'casamento', 'checkin', 'corporativo', 'datas_comemorativas',
  'destino', 'experiencias', 'familia', 'fazenda',
  'gastronomia', 'noite', 'pet_friendly', 'piscina',
  'por_do_sol', 'praia', 'promocoes', 'quarto',
  'romantico', 'serra', 'spa', 'sustentabilidade',
  'ugc', 'workation', 'natureza', 'lazer',
  'reputacao', 'depoimento', 'equipe',
] as const
export type Tema = typeof TEMAS[number]

export const TEMA_LABEL: Record<string, string> = {
  all_inclusive: 'All Inclusive', aventura: 'Aventura', bastidores: 'Bastidores',
  cafe_da_manha: 'Cafe da Manha', casamento: 'Casamento', checkin: 'Check-in',
  corporativo: 'Corporativo', datas_comemorativas: 'Datas Comemorativas',
  destino: 'Destino', experiencias: 'Experiencias', familia: 'Familia',
  fazenda: 'Fazenda', gastronomia: 'Gastronomia', noite: 'Noite',
  pet_friendly: 'Pet Friendly', piscina: 'Piscina', por_do_sol: 'Por do Sol',
  praia: 'Praia', promocoes: 'Promocoes', quarto: 'Quarto',
  romantico: 'Romantico', serra: 'Serra', spa: 'Spa',
  sustentabilidade: 'Sustentabilidade', ugc: 'UGC / Conteudo de Hospede',
  workation: 'Workation', natureza: 'Natureza', lazer: 'Lazer',
  reputacao: 'Reputacao', depoimento: 'Depoimento', equipe: 'Equipe / Bastidores',
}

// ─────────────────────────────────────────────
// SUBTEMA (detalhamento dentro do tema)
// ─────────────────────────────────────────────
export const SUBTEMAS: Record<string, string[]> = {
  gastronomia: ['cafe_da_manha', 'jantar_romantico', 'drink_piscina', 'menu_infantil', 'petiscos_bar', 'brunch'],
  quarto: ['suite_master', 'decoracao', 'vista', 'amenities', 'cama', 'banheira'],
  piscina: ['adulto', 'infantil', 'aquecida', 'bar_molhado', 'borda_infinita', 'tobogua'],
  spa: ['massagem', 'sauna', 'day_use', 'ritual', 'facial', 'termal'],
  natureza: ['trilha', 'cachoeira', 'mirante', 'jardim', 'lago', 'praia_privativa'],
  familia: ['kids_club', 'playground', 'recreacao', 'piscina_infantil', 'berco', 'brinquedoteca'],
  romantico: ['jantar_velas', 'champagne', 'surpresa', 'lua_mel', 'aniversario', 'pedido_casamento'],
  aventura: ['trilha', 'rapel', 'tirolesa', 'rafting', 'stand_up', 'cavalgada'],
  corporativo: ['sala_reuniao', 'coffee_break', 'team_building', 'coworking', 'evento', 'convencao'],
  checkin: ['recepção', 'welcome_drink', 'tour_hotel', 'primeiro_impacto', 'surpresa_quarto'],
  bastidores: ['cozinha', 'limpeza', 'manutencao', 'equipe', 'preparo', 'antes_depois'],
  ugc: ['review', 'repost', 'depoimento_video', 'foto_hospede', 'stories_marcados'],
}

// ─────────────────────────────────────────────
// OBJETIVO (business goal do conteudo)
// ─────────────────────────────────────────────
export const OBJETIVOS = [
  'engajamento', 'conversao', 'awareness', 'reserva_direta',
  'prova_social', 'educacional', 'fidelizacao', 'branding',
  'trafego_site', 'crescimento_seguidores', 'salvamentos',
] as const
export type Objetivo = typeof OBJETIVOS[number]

export const OBJETIVO_LABEL: Record<string, string> = {
  engajamento: 'Engajamento', conversao: 'Conversao / Reserva',
  awareness: 'Awareness / Alcance', reserva_direta: 'Reserva Direta',
  prova_social: 'Prova Social', educacional: 'Educacional',
  fidelizacao: 'Fidelizacao', branding: 'Branding',
  trafego_site: 'Trafego para Site', crescimento_seguidores: 'Crescimento de Seguidores',
  salvamentos: 'Salvamentos / Saves',
}

// ─────────────────────────────────────────────
// INTENCAO (emotional trigger do hook)
// ─────────────────────────────────────────────
export const INTENCOES = [
  'desejo', 'curiosidade', 'identificacao', 'urgencia',
  'autoridade', 'prova_social', 'medo_perder', 'nostalgia',
  'aspiracao', 'humor',
] as const
export type Intencao = typeof INTENCOES[number]

// ─────────────────────────────────────────────
// SAZONALIDADE
// ─────────────────────────────────────────────
export const SAZONALIDADES = [
  'o_ano_todo', 'alta_temporada', 'baixa_temporada',
  'verao', 'inverno', 'primavera', 'outono',
  'ferias_escolares', 'feriado', 'carnaval',
  'pascoa', 'dia_maes', 'dia_namorados', 'dia_pais',
  'dia_criancas', 'black_friday', 'natal', 'reveillon',
] as const
export type Sazonalidade = typeof SAZONALIDADES[number]

export const SAZONALIDADE_LABEL: Record<string, string> = {
  o_ano_todo: 'O ano todo', alta_temporada: 'Alta Temporada',
  baixa_temporada: 'Baixa Temporada', verao: 'Verao', inverno: 'Inverno',
  primavera: 'Primavera', outono: 'Outono', ferias_escolares: 'Ferias Escolares',
  feriado: 'Feriado', carnaval: 'Carnaval', pascoa: 'Pascoa',
  dia_maes: 'Dia das Maes', dia_namorados: 'Dia dos Namorados',
  dia_pais: 'Dia dos Pais', dia_criancas: 'Dia das Criancas',
  black_friday: 'Black Friday', natal: 'Natal', reveillon: 'Reveillon',
}

// ─────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────
export const STATUS_CONTEUDO = ['ativo', 'rascunho', 'arquivado', 'revisao'] as const
export type StatusConteudo = typeof STATUS_CONTEUDO[number]

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export function labelFor(map: Record<string, string>, key: string | null | undefined): string {
  if (!key) return '—'
  return map[key] || key.replace(/_/g, ' ')
}
