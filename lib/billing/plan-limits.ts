// Limites por plano — Daily Prophet Hotels
// Aplicar em queries que precisam de paywall

export type Plano = 'free' | 'pro' | 'agency'

export interface PlanLimits {
  max_hoteis: number
  calendario_dias: number
  missoes_simultaneas: number
  benchmarks_por_tema: number | null // null = ilimitado
  hooks: number | null
  legendas: number | null
  campanhas_mes: number
  playbooks: number | null
  exportacao: boolean
  relatorios: boolean
}

export const PLAN_LIMITS: Record<Plano, PlanLimits> = {
  free: {
    max_hoteis: 1,
    calendario_dias: 14,
    missoes_simultaneas: 1,
    benchmarks_por_tema: 10,
    hooks: 50,
    legendas: 100,
    campanhas_mes: 1,
    playbooks: 2,
    exportacao: false,
    relatorios: false,
  },
  pro: {
    max_hoteis: 1,
    calendario_dias: 30,
    missoes_simultaneas: 3,
    benchmarks_por_tema: null,
    hooks: null,
    legendas: null,
    campanhas_mes: 999,
    playbooks: null,
    exportacao: true,
    relatorios: true,
  },
  agency: {
    max_hoteis: 999,
    calendario_dias: 30,
    missoes_simultaneas: 999,
    benchmarks_por_tema: null,
    hooks: null,
    legendas: null,
    campanhas_mes: 999,
    playbooks: null,
    exportacao: true,
    relatorios: true,
  },
}

// Retorna os limites do plano atual do usuario
export function getLimits(plano: Plano = 'free'): PlanLimits {
  return PLAN_LIMITS[plano] ?? PLAN_LIMITS.free
}

// Verifica se o usuario pode acessar um recurso
export function canAccess(plano: Plano, recurso: keyof PlanLimits): boolean {
  const limits = getLimits(plano)
  const val = limits[recurso]
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val > 0
  return val !== null // null = ilimitado = true
}

// Aplica limite de rows a uma query Supabase
export function applyLimit<T extends { limit: (n: number) => T }>(
  query: T,
  plano: Plano,
  campo: 'benchmarks_por_tema' | 'hooks' | 'legendas'
): T {
  const limits = getLimits(plano)
  const max = limits[campo]
  if (max === null) return query // ilimitado
  return query.limit(max)
}

// Mensagem de upgrade
export function upgradeMessage(recurso: string): string {
  return `${recurso} disponivel no plano Pro. Faca upgrade para desbloquear.`
}

// Hook React para verificar plano (use em componentes)
// Exemplo de uso:
// const { plano, canAccess } = usePlan()
// if (!canAccess('exportacao')) return <UpgradePrompt />
