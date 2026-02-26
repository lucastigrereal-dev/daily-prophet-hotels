// types/ui.ts
// Tipos para componentes UI

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface FilterState {
  formato?: string;
  objetivo?: string;
  procedimento?: string;
  tipo?: string;
  categoria?: string;
  alcance?: string;
}

export interface NotaFeedback {
  tipo: 'sucesso' | 'alerta' | 'erro';
  mensagem: string;
}

export interface NotaQualidade {
  nota: number;
  feedbacks: NotaFeedback[];
  nivel: 'excelente' | 'muito_bom' | 'bom' | 'precisa_melhorar' | 'revisar';
}

export interface EtapaConfig {
  numero: number;
  nome: string;
  descricao: string;
  obrigatoria: boolean;
  formatosAplicaveis: string[]; // ['reels', 'carrossel', 'stories', 'foto']
}
