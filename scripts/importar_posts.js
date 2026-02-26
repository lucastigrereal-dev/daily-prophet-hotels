/**
 * DAILY PROPHET - Importação Final de Posts
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SUPABASE_URL = 'https://damxbdkteskryonvgvpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_DIR = 'C:\\Users\\lucas\\Desktop\\daily-prophet-gamified\\DAILY_PROPHET_ARQUIVOS\\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO\\output_daily_prophet';

// Mapeamentos
const STATUS_MAP = {
  'a criar': 'rascunho',
  'em produção': 'em_producao',
  'agendado': 'agendado',
  'publicado': 'publicado',
  'arquivado': 'arquivado'
};

const FORMATO_MAP = {
  'reel': 'Reels',
  'reels': 'Reels',
  'carrossel': 'Carrossel',
  'stories': 'Stories',
  'feed': 'Feed',
  'live': 'Live'
};

function transformPost(item, index) {
  const statusKey = (item.status || 'a criar').toLowerCase();
  const formatoKey = (item.formato || 'Reels').toLowerCase();
  
  return {
    id: uuidv4(),
    titulo: item.tema || item.hook?.substring(0, 100) || `Post ${index + 1}`,
    data_publicacao: item.data || null,
    horario: item.horario || null,
    formato: FORMATO_MAP[formatoKey] || 'Reels',
    pilar: item.pilar || 'autoridade',
    status: STATUS_MAP[statusKey] || 'rascunho',
    hook: item.hook || null,
    legenda_abertura: item.legenda?.substring(0, 2000) || null,
    cta: item.cta_texto || item.cta || null,
    hashtags: item.hashtags_texto || item.hashtags || null,
    keyword_principal: item.keyword_principal || null
  };
}

async function main() {
  console.log('📦 Importando posts_calendario.json → posts...\n');
  
  const filePath = path.join(JSON_DIR, 'posts_calendario.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  console.log(`   📄 ${items.length} registros\n`);
  
  let success = 0, errors = 0;
  
  for (let i = 0; i < items.length; i++) {
    const post = transformPost(items[i], i);
    
    const { error } = await supabase.from('posts').insert([post]);
    
    if (error) {
      errors++;
      console.log(`   ❌ Post ${i + 1}: ${error.message.substring(0, 60)}`);
    } else {
      success++;
      console.log(`   ✅ Post ${i + 1}: ${post.titulo.substring(0, 40)}...`);
    }
  }
  
  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`📊 POSTS: ${success}/${items.length} importados`);
  console.log(`═══════════════════════════════════════════════════════════════`);
}

main().catch(console.error);
