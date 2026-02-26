'use client';

import { useState } from 'react';

export interface CopyButtonProps {
  texto: string;
  label?: string;
}

export function CopyButton({ texto, label = 'Copiar' }: CopyButtonProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700"
    >
      {copiado ? '✅ Copiado!' : label}
    </button>
  );
}
