import { useState } from 'react';

interface ChecklistItem {
  id: string;
  titulo: string;
  marcado: boolean;
  obrigatorio: boolean;
}

export function useChecklist(items: ChecklistItem[]) {
  const [checklist, setChecklist] = useState(items);

  const toggle = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, marcado: !item.marcado } : item
    ));
  };

  const marcarTodos = () => {
    setChecklist(prev => prev.map(item => ({ ...item, marcado: true })));
  };

  const desmarcarTodos = () => {
    setChecklist(prev => prev.map(item => ({ ...item, marcado: false })));
  };

  const progresso = {
    total: checklist.length,
    marcados: checklist.filter(i => i.marcado).length,
    obrigatoriosFaltando: checklist.filter(i => i.obrigatorio && !i.marcado).length,
    percentual: Math.round((checklist.filter(i => i.marcado).length / checklist.length) * 100),
  };

  const podeContinuar = progresso.obrigatoriosFaltando === 0;

  return {
    checklist,
    toggle,
    marcarTodos,
    desmarcarTodos,
    progresso,
    podeContinuar,
  };
}
