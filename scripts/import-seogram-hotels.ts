/**
 * IMPORT: Conteudo SEO/Instagram (SEOgram)
 * Tabela destino: benchmarks_posts + hashtag_combos
 *
 * Uso:
 *   npx tsx scripts/import-seogram-hotels.ts <arquivo.csv>
 *
 * CSV esperado:
 *   legenda_seo;hashtags;tema;formato;publico;tipo_hotel;objetivo;cta;descricao_visual
 *
 * Esse script importa legendas otimizadas para SEO do Instagram
 * e extrai combos de hashtags separadamente para hashtag_combos.
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
  if (!file) { console.error('Uso: npx tsx scripts/import-seogram-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas`)

  const legendaBatch: Record<string, unknown>[] = []
  const hashtagSets = new Map<string, string[]>()
  let skipped = 0

  for (const r of rows) {
    const legenda = r.legenda_seo || r.legenda_completa || r.legenda || ''
    if (legenda.length < 10) { skipped++; continue }

    const hashtags = parseHashtags(r.hashtags)
    const tema = r.tema || null

    legendaBatch.push({
      hook: r.hook || extractHook(legenda),
      legenda_completa: legenda,
      cta: r.cta || null,
      tema,
      formato: r.formato || null,
      publico: r.publico || 'misto',
      hashtags,
      tipo_hotel: parseArray(r.tipo_hotel),
      objetivo: r.objetivo || null,
      sazonalidade: r.sazonalidade || 'o_ano_todo',
      descricao_visual: r.descricao_visual || null,
      biblioteca_origem: 'seogram',
      qualidade_score: 6,
      ativo: true,
    })

    // Acumula hashtags por tema para criar combos
    if (hashtags.length >= 5 && tema) {
      const key = tema
      const existing = hashtagSets.get(key) || []
      hashtagSets.set(key, [...new Set([...existing, ...hashtags])])
    }
  }

  console.log(`Legendas validas: ${legendaBatch.length} | Ignoradas: ${skipped}`)
  console.log(`Combos de hashtags detectados: ${hashtagSets.size}`)

  // Insert legendas
  const BATCH_SIZE = 50
  let inserted = 0
  for (let i = 0; i < legendaBatch.length; i += BATCH_SIZE) {
    const chunk = legendaBatch.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('benchmarks_posts').insert(chunk)
    if (error) {
      console.error(`Erro batch legendas ${i}:`, error.message)
    } else {
      inserted += chunk.length
    }
  }
  console.log(`Legendas inseridas: ${inserted}`)

  // Insert hashtag combos
  let combosInserted = 0
  for (const [tema, tags] of hashtagSets) {
    const { error } = await supabase.from('hashtag_combos').insert({
      nome: `SEOgram — ${tema}`,
      tema,
      hashtags: tags.slice(0, 30),
      nicho: 'hotelaria',
      ativo: true,
    })
    if (!error) combosInserted++
  }
  console.log(`Combos de hashtags inseridos: ${combosInserted}`)

  console.log('\nFinalizado!')
}

main().catch(console.error)
