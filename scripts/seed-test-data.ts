import 'dotenv/config';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL ou chave não configuradas!');
  process.exit(1);
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

// Sample checklist items for each fase
const checklistTemplates = {
  composicao: {
    'script-review': { status: 'pendente' as const, observacao: 'Revisar script do reel' },
    'tema-carrossel': { status: 'pendente' as const, observacao: 'Definir tema do carrossel' },
    'estrategia-stories': { status: 'pendente' as const, observacao: 'Planejar estratégia de stories' },
  },
  fase_1: {
    'roteiro-gravacao': { status: 'pendente' as const, observacao: 'Preparar roteiro' },
    'selecao-musica': { status: 'pendente' as const, observacao: 'Escolher música' },
    'preparacao-cenario': { status: 'pendente' as const, observacao: 'Montar cenário' },
  },
  fase_2: {
    'edicao-reel': { status: 'pendente' as const, observacao: 'Editar reel' },
    'adicionar-efeitos': { status: 'pendente' as const, observacao: 'Adicionar efeitos' },
    'legenda-sync': { status: 'pendente' as const, observacao: 'Sincronizar legendas' },
  },
  fase_3: {
    'revisar-qualidade': { status: 'pendente' as const, observacao: 'Revisar qualidade' },
    'testar-audio': { status: 'pendente' as const, observacao: 'Testar áudio' },
    'compatibilidade': { status: 'pendente' as const, observacao: 'Verificar compatibilidade' },
  },
  fase_4: {
    'agendar-publicacao': { status: 'pendente' as const, observacao: 'Agendar na plataforma' },
    'preparar-descricao': { status: 'pendente' as const, observacao: 'Preparar descrição' },
    'definir-hashtags': { status: 'pendente' as const, observacao: 'Definir hashtags' },
  },
  fase_5: {
    'monitorar-metricas': { status: 'pendente' as const, observacao: 'Monitorar visualizações' },
    'engajamento': { status: 'pendente' as const, observacao: 'Responder comentários' },
    'otimizacao': { status: 'pendente' as const, observacao: 'Otimizar baseado em dados' },
  },
};

async function seedTestData() {
  try {
    console.log('🌱 Iniciando seed de dados de teste...\n');

    // Step 1: Create test postpacks
    console.log('📦 Criando postpacks de teste...');
    const postpackIds: string[] = [];

    const testPostpacks = [
      {
        title: 'Dicas de Produtividade',
        name: 'productivity-tips',
        objective: 'Compartilhar técnicas de produtividade',
        format: 'reel',
        procedure: 'Gravar vídeo curto com dicas práticas',
      },
      {
        title: 'Receita Rápida',
        name: 'quick-recipe',
        objective: 'Ensinar receita fácil',
        format: 'carrossel',
        procedure: 'Criar carrossel com passos da receita',
      },
      {
        title: 'Motivação Diária',
        name: 'daily-motivation',
        objective: 'Inspirar seguidores',
        format: 'story',
        procedure: 'Conteúdo motivacional em stories',
      },
    ];

    for (const postpack of testPostpacks) {
      const { data, error } = await supabase
        .from('postpacks')
        .insert(postpack)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao criar postpack ${postpack.name}:`, error.message);
        continue;
      }

      postpackIds.push(data.id);
      console.log(`✅ Postpack criado: ${postpack.title} (${data.id})`);
    }

    // Step 2: Create workflows for each postpack
    console.log('\n🔄 Criando workflows...');

    const statuses = ['composicao', 'fase_1', 'fase_2', 'fase_3', 'fase_4'];

    for (let i = 0; i < postpackIds.length; i++) {
      const postpackId = postpackIds[i];
      const status = statuses[i % statuses.length];

      const workflowData = {
        postpack_id: postpackId,
        status,
        created_by: 'test-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Fase statuses
        composicao_status: status === 'composicao' ? 'em_progresso' : 'concluido',
        fase_1_status: ['fase_1', 'fase_2', 'fase_3', 'fase_4', 'fase_5'].includes(status) ? 'em_progresso' : 'pendente',
        fase_2_status: ['fase_2', 'fase_3', 'fase_4', 'fase_5'].includes(status) ? 'em_progresso' : 'pendente',
        fase_3_status: ['fase_3', 'fase_4', 'fase_5'].includes(status) ? 'em_progresso' : 'pendente',
        fase_4_status: ['fase_4', 'fase_5'].includes(status) ? 'em_progresso' : 'pendente',
        fase_5_status: status === 'fase_5' ? 'em_progresso' : 'pendente',
        // Checklists
        composicao_checklist: checklistTemplates.composicao,
        fase_1_checklist: checklistTemplates.fase_1,
        fase_2_checklist: checklistTemplates.fase_2,
        fase_3_checklist: checklistTemplates.fase_3,
        fase_4_checklist: checklistTemplates.fase_4,
        fase_5_checklist: checklistTemplates.fase_5,
      };

      const { data: workflow, error: wfError } = await supabase
        .from('postpack_workflow')
        .insert(workflowData)
        .select()
        .single();

      if (wfError) {
        console.error(`❌ Erro ao criar workflow para postpack ${postpackId}:`, wfError.message);
        continue;
      }

      console.log(`✅ Workflow criado: ${workflow.id} (status: ${status})`);
    }

    console.log('\n✨ Seed de dados concluído com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   - Postpacks criados: ${postpackIds.length}`);
    console.log(`   - Workflows criados: ${postpackIds.length}`);
    console.log('\n🎯 Próximas ações:');
    console.log('   1. Abra http://localhost:3000/workflow');
    console.log('   2. Você deve ver os workflows listados');
    console.log('   3. Clique em um workflow para ver os detalhes');

  } catch (error) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }
}

seedTestData();
