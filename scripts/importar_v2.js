/**
 * ═══════════════════════════════════════════════════════════════════
 * DAILY PROPHET - Importação Corrigida com Lookup de FKs
 * ═══════════════════════════════════════════════════════════════════
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://damxbdkteskryonvgvpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_DIR = 'C:\\Users\\lucas\\Desktop\\daily-prophet-gamified\\DAILY_PROPHET_ARQUIVOS\\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO\\output_daily_prophet';

// Cache de lookups
let categoriasCta = {};
let gatilhos = {};
let temasHashtag = {};

// ═══════════════════════════════════════════════════════════════════
// CARREGAR LOOKUPS
// ═══════════════════════════════════════════════════════════════════

async function loadLookups() {
  console.log('📚 Carregando tabelas de lookup...\n');
  
  // Categorias CTA
  const { data: cats } = await supabase.from('categorias_cta').select('*');
  if (cats) {
    cats.forEach(c => { categoriasCta[c.nome.toLowerCase()] = c.id; });
    console.log(`   ✅ categorias_cta: ${cats.length} registros`);
  }
  
  // Gatilhos
  const { data: gats } = await supabase.from('gatilhos').select('*');
  if (gats) {
    gats.forEach(g => { gatilhos[g.nome.toLowerCase()] = g.id; });
    console.log(`   ✅ gatilhos: ${gats.length} registros`);
  }
  
  // Temas Hashtag
  const { data: temas } = await supabase.from('temas_hashtag').select('*');
  if (temas) {
    temas.forEach(t => { 
      temasHashtag[t.codigo] = t.id; 
      temasHashtag[t.nome.toLowerCase()] = t.id;
    });
    console.log(`   ✅ temas_hashtag: ${temas.length} registros`);
  }
  
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES DE TRANSFORMAÇÃO
// ═══════════════════════════════════════════════════════════════════

function transformCTA(item) {
  const catId = categoriasCta[item.categoria?.toLowerCase()] || null;
  return {
    id: item.id,
    texto: item.texto,
    categoria_id: catId,
    formato: item.formato,
    observacao: item.observacao || null,
    pilar: item.pilar,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

function transformLegenda(item) {
  const gatilhoId = gatilhos[item.gatilho?.toLowerCase()] || null;
  return {
    id: item.id,
    tipo: item.tipo,
    texto: item.texto,
    gatilho_id: gatilhoId,
    keyword_principal: item.keyword_principal || null,
    procedimento: item.procedimento || 'geral',
    pilar: item.pilar,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

function transformHashtag(item) {
  const temaId = temasHashtag[item.tema] || temasHashtag[item.tema?.toLowerCase()] || null;
  return {
    id: item.id,
    tag: item.tag,
    tema_id: temaId,
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
    titulo: item.tema || item.hook?.substring(0, 100) || 'Post sem título',
    data_publicacao: item.data || null,
    horario: item.horario || null,
    formato: item.formato === 'Reel' ? 'Reels' : item.formato,
    pilar: item.pilar || 'autoridade',
    status: item.status || 'A Criar',
    hook: item.hook || null,
    legenda_abertura: item.legenda?.substring(0, 500) || null,
    cta: item.cta_texto || item.cta || null,
    hashtags: item.hashtags_texto || item.hashtags || null,
    keyword_principal: item.keyword_principal || null
  };
}

function transformKeyword(item) {
  return {
    id: item.id,
    keyword: item.termo || item.keyword,
    volume_mensal: item.volume ? parseInt(item.volume.toString().replace(/[^\d]/g, '')) || null : null,
    intencao: item.intencao || 'informativa',
    dificuldade: item.dificuldade || 'Média',
    origem: item.origem || null,
    ativo: true
  };
}

// ═══════════════════════════════════════════════════════════════════
// IMPORTAÇÃO
// ═══════════════════════════════════════════════════════════════════

async function importTable(file, table, transform) {
  const filePath = path.join(JSON_DIR, file);
  
  console.log(`\n📦 ${file} → ${table}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️ Arquivo não encontrado`);
    return { success: 0, errors: 0 };
  }
  
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`   📄 ${items.length} registros`);
  
  let success = 0, errors = 0;
  const BATCH_SIZE = 25;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE).map(transform);
    
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    
    if (error) {
      errors += batch.length;
      if (errors <= 25) console.log(`   ❌ ${error.message.substring(0, 100)}`);
    } else {
      success += batch.length;
    }
  }
  
  console.log(`   ✅ ${success} sucesso | ❌ ${errors} erros`);
  return { success, errors };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    🚀 DAILY PROPHET - Importação v2 (com FK Lookup)           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  await loadLookups();
  
  const results = [];
  
  results.push(await importTable('ctas.json', 'ctas', transformCTA));
  results.push(await importTable('legendas.json', 'legendas', transformLegenda));
  results.push(await importTable('hashtags.json', 'hashtags', transformHashtag));
  results.push(await importTable('posts_calendario.json', 'posts', transformPost));
  results.push(await importTable('keywords.json', 'keywords', transformKeyword));
  
  const total = results.reduce((acc, r) => ({ 
    success: acc.success + r.success, 
    errors: acc.errors + r.errors 
  }), { success: 0, errors: 0 });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 TOTAL: ${total.success} ✅ sucesso | ${total.errors} ❌ erros`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (total.success > 0 && total.errors === 0) {
    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
  }
}

main().catch(console.error);
