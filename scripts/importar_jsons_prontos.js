/**
 * ═══════════════════════════════════════════════════════════════════
 * DAILY PROPHET - Importação dos JSONs Prontos
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Script para importar os JSONs atômicos já estruturados no Supabase
 * 
 * Uso: node scripts/importar_jsons_prontos.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://damxbdkteskryonvgvpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Caminho dos JSONs prontos
const JSON_DIR = 'C:\\Users\\lucas\\Desktop\\daily-prophet-gamified\\DAILY_PROPHET_ARQUIVOS\\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO\\output_daily_prophet';

// Mapeamento de arquivos para tabelas
const IMPORTS = [
  { file: 'ctas.json', table: 'ctas', transform: transformCTA },
  { file: 'legendas.json', table: 'legendas', transform: transformLegenda },
  { file: 'hashtags.json', table: 'hashtags', transform: transformHashtag },
  { file: 'posts_calendario.json', table: 'posts_calendario', transform: transformPost },
  { file: 'keywords.json', table: 'keywords', transform: transformKeyword },
];

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES DE TRANSFORMAÇÃO
// ═══════════════════════════════════════════════════════════════════

function transformCTA(item) {
  return {
    id: item.id,
    texto: item.texto,
    categoria: item.categoria,
    formato: item.formato,
    observacao: item.observacao || null,
    pilar: item.pilar,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

function transformLegenda(item) {
  return {
    id: item.id,
    tipo: item.tipo,
    texto: item.texto,
    gatilho: item.gatilho || null,
    keyword_principal: item.keyword_principal || null,
    procedimento: item.procedimento || 'geral',
    pilar: item.pilar,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

function transformHashtag(item) {
  return {
    id: item.id,
    tag: item.tag,
    tema: item.tema || null,
    nivel: item.nivel || 'niche',
    volume: item.volume || null,
    intencao: item.intencao || 'descoberta',
    risco_compliance: item.risco_compliance || 'baixo',
    justificativa: item.justificativa || null,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

function transformPost(item) {
  return {
    id: item.id,
    id_original: item.id_original || null,
    data_publicacao: item.data || null,
    dia_semana: item.dia_semana || null,
    horario: item.horario || null,
    formato: item.formato,
    tema: item.tema || null,
    objetivo: item.objetivo || null,
    keyword_principal: item.keyword_principal || null,
    keyword_secundaria: item.keyword_secundaria || null,
    localizacao: item.localizacao || null,
    hook: item.hook || null,
    legenda: item.legenda || null,
    hashtags_texto: item.hashtags || null,
    cta_texto: item.cta || null,
    status: item.status || 'A Criar',
    prioridade_seo: item.prioridade_seo || null,
    pilar: item.pilar || 'autoridade',
    origem: item.origem || null
  };
}

function transformKeyword(item) {
  return {
    id: item.id,
    termo: item.termo || item.keyword,
    volume: item.volume || null,
    intencao: item.intencao || 'informativa',
    dificuldade: item.dificuldade || 'Média',
    procedimento: item.procedimento || 'geral',
    origem: item.origem || null,
    ativo: true
  };
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL DE IMPORTAÇÃO
// ═══════════════════════════════════════════════════════════════════

async function importTable(config) {
  const { file, table, transform } = config;
  const filePath = path.join(JSON_DIR, file);
  
  console.log(`\n📦 Importando ${file} → ${table}...`);
  
  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️ Arquivo não encontrado: ${file}`);
    return { success: 0, errors: 0, skipped: true };
  }
  
  // Ler JSON
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const items = JSON.parse(rawData);
  
  console.log(`   📄 ${items.length} registros encontrados`);
  
  let success = 0;
  let errors = 0;
  const errorDetails = [];
  
  // Processar em batches de 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const transformed = batch.map(transform);
    
    const { data, error } = await supabase
      .from(table)
      .upsert(transformed, { onConflict: 'id', ignoreDuplicates: false });
    
    if (error) {
      errors += batch.length;
      errorDetails.push({ batch: Math.floor(i/BATCH_SIZE) + 1, error: error.message });
    } else {
      success += batch.length;
    }
    
    // Progress
    process.stdout.write(`\r   ⏳ Processando: ${Math.min(i + BATCH_SIZE, items.length)}/${items.length}`);
  }
  
  console.log(`\n   ✅ Sucesso: ${success} | ❌ Erros: ${errors}`);
  
  if (errorDetails.length > 0) {
    console.log(`   📝 Primeiros erros:`);
    errorDetails.slice(0, 3).forEach(e => {
      console.log(`      Batch ${e.batch}: ${e.error.substring(0, 100)}`);
    });
  }
  
  return { success, errors, skipped: false };
}

// ═══════════════════════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 DAILY PROPHET - Importação JSONs Prontos              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n📁 Origem: ${JSON_DIR}`);
  console.log(`🔗 Supabase: ${SUPABASE_URL}`);
  
  const results = [];
  
  for (const config of IMPORTS) {
    const result = await importTable(config);
    results.push({ ...config, ...result });
  }
  
  // Relatório Final
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 RELATÓRIO FINAL');
  console.log('═══════════════════════════════════════════════════════════════');
  
  let totalSuccess = 0;
  let totalErrors = 0;
  
  results.forEach(r => {
    if (!r.skipped) {
      totalSuccess += r.success;
      totalErrors += r.errors;
      const pct = r.success + r.errors > 0 
        ? ((r.success / (r.success + r.errors)) * 100).toFixed(1) 
        : 0;
      console.log(`   ${r.table.padEnd(20)} ${r.success} ✅ | ${r.errors} ❌ (${pct}%)`);
    } else {
      console.log(`   ${r.table.padEnd(20)} ⏭️ PULADO (arquivo não encontrado)`);
    }
  });
  
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`   TOTAL                 ${totalSuccess} ✅ | ${totalErrors} ❌`);
  
  if (totalErrors === 0 && totalSuccess > 0) {
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║           ✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
  } else if (totalErrors > 0) {
    console.log('\n⚠️ Alguns erros ocorreram. Verifique o schema das tabelas.');
  }
}

main().catch(console.error);
