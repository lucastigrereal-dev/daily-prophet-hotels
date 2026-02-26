/**
 * Script para verificar schema das tabelas no Supabase
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://damxbdkteskryonvgvpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listTables() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 VERIFICANDO TABELAS NO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const tables = ['ctas', 'legendas', 'hashtags', 'posts_calendario', 'posts', 'keywords', 
                  'reels', 'carrosseis', 'stories', 'hooks', 'ideias', 'protocolos',
                  'posts_exemplo', 'stories_sequencias', 'categorias_cta', 'gatilhos', 'temas_hashtag'];
  
  for (const table of tables) {
    console.log(`\n📋 Tabela: ${table}`);
    
    // Tenta fazer um select limitado para ver se existe e quais colunas
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ ${error.message.substring(0, 80)}`);
    } else {
      console.log(`   ✅ EXISTE`);
      if (data && data.length > 0) {
        console.log(`   📝 Colunas: ${Object.keys(data[0]).join(', ')}`);
      } else {
        console.log(`   📝 Tabela vazia (sem registros para inferir colunas)`);
      }
    }
  }
}

listTables().catch(console.error);
