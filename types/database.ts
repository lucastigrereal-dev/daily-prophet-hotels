// types/database.ts
// Tipos que espelham as tabelas do Supabase

export interface Objetivo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  cor: string | null;
  ordem: number;
  is_active: boolean;
}

export interface Formato {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  duracao_media: string | null;
  ordem: number;
  is_active: boolean;
}

export interface Procedimento {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  palavras_chave: string[] | null;
  prioridade: number;
  is_active: boolean;
}

export interface Ideia {
  id: string;
  titulo: string;
  descricao: string | null;
  procedimento_id: string | null;
  objetivo_id: string | null;
  formato_recomendado: string | null;
  palavras_chave: string[] | null;
  nivel_dificuldade: 'facil' | 'medio' | 'dificil' | null;
  tempo_producao: string | null;
  vezes_usado: number;
  performance_media: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Gancho {
  id: string;
  conteudo: string;
  tipo: 'pergunta' | 'estatistica' | 'controverso' | 'historia' | 'curiosidade';
  procedimento_id: string | null;
  objetivo_id: string | null;
  formato_id: string | null;
  palavras_chave: string[] | null;
  vezes_usado: number;
  performance_media: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Legenda {
  id: string;
  conteudo: string;
  tipo: 'abertura' | 'meio_eeat' | 'meio_viral' | 'meio_emocional' | 'fechamento';
  categoria: string | null;
  pilar: string | null;
  procedimento_id: string | null;
  palavras_chave: string[] | null;
  caracteres: number | null;
  vezes_usado: number;
  performance_media: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CTA {
  id: string;
  conteudo: string;
  categoria: 'salvamento' | 'comentario' | 'compartilhamento' | 'dm' | 'link';
  intensidade: 'suave' | 'medio' | 'direto';
  objetivo_id: string | null;
  formato_id: string | null;
  posicao: 'inicio' | 'final' | 'ambos' | null;
  vezes_usado: number;
  performance_media: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Hashtag {
  id: string;
  conteudo: string;
  categoria: string | null;
  alcance: 'pequena' | 'media' | 'grande';
  volume_posts: number | null;
  procedimento_id: string | null;
  is_shadowbanned: boolean;
  ultima_verificacao: string | null;
  is_active: boolean;
}

export interface HashtagCombo {
  id: string;
  nome: string;
  descricao: string | null;
  hashtags: string[];
  procedimento_id: string | null;
  objetivo_id: string | null;
  total_hashtags: number;
  vezes_usado: number;
  is_active: boolean;
}

export interface Roteiro {
  id: string;
  nome: string;
  descricao: string | null;
  formato_code: string;
  estrutura: {
    partes: string[];
  };
  exemplo: string | null;
  quando_usar: string | null;
  vezes_usado: number;
  is_active: boolean;
}

export interface Horario {
  id: string;
  horario: string;
  label: string | null;
  descricao: string | null;
  is_active: boolean;
}

export interface ChecklistItem {
  id: string;
  titulo: string;
  descricao: string | null;
  formato: string;
  fase: 'pre_producao' | 'gravacao' | 'edicao' | 'publicacao' | 'pos_publicacao';
  ordem: number;
  obrigatorio: boolean;
  dica: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Protocol {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  isactive: boolean;
  createdat: string;
  updatedat: string;
}
