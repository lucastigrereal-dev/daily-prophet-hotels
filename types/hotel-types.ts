// ============================================================
// DAILY PROPHET HOTELS — TypeScript Types
// ============================================================

export interface Hotel {
  id: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  nome: string;
  tipo: HotelTipo;
  classificacao: number | null;
  cidade: string;
  estado: string;
  regiao: string | null;
  instagram: string | null;
  site: string | null;
  whatsapp: string | null;
  status: HotelStatus;
  plano: string | null;
  valor_mensalidade: number | null;
  onboarding_completo: boolean;
  numero_quartos: number | null;
  ticket_medio_diaria: number | null;
}

export type HotelTipo =
  | "resort" | "pousada" | "boutique" | "fazenda"
  | "urbano" | "hostel" | "eco_resort" | "glamping" | "apart_hotel";

export type HotelStatus = "lead" | "onboarding" | "ativo" | "pausado" | "cancelado";

export interface HotelEstruturas {
  id: string;
  hotel_id: string;
  [key: string]: boolean | string | null;
}

export interface HotelPublico {
  id: string;
  hotel_id: string;
  familias_criancas_0_6: boolean;
  familias_criancas_7_12: boolean;
  casais_jovens: boolean;
  casais_lua_mel: boolean;
  grupos_amigos: boolean;
  viajantes_solo: boolean;
  executivos_negocios: boolean;
  encontra_instagram: number | null;
  encontra_google: number | null;
  encontra_booking: number | null;
  encontra_indicacao: number | null;
}

export interface HotelDigital {
  id: string;
  hotel_id: string;
  instagram_handle: string | null;
  instagram_seguidores: number | null;
  instagram_engajamento_medio: number | null;
  google_business_avaliacao: number | null;
  booking_nota: number | null;
  tripadvisor_nota: number | null;
}

export interface HotelPosicionamento {
  id: string;
  hotel_id: string;
  momento_uau: string | null;
  prato_estrela: string | null;
  case_sucesso_marcante: string | null;
  concorrente_direto: string | null;
}

export interface HotelMetas {
  id: string;
  hotel_id: string;
  meta_principal: string | null;
  principal_dor_hoje: string | null;
  investimento_mensal_marketing: number | null;
}

export interface Hook {
  id: string;
  numero: number;
  publico: HookPublico;
  intencao: HookIntencao;
  tema: string;
  hook: string;
}

export type HookPublico = "familia" | "casais" | "solo" | "corporativo" | "misto";
export type HookIntencao = "desejo" | "curiosidade" | "identificacao" | "urgencia" | "autoridade" | "prova_social";

export interface BenchmarkPost {
  id: string;
  hotel_origem: string | null;
  categoria_hotel: string | null;
  biblioteca_origem: string | null;
  numero_legenda: number | null;
  formato: "foto" | "carrossel" | "reel" | "story" | "video";
  publico: string | null;
  intencao: string | null;
  tema: string | null;
  hook: string | null;
  legenda_completa: string;
  cta: string | null;
  hashtags: string[] | null;
  roteiro_reel: object | null;
  duracao_segundos: number | null;
  melhor_horario: string | null;
  estrutura_necessaria: string[] | null;
  engagement_esperado: number | null;
}

export interface CalendarioPost {
  id: string;
  hotel_id: string;
  data_post: string;
  horario_sugerido: string | null;
  dia_semana: string | null;
  tipo: "feed" | "story" | "reel";
  categoria: string | null;
  objetivo: string | null;
  hook: string | null;
  legenda_completa: string | null;
  cta: string | null;
  hashtags: string[] | null;
  formato: string | null;
  status: PostStatus;
  likes_real: number | null;
  comentarios_real: number | null;
  tag_campanha: string | null;
}

export type PostStatus = "rascunho" | "agendado" | "aprovado" | "publicado" | "reprovado" | "expirado";

export interface Collab {
  id: string;
  hotel_id: string;
  tipo_pacote: string | null;
  valor_mensal: number | null;
  data_inicio: string;
  status: "ativo" | "pausado" | "cancelado" | "pendente_aprovacao";
  perfis_instagram: string[] | null;
  posts_mes_contratados: number | null;
  posts_realizados_mes_atual: number;
  status_pagamento: "em_dia" | "pendente" | "atrasado";
  hotel_nome?: string;
}

export interface PortfolioProfile {
  id: string;
  handle: string;
  nome: string;
  seguidores: number;
  nicho: string | null;
  quando_usar: string | null;
  cor: string | null;
}

export interface CaptionTemplate {
  id: string;
  nome: string;
  estrutura: string | null;
  objetivo: string | null;
  template_hook: string | null;
  template_legenda: string | null;
  template_cta: string | null;
  placeholders: string[] | null;
  instrucoes: string | null;
}

export interface KnowledgeBase {
  id: string;
  categoria: string;
  subcategoria: string | null;
  titulo: string;
  conteudo: string;
}

// Onboarding sections
export interface OnboardingData {
  secao_1_identificacao: {
    nome: string;
    tipo: HotelTipo;
    classificacao: number;
    cidade: string;
    estado: string;
    numero_quartos: number;
    tempo_operacao: number;
    ticket_medio: number;
  };
  secao_2_estrutura: Record<string, boolean>;
  secao_3_servicos: Record<string, boolean | string>;
  secao_4_digital: {
    instagram_handle: string;
    instagram_seguidores: number;
    instagram_quem_posta: string;
    facebook_url: string;
    tiktok_handle: string;
    tem_site: boolean;
    site_url: string;
    google_avaliacao: number;
    booking_nota: number;
  };
  secao_5_publico: {
    publicos: string[];
    origens: Record<string, number>;
    motivacoes: Record<string, number>;
    sazonalidade: string;
    descoberta: Record<string, number>;
  };
  secao_6_posicionamento: {
    posicionamentos: string[];
    concorrente: string;
    diferencial: string;
    momento_uau: string;
    prato_estrela: string;
    case_sucesso: string;
  };
  secao_7_metas: {
    meta_principal: string;
    crescimento: string;
    investimento: string;
    dor_principal: string;
    expectativa: string;
  };
}

// AI Generation
export interface AIGenerateRequest {
  hotel_id: string;
  categoria: string;
  objetivo: string;
  detalhes?: string;
  formato?: string;
}

export interface AIGenerateResponse {
  variacoes: {
    titulo: string;
    hook: string;
    legenda: string;
    cta: string;
    hashtags: string[];
    descricao_visual: string;
  }[];
}
