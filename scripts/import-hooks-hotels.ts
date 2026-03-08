/**
 * IMPORT: Hooks de hotelaria
 * Tabela destino: hooks
 *
 * Uso:
 *   npx tsx scripts/import-hooks-hotels.ts <arquivo.csv>
 *
 * CSV esperado:
 *   hook;tema;publico;intencao;formato;objetivo;tipo_hotel;sazonalidade;subtema;quando_usar;score_qualidade
 *
 * Campo obrigatorio: hook
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

function parseArray(val: string | undefined): string[] | null {
  if (!val) return null
  return val.split(/[,;|]+/).map(s => s.trim()).filter(Boolean)
}

async function main() {
  const file = process.argv[2]
  if (!file) { console.error('Uso: npx tsx scripts/import-hooks-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas`)

  const batch: Record<string, unknown>[] = []
  let skipped = 0

  for (const r of rows) {
    if (!r.hook || r.hook.length < 5) { skipped++; continue }
    batch.push({
      hook: r.hook,
      tema: r.tema || null,
      publico: r.publico || 'misto',
      intencao: r.intencao || null,
      formato: r.formato || null,
      objetivo: r.objetivo || null,
      tipo_hotel: parseArray(r.tipo_hotel),
      sazonalidade: r.sazonalidade || 'o_ano_todo',
      subtema: r.subtema || null,
      quando_usar: r.quando_usar || null,
      score_qualidade: r.score_qualidade ? parseInt(r.score_qualidade) : 5,
      ativo: true,
    })
  }

  console.log(`Validos: ${batch.length} | Ignorados: ${skipped}`)

  const BATCH_SIZE = 100
  let inserted = 0
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('hooks').insert(chunk)
    if (error) {
      console.error(`Erro batch ${i}:`, error.message)
    } else {
      inserted += chunk.length
      console.log(`Inseridos ${inserted}/${batch.length}`)
    }
  }

  console.log(`\nFinalizado: ${inserted} hooks inseridos`)
}

main().catch(console.error)
