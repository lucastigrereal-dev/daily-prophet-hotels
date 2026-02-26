import * as fs from 'fs';
import * as path from 'path';

interface CSVPost {
  numero: string;
  tipoPost: string;
  conteudo: string;
  headlines: string;
  roteiroreels: string;
  roteirocarrossel: string;
  legendaseo: string;
  ctas: string;
  hacks: string;
}

interface ProcessedPost {
  objective: string;
  summary: string;
  headlines: string;
  script_reels: string;
  script_carousel: string;
  caption_seo: string;
  ctas: string;
  hacks: string;
  source_file: string;
  pillar?: string;
}

// Parse CSV manually to handle complex quoted fields
function parseCSV(content: string): CSVPost[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const posts: CSVPost[] = [];

  // Find column indices
  const numeroIdx = headers.findIndex(h => h === '#');
  const tipoPostIdx = headers.findIndex(h => h.includes('tipo de post'));
  const conteudoIdx = headers.findIndex(h => h.includes('conteudo'));
  const headlinesIdx = headers.findIndex(h => h.includes('headline'));
  const reelsIdx = headers.findIndex(h => h.includes('roteiro reels'));
  const carrosselIdx = headers.findIndex(h => h.includes('roteiro carrossel'));
  const legendaIdx = headers.findIndex(h => h.includes('legenda seo'));
  const ctasIdx = headers.findIndex(h => h.includes('cta'));
  const hacksIdx = headers.findIndex(h => h.includes('hacks'));

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma but respect quoted fields
    const values = parseCSVLine(line);

    if (values.length > 0 && values[numeroIdx]?.trim()) {
      posts.push({
        numero: values[numeroIdx]?.trim() || '',
        tipoPost: values[tipoPostIdx]?.trim() || '',
        conteudo: values[conteudoIdx]?.trim() || '',
        headlines: values[headlinesIdx]?.trim() || '',
        roteiroreels: values[reelsIdx]?.trim() || '',
        roteirocarrossel: values[carrosselIdx]?.trim() || '',
        legendaseo: values[legendaIdx]?.trim() || '',
        ctas: values[ctasIdx]?.trim() || '',
        hacks: values[hacksIdx]?.trim() || '',
      });
    }
  }

  return posts;
}

// Helper to parse CSV line respecting quoted fields
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Transform CSV data to API format
function transformPost(csvPost: CSVPost): ProcessedPost {
  return {
    objective: csvPost.tipoPost,
    summary: csvPost.conteudo,
    headlines: csvPost.headlines,
    script_reels: csvPost.roteiroreels,
    script_carousel: csvPost.roteirocarrossel,
    caption_seo: csvPost.legendaseo,
    ctas: csvPost.ctas,
    hacks: csvPost.hacks,
    source_file: 'planilha_de_postagens_grok.csv',
  };
}

// Main import function
async function importCSVPosts() {
  console.log('🚀 Iniciando importação de posts do CSV...\n');

  // Find CSV file
  const csvPaths = [
    'C:\\Users\\lucas\\Desktop\\03_BACKUP\\Downloads_COMET\\planilha de postagens grok - Página1.csv',
    path.join(process.cwd(), 'planilha_de_postagens_grok.csv'),
  ];

  let csvPath = '';
  for (const p of csvPaths) {
    if (fs.existsSync(p)) {
      csvPath = p;
      break;
    }
  }

  if (!csvPath) {
    console.error('❌ Erro: Arquivo CSV não encontrado');
    console.error('Procurando em:', csvPaths);
    process.exit(1);
  }

  console.log(`📄 Encontrado CSV: ${csvPath}\n`);

  // Read and parse CSV
  const content = fs.readFileSync(csvPath, 'utf-8');
  const csvPosts = parseCSV(content);

  if (csvPosts.length === 0) {
    console.error('❌ Nenhum post encontrado no CSV');
    process.exit(1);
  }

  console.log(`📊 Lidos ${csvPosts.length} posts do CSV\n`);

  // Transform posts
  const transformedPosts = csvPosts.map(transformPost);

  console.log('📋 Primeiros 3 posts (preview):');
  transformedPosts.slice(0, 3).forEach((post, idx) => {
    console.log(`\n  ${idx + 1}. Objetivo: ${post.objective}`);
    console.log(`     Resumo: ${post.summary.substring(0, 50)}...`);
  });

  console.log('\n📤 Enviando para API...\n');

  // Call API
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/import/csv-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts: transformedPosts }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Erro na API:', result.error);
      process.exit(1);
    }

    console.log('✅ Sucesso!');
    console.log(`\n📊 Resultados:`);
    console.log(`   Total importado: ${result.count} posts`);
    console.log(`   Mensagem: ${result.message}`);
    console.log('\n✨ Importação completa!');
  } catch (error: any) {
    console.error('❌ Erro ao conectar à API:', error.message);
    process.exit(1);
  }
}

// Run
importCSVPosts();
