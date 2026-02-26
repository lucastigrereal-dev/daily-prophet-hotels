interface NotaInput {
  temHookForte: boolean;
  temEEAT: boolean;
  temCTAClaro: boolean;
  hashtagsMix: boolean;
  checklistCompleto: number;
  horarioOtimizado: boolean;
  roteiroSegueModelo: boolean;
}

interface Feedback {
  tipo: 'sucesso' | 'alerta' | 'erro';
  mensagem: string;
}

export function useNotaQualidade(input: NotaInput) {
  const calcularNota = (): number => {
    let nota = 0;

    if (input.temHookForte) nota += 1.0;
    if (input.temEEAT) nota += 1.0;
    if (input.temCTAClaro) nota += 0.75;
    if (input.hashtagsMix) nota += 0.5;
    nota += (input.checklistCompleto / 100) * 1.0;
    if (input.horarioOtimizado) nota += 0.25;
    if (input.roteiroSegueModelo) nota += 0.5;

    return Math.min(nota, 5);
  };

  const gerarFeedbacks = (): Feedback[] => {
    const feedbacks: Feedback[] = [];

    if (input.temHookForte) {
      feedbacks.push({ tipo: 'sucesso', mensagem: 'Hook forte' });
    } else {
      feedbacks.push({ tipo: 'erro', mensagem: 'Hook precisa de pergunta/estatistica/controversia' });
    }

    if (input.temEEAT) {
      feedbacks.push({ tipo: 'sucesso', mensagem: 'E-E-A-T presente' });
    } else {
      feedbacks.push({ tipo: 'erro', mensagem: 'Adicione trechos de autoridade (E-E-A-T)' });
    }

    if (input.temCTAClaro) {
      feedbacks.push({ tipo: 'sucesso', mensagem: 'CTA claro' });
    } else {
      feedbacks.push({ tipo: 'alerta', mensagem: 'CTA poderia ser mais direto' });
    }

    return feedbacks;
  };

  return {
    nota: calcularNota(),
    feedbacks: gerarFeedbacks(),
    nivel: calcularNota() >= 4 ? 'excelente' : calcularNota() >= 3 ? 'bom' : 'precisa_melhorar',
  };
}
