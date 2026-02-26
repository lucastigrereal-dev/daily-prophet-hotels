export interface ProgressBarProps {
  etapaAtual: number;
  totalEtapas: number;
  etapas: string[];
}

export function ProgressBar({ etapaAtual, totalEtapas, etapas }: ProgressBarProps) {
  const total = totalEtapas || etapas.length || 1;
  const atual = Math.min(Math.max(etapaAtual, 1), total);
  const progresso = Math.round((atual / total) * 100);

  return (
    <div className="w-full space-y-2">
      {etapas.length > 0 && (
        <div className="flex justify-between text-xs text-gray-400">
          {etapas.map((etapa, index) => (
            <span key={etapa} className={index + 1 <= atual ? 'text-blue-300' : ''}>
              {etapa}
            </span>
          ))}
        </div>
      )}
      <div className="h-2 w-full rounded bg-gray-800">
        <div className="h-2 rounded bg-blue-500 transition-all" style={{ width: `${progresso}%` }} />
      </div>
      <div className="text-xs text-gray-400">
        Etapa {atual} de {total}
      </div>
    </div>
  );
}
