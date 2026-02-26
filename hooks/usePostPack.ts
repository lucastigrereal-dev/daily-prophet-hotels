import { useState } from 'react';

interface PostPackState {
  formato: string | null;
  objetivo: string | null;
  procedimento: string | null;
  ideia: { id?: string; texto: string } | null;
  gancho: { id?: string; texto: string } | null;
  roteiro: any | null;
  legenda: string | null;
  cta: { id?: string; texto: string } | null;
  hashtags: string[];
  horario: string | null;
  observacao: string | null;
}

export function usePostPack() {
  const [state, setState] = useState<PostPackState>({
    formato: null,
    objetivo: null,
    procedimento: null,
    ideia: null,
    gancho: null,
    roteiro: null,
    legenda: null,
    cta: null,
    hashtags: [],
    horario: null,
    observacao: null,
  });

  const [etapaAtual, setEtapaAtual] = useState(1);
  const totalEtapas = 13;

  const setFormato = (formato: string) => setState(prev => ({ ...prev, formato }));
  const setObjetivo = (objetivo: string) => setState(prev => ({ ...prev, objetivo }));
  const setProcedimento = (procedimento: string) => setState(prev => ({ ...prev, procedimento }));
  const setIdeia = (ideia: PostPackState['ideia']) => setState(prev => ({ ...prev, ideia }));
  const setGancho = (gancho: PostPackState['gancho']) => setState(prev => ({ ...prev, gancho }));
  const setRoteiro = (roteiro: any) => setState(prev => ({ ...prev, roteiro }));
  const setLegenda = (legenda: string) => setState(prev => ({ ...prev, legenda }));
  const setCta = (cta: PostPackState['cta']) => setState(prev => ({ ...prev, cta }));
  const setHashtags = (hashtags: string[]) => setState(prev => ({ ...prev, hashtags }));
  const setHorario = (horario: string) => setState(prev => ({ ...prev, horario }));
  const setObservacao = (observacao: string) => setState(prev => ({ ...prev, observacao }));

  const avancar = () => setEtapaAtual(prev => Math.min(prev + 1, totalEtapas));
  const voltar = () => setEtapaAtual(prev => Math.max(prev - 1, 1));
  const irPara = (etapa: number) => setEtapaAtual(etapa);

  const reset = () => {
    setState({
      formato: null,
      objetivo: null,
      procedimento: null,
      ideia: null,
      gancho: null,
      roteiro: null,
      legenda: null,
      cta: null,
      hashtags: [],
      horario: null,
      observacao: null,
    });
    setEtapaAtual(1);
  };

  const podeAvancar = () => {
    switch (etapaAtual) {
      case 1: return !!state.formato;
      case 2: return !!state.objetivo;
      case 3: return !!state.procedimento;
      case 4: return !!state.ideia;
      case 5: return !!state.gancho;
      default: return true;
    }
  };

  return {
    state,
    etapaAtual,
    totalEtapas,
    setFormato,
    setObjetivo,
    setProcedimento,
    setIdeia,
    setGancho,
    setRoteiro,
    setLegenda,
    setCta,
    setHashtags,
    setHorario,
    setObservacao,
    avancar,
    voltar,
    irPara,
    reset,
    podeAvancar,
  };
}
