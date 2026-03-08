/**
 * IMPORT: Legendas soltas (sem benchmark completo)
 * Tabela destino: benchmarks_posts (mesmo destino, campo hook opcional)
 *
 * Uso:
 *   npx tsx scripts/import-legendas-hotels.ts <arquivo.csv>
 *
 * CSV esperado:
 *   legenda;tema;formato;publico;cta;hashtags;tipo_hotel;objetivo;sazonalidade
 *
 * Diferenca do import-benchmarks:
 *   - Aceita campo "legenda" alem de "legenda_completa"
 *   - Gera hook automatico da primeira frase se nao fornecido
 *   - Origem marcada como "legenda_avulsa"
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

function extractHook(legenda: string): string {
  const first = legenda.split(/[.!?\n]/)[0]?.trim()
  return first && first.length > 10 ? first : legenda.slice(0, 80)
}

function parseHashtags(val: string | undefined): string[] {
  if (!val) return []
  return val.split(/[\s,;|]+/).map(s => s.trim()).filter(Boolean).map(s => s.startsWith('#') ? s : `#${s}`)
}

function parseArray(val: string | undefined): string[] | null {
  if (!val) return null
  return val.split(/[,;|]+/).map(s => s.trim()).filter(Boolean)
}

async function main() {
  const file = process.argv[2]
  if (!file) { console.error('Uso: npx tsx scripts/import-legendas-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas`)

  const batch: Record<string, unknown>[] = []
  let skipped = 0

  for (const r of rows) {
    const legenda = r.legenda_completa || r.legenda || r.texto || ''
    if (legenda.length < 10) { skipped++; continue }
    batch.push({
      hook: r.hook || extractHook(legenda),
      legenda_completa: legenda,
      cta: r.cta || null,
      tema: r.tema || null,
      formato: r.formato || null,
      publico: r.publico || 'misto',
      hashtags: parseHashtags(r.hashtags),
      tipo_hotel: parseArray(r.tipo_hotel),
      objetivo: r.objetivo || null,
      sazonalidade: r.sazonalidade || 'o_ano_todo',
      subtema: r.subtema || null,
      biblioteca_origem: 'legenda_avulsa',
      qualidade_score: r.qualidade_score ? parseInt(r.qualidade_score) : 5,
      ativo: true,
    })
  }

  console.log(`Validas: ${batch.length} | Ignoradas: ${skipped}`)

  const BATCH_SIZE = 50
  let inserted = 0
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('benchmarks_posts').insert(chunk)
    if (error) {
      console.error(`Erro batch ${i}:`, error.message)
    } else {
      inserted += chunk.length
      console.log(`Inseridas ${inserted}/${batch.length}`)
    }
  }

  console.log(`\nFinalizado: ${inserted} legendas inseridas (origem: legenda_avulsa)`)
}

main().catch(console.error)
