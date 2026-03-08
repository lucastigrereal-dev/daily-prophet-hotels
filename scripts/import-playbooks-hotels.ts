/**
 * IMPORT: Playbooks de estrategia hoteleira
 * Tabela destino: playbooks
 *
 * Uso:
 *   npx tsx scripts/import-playbooks-hotels.ts <arquivo.csv>
 *
 * CSV esperado:
 *   nome;dor_principal;gatilho_ativacao;objetivo;duracao_dias;dificuldade;checklist;scripts
 *
 * checklist e scripts: JSON stringificado ou texto separado por |
 * Campo obrigatorio: nome
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function parseCSV(content: string) {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(sep)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim().replace(/^"|"$/g, '') })
    return row
  })
}

function parseJSON(val: string | undefined): unknown {
  if (!val) return null
  try { return JSON.parse(val) } catch {
    // Tenta parsear como lista separada por |
    const items = val.split('|').map(s => s.trim()).filter(Boolean)
    return items.length > 0 ? items : null
  }
}

async function main() {
  const file = process.argv[2]
  if (!file) { console.error('Uso: npx tsx scripts/import-playbooks-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas`)

  const batch: Record<string, unknown>[] = []
  let skipped = 0

  for (const r of rows) {
    if (!r.nome) { skipped++; continue }
    batch.push({
      nome: r.nome,
      dor_principal: r.dor_principal || null,
      gatilho_ativacao: r.gatilho_ativacao || null,
      objetivo: r.objetivo || null,
      duracao_dias: r.duracao_dias ? parseInt(r.duracao_dias) : 14,
      dificuldade: r.dificuldade || 'facil',
      checklist: parseJSON(r.checklist),
      scripts: parseJSON(r.scripts),
      conteudos_recomendados: parseJSON(r.conteudos_recomendados),
      metricas_acompanhamento: parseJSON(r.metricas_acompanhamento),
      ativo: true,
    })
  }

  console.log(`Validos: ${batch.length} | Ignorados: ${skipped}`)

  const { error } = await supabase.from('playbooks').insert(batch)
  if (error) {
    console.error('Erro:', error.message)
  } else {
    console.log(`Inseridos: ${batch.length} playbooks`)
  }
}

main().catch(console.error)
