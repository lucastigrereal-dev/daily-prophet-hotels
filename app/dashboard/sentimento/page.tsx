'use client'

import { useState } from 'react'

const SENTIMENTO_GERAL = {
  positivo: 72,
  neutro: 18,
  negativo: 10,
  tendencia: 'estavel',
}

const CATEGORIAS = [
  { nome: 'Atendimento', positivo: 85, neutro: 10, negativo: 5, palavras: ['simpático', 'prestativo', 'rápido', 'atencioso'] },
  { nome: 'Limpeza', positivo: 78, neutro: 12, negativo: 10, palavras: ['limpo', 'impecável', 'organizado', 'cheiroso'] },
  { nome: 'Localização', positivo: 90, neutro: 8, negativo: 2, palavras: ['bem localizado', 'perto', 'vista', 'acesso'] },
  { nome: 'Preço', positivo: 55, neutro: 25, negativo: 20, palavras: ['justo', 'caro', 'custo-benefício', 'vale'] },
  { nome: 'Café da Manhã', positivo: 70, neutro: 15, negativo: 15, palavras: ['variedade', 'delicioso', 'fresco', 'faltou'] },
  { nome: 'Infraestrutura', positivo: 65, neutro: 20, negativo: 15, palavras: ['piscina', 'wifi', 'estacionamento', 'antigo'] },
]

const ALERTAS_SENTIMENTO = [
  { msg: 'Sentimento sobre "preço" caiu 8% esta semana', tipo: 'negativo', data: 'Hoje' },
  { msg: 'Menções positivas sobre "atendimento" subiram 12%', tipo: 'positivo', data: 'Ontem' },
  { msg: '"Café da manhã" teve 3 menções negativas seguidas', tipo: 'negativo', data: '2 dias atrás' },
]

const NUVEM_PALAVRAS = [
  { palavra: 'incrível', freq: 45, sentimento: 'positivo' },
  { palavra: 'vista linda', freq: 38, sentimento: 'positivo' },
  { palavra: 'recomendo', freq: 35, sentimento: 'positivo' },
  { palavra: 'aconchegante', freq: 30, sentimento: 'positivo' },
  { palavra: 'limpo', freq: 28, sentimento: 'positivo' },
  { palavra: 'atencioso', freq: 25, sentimento: 'positivo' },
  { palavra: 'caro', freq: 20, sentimento: 'negativo' },
  { palavra: 'barulho', freq: 15, sentimento: 'negativo' },
  { palavra: 'wifi ruim', freq: 12, sentimento: 'negativo' },
  { palavra: 'ok', freq: 18, sentimento: 'neutro' },
  { palavra: 'razoável', freq: 14, sentimento: 'neutro' },
  { palavra: 'esperava mais', freq: 10, sentimento: 'negativo' },
]

export default function SentimentoPage() {
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)

  const selected = CATEGORIAS.find(c => c.nome === selectedCategoria)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Analisador de Sentimento</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">NLP em comentários e reviews — 6 categorias + alertas em tempo real</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Positivo</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{SENTIMENTO_GERAL.positivo}%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">dos comentários</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Neutro</p>
          <p className="text-3xl font-bold text-[#6B7280] mt-1">{SENTIMENTO_GERAL.neutro}%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">sem polaridade</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Negativo</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{SENTIMENTO_GERAL.negativo}%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">requer atenção</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Tendência</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{SENTIMENTO_GERAL.tendencia === 'subindo' ? '📈' : SENTIMENTO_GERAL.tendencia === 'descendo' ? '📉' : '➡️'}</p>
          <p className="text-xs text-[#9CA3AF] mt-1 capitalize">{SENTIMENTO_GERAL.tendencia}</p>
        </div>
      </div>

      {/* Barra de sentimento geral */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-3">Distribuição Geral de Sentimento</h2>
        <div className="flex h-6 rounded-full overflow-hidden">
          <div className="bg-emerald-500 transition-all" style={{ width: `${SENTIMENTO_GERAL.positivo}%` }} />
          <div className="bg-gray-300 transition-all" style={{ width: `${SENTIMENTO_GERAL.neutro}%` }} />
          <div className="bg-red-500 transition-all" style={{ width: `${SENTIMENTO_GERAL.negativo}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#6B7280]">
          <span>Positivo {SENTIMENTO_GERAL.positivo}%</span>
          <span>Neutro {SENTIMENTO_GERAL.neutro}%</span>
          <span>Negativo {SENTIMENTO_GERAL.negativo}%</span>
        </div>
      </div>

      {/* Categorias */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Sentimento por Categoria</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIAS.map(cat => {
            const isSelected = selectedCategoria === cat.nome
            return (
              <button
                key={cat.nome}
                onClick={() => setSelectedCategoria(isSelected ? null : cat.nome)}
                className={`text-left rounded-xl p-4 transition-all ${
                  isSelected ? 'bg-[#FFF8E7] border-2 border-[#B8860B]' : 'bg-[#FAFBFC] hover:bg-[#F3F4F6] border border-transparent'
                }`}
              >
                <p className="font-semibold text-[#1A1D26] text-sm">{cat.nome}</p>
                <div className="flex h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500" style={{ width: `${cat.positivo}%` }} />
                  <div className="bg-gray-300" style={{ width: `${cat.neutro}%` }} />
                  <div className="bg-red-500" style={{ width: `${cat.negativo}%` }} />
                </div>
                <p className="text-xs text-emerald-700 mt-1">{cat.positivo}% positivo</p>
              </button>
            )
          })}
        </div>
        {selected && (
          <div className="mt-4 bg-[#FAFBFC] rounded-xl p-4">
            <p className="text-sm font-medium text-[#1A1D26] mb-2">{selected.nome} — Palavras Frequentes:</p>
            <div className="flex flex-wrap gap-2">
              {selected.palavras.map(p => (
                <span key={p} className="text-xs bg-white border border-[#E5E7EB] px-3 py-1 rounded-full text-[#6B7280]">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nuvem de palavras */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Palavras Mais Frequentes</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {NUVEM_PALAVRAS.sort((a, b) => b.freq - a.freq).map(w => (
            <span
              key={w.palavra}
              className={`px-3 py-1.5 rounded-full font-medium ${
                w.sentimento === 'positivo' ? 'bg-emerald-50 text-emerald-700' :
                w.sentimento === 'negativo' ? 'bg-red-50 text-red-700' :
                'bg-[#F3F4F6] text-[#6B7280]'
              }`}
              style={{ fontSize: `${Math.max(12, Math.min(20, w.freq / 3 + 8))}px` }}
            >
              {w.palavra}
            </span>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Alertas de Sentimento</h2>
        <div className="space-y-2">
          {ALERTAS_SENTIMENTO.map((alerta, idx) => (
            <div key={idx} className={`flex items-center gap-3 rounded-xl p-3 ${
              alerta.tipo === 'negativo' ? 'bg-red-50 border-l-4 border-l-red-500' : 'bg-emerald-50 border-l-4 border-l-emerald-500'
            }`}>
              <span className="text-lg">{alerta.tipo === 'negativo' ? '⚠️' : '✅'}</span>
              <p className="text-sm text-[#1A1D26] flex-1">{alerta.msg}</p>
              <span className="text-xs text-[#9CA3AF]">{alerta.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
