// Gamification Engine — Daily Prophet Hotels
// Calcula scores, verifica desbloqueios, avanca nivel

import { createClient } from '@/lib/supabase/client'

export type Nivel = 'travado' | 'organizado' | 'ativo' | 'estrategico' | 'dominando'

export interface GamState {
  nivel: Nivel
  score_conteudo: number
  score_execucao: number
  score_sazonalidade: number
  score_total: number
  missoes_concluidas: number
  dias_consecutivos: number
  desbloqueios: string[]
}

export interface GamInput {
  onboarding_completo: boolean
  tem_instagram: boolean
  prints_enviados: boolean
  missoes_concluidas: number
  tarefas_semana_concluidas: number
  calendario_preenchido_dias: number
  // conteudo
  total_hooks_disponivel: number
  total_legendas_disponivel: number
}

// Calcula score de conteudo (0-100) baseado no banco
export function calcScoreConteudo(totalLegendas: number, totalHooks: number): number {
  const legScore = Math.min(50, Math.round((totalLegendas / 2500) * 50))
  const hookScore = Math.min(50, Math.round((totalHooks / 1000) * 50))
  return legScore + hookScore
}

// Calcula score de execucao (0-100) baseado em acoes do hotel
export function calcScoreExecucao(input: GamInput): number {
  let score = 0
  if (input.onboarding_completo) score += 25
  if (input.tem_instagram) score += 10
  if (input.prints_enviados) score += 5
  score += Math.min(30, input.missoes_concluidas * 10)
  score += Math.min(20, input.tarefas_semana_concluidas * 5)
  score += Math.min(10, Math.round((input.calendario_preenchido_dias / 30) * 10))
  return Math.min(100, score)
}

// Calcula score de sazonalidade (0-100)
export function calcScoreSazonalidade(campanhasAtivas: number, playbolsAtivos: number): number {
  return Math.min(100, campanhasAtivas * 20 + playbolsAtivos * 10)
}

// Determina nivel baseado no score total
export function calcNivel(scoreTotal: number): Nivel {
  if (scoreTotal >= 80) return 'dominando'
  if (scoreTotal >= 60) return 'estrategico'
  if (scoreTotal >= 40) return 'ativo'
  if (scoreTotal >= 20) return 'organizado'
  return 'travado'
}

// Lista de desbloqueios e seus gatilhos
export const DESBLOQUEIOS = [
  {
    id: 'diagnostico_inicial',
    nome: 'Diagnostico Inicial',
    gatilho: 'onboarding_completo',
    descricao: 'Acesso ao diagnostico completo do hotel',
  },
  {
    id: 'playbook_recomendado',
    nome: 'Playbook Recomendado',
    gatilho: 'dor_definida',
    descricao: '1 playbook personalizado para sua dor principal',
  },
  {
    id: 'starter_kit',
    nome: 'Starter Kit',
    gatilho: 'onboarding_finalizado',
    descricao: 'Calendario de 7 dias + campanha do momento',
  },
  {
    id: 'benchmark_premium_1',
    nome: 'Benchmark Premium',
    gatilho: 'primeira_missao_ativada',
    descricao: '1 benchmark premium desbloqueado',
  },
  {
    id: 'hooks_premium',
    nome: 'Pacote de Hooks Premium',
    gatilho: 'tres_tarefas_semana',
    descricao: '5 hooks premium adicionais',
  },
  {
    id: 'campanha_extra',
    nome: 'Campanha Extra',
    gatilho: 'primeira_missao_concluida',
    descricao: 'Campanha adicional desbloqueada',
  },
  {
    id: 'pacote_stories',
    nome: 'Pacote de Stories',
    gatilho: 'calendario_semana_completo',
    descricao: '20 ideias de stories para a semana',
  },
  {
    id: 'benchmark_comentado',
    nome: 'Benchmark Comentado',
    gatilho: 'cinco_dias_consecutivos',
    descricao: 'Benchmark com analise aprofundada',
  },
]

// Verifica quais desbloqueios devem ser ativados
export function verificarDesbloqueios(
  desbloqueiosAtivos: string[],
  input: GamInput & {
    primeira_missao_ativada: boolean
    primeira_missao_concluida: boolean
    calendario_semana_completo: boolean
  }
): string[] {
  const novos: string[] = []

  const gatilhosAtivos: Record<string, boolean> = {
    onboarding_completo: input.onboarding_completo,
    dor_definida: input.onboarding_completo,
    onboarding_finalizado: input.onboarding_completo && input.tem_instagram,
    primeira_missao_ativada: input.primeira_missao_ativada,
    tres_tarefas_semana: input.tarefas_semana_concluidas >= 3,
    primeira_missao_concluida: input.primeira_missao_concluida,
    calendario_semana_completo: input.calendario_semana_completo,
    cinco_dias_consecutivos: false, // calculado separadamente
  }

  for (const d of DESBLOQUEIOS) {
    if (!desbloqueiosAtivos.includes(d.id) && gatilhosAtivos[d.gatilho]) {
      novos.push(d.id)
    }
  }

  return novos
}

// Salva estado de gamificacao no Supabase
export async function salvarGamificacao(
  hotelId: string,
  state: Partial<GamState>
): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('hotel_gamificacao')
    .upsert({
      hotel_id: hotelId,
      ...state,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hotel_id' })
}

// Busca estado de gamificacao do hotel
export async function buscarGamificacao(hotelId: string): Promise<GamState | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('hotel_gamificacao')
    .select('*')
    .eq('hotel_id', hotelId)
    .single()
  return data || null
}
