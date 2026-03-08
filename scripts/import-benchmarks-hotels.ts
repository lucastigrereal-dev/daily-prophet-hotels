/**
 * IMPORT: Benchmarks / Legendas de hotelaria
 * Tabela destino: benchmarks_posts
 *
 * Uso:
 *   npx tsx scripts/import-benchmarks-hotels.ts <arquivo.csv>
 *
 * CSV esperado (separador ; ou ,):
 *   hook;legenda_completa;cta;tema;formato;publico;intencao;hashtags;tipo_hotel;objetivo;sazonalidade;subtema;quando_usar;qualidade_score;hotel_origem;instagram_origem
 *
 * Campos obrigatorios: legenda_completa
 * Todos os outros sao opcionais e recebem defaults da taxonomia.
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

interface RawRow {
  hook?: string
  legenda_completa: string
  cta?: string
  tema?: string
  formato?: string
  publico?: string
  intencao?: string
  hashtags?: string
  tipo_hotel?: string
  objetivo?: string
  sazonalidade?: string
  subtema?: string
  quando_usar?: string
  qualidade_score?: string
  hotel_origem?: string
  instagram_origem?: string
  descricao_visual?: string
  categoria_hotel?: string
}

function parseCSV(content: string): RawRow[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) return []
  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''))
  return lines.slice(1).map(line => {
    const vals = line.split(sep)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim().replace(/^"|"$/g, '') })
    return row as unknown as RawRow
  })
}

function parseArray(val: string | undefined): string[] | null {
  if (!val) return null
  return val.split(/[,;|]+/).map(s => s.trim()).filter(Boolean)
}

function parseHashtags(val: string | undefined): string[] {
  if (!val) return []
  return val.split(/[\s,;|]+/).map(s => s.trim()).filter(Boolean).map(s => s.startsWith('#') ? s : `#${s}`)
}

async function main() {
  const file = process.argv[2]
  if (!file) { console.error('Uso: npx tsx scripts/import-benchmarks-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas do CSV`)

  const batch: Record<string, unknown>[] = []
  let skipped = 0

  for (const r of rows) {
    if (!r.legenda_completa || r.legenda_completa.length < 10) { skipped++; continue }
    batch.push({
      hook: r.hook || null,
      legenda_completa: r.legenda_completa,
      cta: r.cta || null,
      tema: r.tema || null,
      formato: r.formato || null,
      publico: r.publico || 'misto',
      intencao: r.intencao || null,
      hashtags: parseHashtags(r.hashtags),
      tipo_hotel: parseArray(r.tipo_hotel),
      objetivo: r.objetivo || null,
      sazonalidade: r.sazonalidade || 'o_ano_todo',
      subtema: r.subtema || null,
      quando_usar: r.quando_usar || null,
      qualidade_score: r.qualidade_score ? parseInt(r.qualidade_score) : 5,
      hotel_origem: r.hotel_origem || null,
      instagram_origem: r.instagram_origem || null,
      descricao_visual: r.descricao_visual || null,
      categoria_hotel: r.categoria_hotel || null,
      ativo: true,
    })
  }

  console.log(`Validas: ${batch.length} | Ignoradas: ${skipped}`)

  // Insert em batches de 50
  const BATCH_SIZE = 50
  let inserted = 0
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const chunk = batch.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('benchmarks_posts').insert(chunk)
    if (error) {
      console.error(`Erro no batch ${i}-${i + chunk.length}:`, error.message)
    } else {
      inserted += chunk.length
      console.log(`Inseridas ${inserted}/${batch.length}`)
    }
  }

  console.log(`\nFinalizado: ${inserted} legendas inseridas em benchmarks_posts`)
}

main().catch(console.error)
