/**
 * ═══════════════════════════════════════════════════════════════════
 * DAILY PROPHET - Importação v3 (com correção de ENUMs)
 * ═══════════════════════════════════════════════════════════════════
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = 'https://damxbdkteskryonvgvpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_DIR = 'C:\\Users\\lucas\\Desktop\\daily-prophet-gamified\\DAILY_PROPHET_ARQUIVOS\\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO\\output_daily_prophet';

// Cache de lookups
let categoriasCta = {};
let gatilhos = {};
let temasHashtag = {};

// ═══════════════════════════════════════════════════════════════════
// MAPEAMENTOS DE ENUM
// ═══════════════════════════════════════════════════════════════════

const FORMATO_VALIDOS = ['Reels', 'Carrossel', 'Stories', 'Feed', 'Live', 'IGTV'];
const INTENCAO_VALIDOS = ['descoberta', 'informativa', 'comercial', 'transacional', 'navegacional'];
const DIFICULDADE_VALIDOS = ['Fácil', 'Média', 'Difícil', 'Muito Difícil'];
const NIVEL_VALIDOS = ['broad', 'niche', 'micro', 'nano'];
const RISCO_VALIDOS = ['baixo', 'medio', 'alto'];

function mapFormato(val) {
  if (!val || val === 'geral') return null;
  if (val === 'Reel') return 'Reels';
  return FORMATO_VALIDOS.includes(val) ? val : null;
}

function mapIntencao(val) {
  if (!val) return 'descoberta';
  const lower = val.toLowerCase();
  // Mapear valores não-padrão
  const map = {
    'autoridade': 'informativa',
    'educativo': 'informativa',
    'prova_social': 'descoberta',
    'conexao': 'descoberta'
  };
  if (map[lower]) return map[lower];
  return INTENCAO_VALIDOS.includes(lower) ? lower : 'descoberta';
}

function mapDificuldade(val) {
  if (!val) return 'Média';
  const map = {
    'baixa': 'Fácil',
    'media': 'Média',
    'alta': 'Difícil',
    'muito alta': 'Muito Difícil'
  };
  const lower = val.toLowerCase();
  if (map[lower]) return map[lower];
  return DIFICULDADE_VALIDOS.includes(val) ? val : 'Média';
}

function mapNivel(val) {
  if (!val) return 'niche';
  return NIVEL_VALIDOS.includes(val.toLowerCase()) ? val.toLowerCase() : 'niche';
}

function mapRisco(val) {
  if (!val) return 'baixo';
  return RISCO_VALIDOS.includes(val.toLowerCase()) ? val.toLowerCase() : 'baixo';
}

// ═══════════════════════════════════════════════════════════════════
// CARREGAR LOOKUPS
// ═══════════════════════════════════════════════════════════════════

async function loadLookups() {
  console.log('📚 Carregando tabelas de lookup...\n');
  
  const { data: cats } = await supabase.from('categorias_cta').select('*');
  if (cats) cats.forEach(c => { categoriasCta[c.nome.toLowerCase()] = c.id; });
  console.log(`   ✅ categorias_cta: ${cats?.length || 0}`);
  
  const { data: gats } = await supabase.from('gatilhos').select('*');
  if (gats) gats.forEach(g => { gatilhos[g.nome.toLowerCase()] = g.id; });
  console.log(`   ✅ gatilhos: ${gats?.length || 0}`);
  
  const { data: temas } = await supabase.from('temas_hashtag').select('*');
  if (temas) temas.forEach(t => { 
    temasHashtag[t.codigo] = t.id; 
    temasHashtag[t.nome.toLowerCase()] = t.id;
  });
  console.log(`   ✅ temas_hashtag: ${temas?.length || 0}\n`);
}

// ═══════════════════════════════════════════════════════════════════
// TRANSFORMAÇÕES
// ═══════════════════════════════════════════════════════════════════

function transformCTA(item) {
  return {
    id: item.id,
    texto: item.texto,
    categoria_id: categoriasCta[item.categoria?.toLowerCase()] || null,
    formato: mapFormato(item.formato),
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
    gatilho_id: gatilhos[item.gatilho?.toLowerCase()] || null,
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
    tema_id: temasHashtag[item.tema] || null,
    nivel: mapNivel(item.nivel),
    volume: item.volume || null,
    intencao: mapIntencao(item.intencao),
    risco_compliance: mapRisco(item.risco_compliance),
    justificativa: item.justificativa || null,
    origem: item.origem || null,
    ativo: true,
    uso_count: 0
  };
}

// Para posts, precisamos gerar UUIDs
function transformPost(item, index) {
  return {
    id: uuidv4(),
    titulo: item.tema || item.hook?.substring(0, 100) || `Post ${index + 1}`,
    data_publicacao: item.data || null,
    horario: item.horario || null,
    formato: mapFormato(item.formato),
    pilar: item.pilar || 'autoridade',
    status: item.status || 'A Criar',
    hook: item.hook || null,
    legenda_abertura: item.legenda?.substring(0, 1000) || null,
    cta: item.cta_texto || item.cta || null,
    hashtags: item.hashtags_texto || item.hashtags || null,
    keyword_principal: item.keyword_principal || null
  };
}

function transformKeyword(item) {
  return {
    id: item.id,
    keyword: item.termo || item.keyword,
    volume_mensal: item.volume ? parseInt(String(item.volume).replace(/[^\d]/g, '')) || null : null,
    intencao: mapIntencao(item.intencao),
    dificuldade: mapDificuldade(item.dificuldade),
    origem: item.origem || null,
    ativo: true
  };
}

// ═══════════════════════════════════════════════════════════════════
// IMPORTAÇÃO
// ═══════════════════════════════════════════════════════════════════

async function importTable(file, table, transform, useIndex = false) {
  const filePath = path.join(JSON_DIR, file);
  
  console.log(`\n📦 ${file} → ${table}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️ Arquivo não encontrado`);
    return { success: 0, errors: 0 };
  }
  
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`   📄 ${items.length} registros`);
  
  let success = 0, errors = 0;
  const BATCH_SIZE = 20;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE).map((item, idx) => 
      useIndex ? transform(item, i + idx) : transform(item)
    );
    
    const { error } = await supabase
      .from(table)
      .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    
    if (error) {
      errors += batch.length;
      if (errors <= BATCH_SIZE) console.log(`   ❌ ${error.message.substring(0, 80)}`);
    } else {
      success += batch.length;
    }
  }
  
  const pct = items.length > 0 ? ((success / items.length) * 100).toFixed(0) : 0;
  console.log(`   ✅ ${success}/${items.length} (${pct}%)`);
  return { success, errors };
}

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║    🚀 DAILY PROPHET - Importação v3 (ENUM Fix)                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  await loadLookups();
  
  const results = [];
  
  results.push(await importTable('ctas.json', 'ctas', transformCTA));
  results.push(await importTable('legendas.json', 'legendas', transformLegenda));
  results.push(await importTable('hashtags.json', 'hashtags', transformHashtag));
  results.push(await importTable('posts_calendario.json', 'posts', transformPost, true));
  results.push(await importTable('keywords.json', 'keywords', transformKeyword));
  
  const total = results.reduce((acc, r) => ({ 
    success: acc.success + r.success, 
    errors: acc.errors + r.errors 
  }), { success: 0, errors: 0 });
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 TOTAL: ${total.success} ✅ | ${total.errors} ❌`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (total.errors === 0) {
    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA COM 100% DE SUCESSO!');
  } else if (total.success > 0) {
    console.log(`\n⚠️ Importação parcial: ${((total.success / (total.success + total.errors)) * 100).toFixed(0)}%`);
  }
}

main().catch(console.error);
