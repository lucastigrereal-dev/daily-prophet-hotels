// Content DNA — filtros e preferencias de conteudo por hotel
import { createClient } from '@/lib/supabase/client'
import { checked,hasEditorialProfile } from './v2/domain'

export interface ContentDNA {
  tom: string
  voz: string
  publico_primario: string
  publico_secundario: string | null
  posts_por_semana: number
  stories_por_dia: number
  melhor_horario_post: string
  temas_preferidos: string[]
  temas_evitar: string[]
  formatos_preferidos: string[]
  palavras_evitar: string[]
  concorrentes_nao_mencionar: string[]
  regras_extras?: Record<string, any>
}

const DEFAULT_DNA: ContentDNA = {
  tom: 'acolhedor',
  voz: 'primeira_pessoa',
  publico_primario: 'casais',
  publico_secundario: null,
  posts_por_semana: 3,
  stories_por_dia: 2,
  melhor_horario_post: '18:00',
  temas_preferidos: ['experiencia', 'cafe_manha', 'piscina', 'quarto'],
  temas_evitar: [],
  formatos_preferidos: ['carrossel', 'reel', 'foto'],
  palavras_evitar: [],
  concorrentes_nao_mencionar: [],
}

export async function getContentDNA(hotelId: string): Promise<ContentDNA | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('hotel_content_preferences')
    .select('*')
    .eq('hotel_id', hotelId)
    .maybeSingle()

  checked({error}, 'a leitura do DNA')
  if (!data) return null
  if (data.regras_extras?.profile && !hasEditorialProfile(data.regras_extras.profile)) return null
  const editorial=hasEditorialProfile(data.regras_extras?.profile)?data.regras_extras.profile:null

  return {
    regras_extras: data.regras_extras,
    tom: editorial?.tone ?? data.tom ?? DEFAULT_DNA.tom,
    voz: data.voz ?? DEFAULT_DNA.voz,
    publico_primario: data.publico_primario ?? DEFAULT_DNA.publico_primario,
    publico_secundario: data.publico_secundario,
    posts_por_semana: data.posts_por_semana ?? DEFAULT_DNA.posts_por_semana,
    stories_por_dia: data.stories_por_dia ?? DEFAULT_DNA.stories_por_dia,
    melhor_horario_post: data.melhor_horario_post ?? DEFAULT_DNA.melhor_horario_post,
    temas_preferidos: data.temas_preferidos ?? DEFAULT_DNA.temas_preferidos,
    temas_evitar: editorial?.avoid ?? data.temas_evitar ?? DEFAULT_DNA.temas_evitar,
    formatos_preferidos: data.formatos_preferidos ?? DEFAULT_DNA.formatos_preferidos,
    palavras_evitar: data.palavras_evitar ?? DEFAULT_DNA.palavras_evitar,
    concorrentes_nao_mencionar: data.concorrentes_nao_mencionar ?? DEFAULT_DNA.concorrentes_nao_mencionar,
  }
}

export async function saveContentDNA(hotelId: string, dna: Partial<ContentDNA>): Promise<void> {
  const supabase = createClient()
  const result = await supabase
    .from('hotel_content_preferences')
    .upsert({
      hotel_id: hotelId,
      ...dna,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hotel_id' })
  checked(result, 'o salvamento do DNA')
}

// Filtra hooks excluindo temas que o hotel quer evitar
export function filterByDNA<T extends { tema?: string | null; formato?: string | null }>(
  items: T[],
  dna: ContentDNA
): T[] {
  return items.filter(item => {
    if (item.tema && dna.temas_evitar.includes(item.tema)) return false
    return true
  })
}

// Ordena priorizando temas preferidos do hotel
export function sortByDNA<T extends { tema?: string | null; formato?: string | null }>(
  items: T[],
  dna: ContentDNA
): T[] {
  return [...items].sort((a, b) => {
    const aScore = (a.tema && dna.temas_preferidos.includes(a.tema) ? 2 : 0)
      + (a.formato && dna.formatos_preferidos.includes(a.formato) ? 1 : 0)
    const bScore = (b.tema && dna.temas_preferidos.includes(b.tema) ? 2 : 0)
      + (b.formato && dna.formatos_preferidos.includes(b.formato) ? 1 : 0)
    return bScore - aScore
  })
}
