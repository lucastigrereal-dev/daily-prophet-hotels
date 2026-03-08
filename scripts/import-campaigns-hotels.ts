/**
 * IMPORT: Campanhas sazonais de hotelaria
 * Tabela destino: campanhas
 *
 * Uso:
 *   npx tsx scripts/import-campaigns-hotels.ts <arquivo.csv>
 *
 * CSV esperado:
 *   nome;tipo;objetivo;publico;data_inicio;data_fim;antecedencia_dias;formatos_sugeridos;cta_principal;descricao;tipo_hotel;sazonalidade;subtema
 *
 * Campo obrigatorio: nome, data_inicio
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

function parseArray(val: string | undefined): string[] {
  if (!val) return []
  return val.split(/[,;|]+/).map(s => s.trim()).filter(Boolean)
}

async function main() {
  const file = process.argv[2]
  if (!file) { console.error('Uso: npx tsx scripts/import-campaigns-hotels.ts <arquivo.csv>'); process.exit(1) }

  const content = readFileSync(resolve(file), 'utf-8')
  const rows = parseCSV(content)
  console.log(`Lidas ${rows.length} linhas`)

  const batch: Record<string, unknown>[] = []
  let skipped = 0

  for (const r of rows) {
    if (!r.nome || !r.data_inicio) { skipped++; continue }
    batch.push({
      nome: r.nome,
      tipo: r.tipo || 'sazonal',
      objetivo: r.objetivo || null,
      publico: r.publico || null,
      tipo_hotel: parseArray(r.tipo_hotel),
      antecedencia_dias: r.antecedencia_dias ? parseInt(r.antecedencia_dias) : 14,
      data_inicio: r.data_inicio,
      data_fim: r.data_fim || r.data_inicio,
      formatos_sugeridos: parseArray(r.formatos_sugeridos),
      cta_principal: r.cta_principal || null,
      descricao: r.descricao || null,
      sazonalidade: r.sazonalidade || null,
      subtema: r.subtema || null,
      ativo: true,
    })
  }

  console.log(`Validas: ${batch.length} | Ignoradas: ${skipped}`)

  const { error, count } = await supabase.from('campanhas').insert(batch)
  if (error) {
    console.error('Erro:', error.message)
  } else {
    console.log(`Inseridas: ${batch.length} campanhas`)
  }
}

main().catch(console.error)
