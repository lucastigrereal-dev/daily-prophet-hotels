// types/postpack.ts
// Tipos relacionados ao PostPack

export interface PostPack {
  id: string;
  titulo: string;
  descricao: string | null;
  norte_mes_id: string | null;
  objetivo_id: string | null;
  formato_id: string | null;
  procedimento_id: string | null;
  ideia_id: string | null;
  ideia_livre: string | null;
  gancho_id: string | null;
  gancho_editado: string | null;
  roteiro_id: string | null;
  roteiro_conteudo: any | null;
  legenda_final: string | null;
  cta_id: string | null;
  cta_editado: string | null;
  hashtags: string[] | null;
  horario_id: string | null;
  status: 'rascunho' | 'pronto' | 'publicado' | 'arquivado';
  nota_qualidade: number | null;
  observacao_usuario: string | null;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
}

export interface PostPackChecklist {
  id: string;
  postpack_id: string;
  checklist_item_id: string;
  marcado: boolean;
  marcado_at: string | null;
  observacao: string | null;
}

export interface PostPackMetricas {
  id: string;
  postpack_id: string;
  instagram_url: string | null;
  views: number | null;
  likes: number | null;
  saves: number | null;
  shares: number | null;
  comments: number | null;
  reach: number | null;
  impressions: number | null;
  profile_visits: number | null;
  follows: number | null;
  medido_em: '24h' | '48h' | '7d';
  aprendizado: string | null;
  created_at: string;
}
