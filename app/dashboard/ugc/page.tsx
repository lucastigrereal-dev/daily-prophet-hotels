'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const BOAS_PRATICAS = [
  { titulo: 'Monitore menções diariamente', desc: 'Verifique @menções e tags de localização todo dia às 9h', icon: '🔍' },
  { titulo: 'Peça permissão ANTES de repostar', desc: 'Envie DM padronizada pedindo autorização por escrito', icon: '📩' },
  { titulo: 'Dê créditos visíveis', desc: 'Marque o autor na foto, legenda e stories — sempre', icon: '🏷️' },
  { titulo: 'Agradeça publicamente', desc: 'Responda o post original com comentário e emoji', icon: '❤️' },
  { titulo: 'Adapte a legenda', desc: 'Reescreva com a voz do hotel mantendo a autenticidade', icon: '✍️' },
  { titulo: 'Incentive mais UGC', desc: 'Crie hashtag própria e plaquinha no quarto', icon: '📸' },
]

const TEMPLATES_PERMISSAO = [
  {
    titulo: 'Pedido de Permissão (DM)',
    texto: `Olá [NOME]! 😊

Amamos sua foto no nosso hotel! Ficou incrível! ✨

Gostaríamos muito de compartilhar essa imagem no nosso perfil oficial, com todos os créditos para você. 📸

Você nos autoriza a repostar? Prometemos dar destaque ao seu @ e marcar você! 💛

Muito obrigado pela hospedagem e pela foto linda! 🏨`,
  },
  {
    titulo: 'Legenda de Repost',
    texto: `📸 Quando nossos hóspedes registram momentos assim, sabemos que estamos no caminho certo! ✨

Obrigado @[USUARIO] por compartilhar essa experiência incrível! 💛

Quer aparecer no nosso feed? Use a hashtag #[HOTEL] nas suas fotos! 📲

#ugc #repost #hospede #experiencia #hotelaria`,
  },
  {
    titulo: 'Comentário de Agradecimento',
    texto: `Que foto MARAVILHOSA! 😍✨ Ficamos muito felizes que você aproveitou cada momento! Obrigado por compartilhar essa memória linda com a gente! 💛🏨 Esperamos você de volta em breve!`,
  },
]

const UGC_STATS = {
  engajamento_ugc: '4.5%',
  engajamento_proprio: '1.2%',
  multiplicador: '3.75x',
  economia_conteudo: 'R$ 500-1.500/mês',
}

export default function UGCPage() {
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast.success('Texto copiado!')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Repost Automático de UGC</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Detecta menções + pede permissão + reposta com créditos — +60% engajamento</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Engajamento UGC</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{UGC_STATS.engajamento_ugc}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">média de engajamento</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Próprio</p>
          <p className="text-3xl font-bold text-[#6B7280] mt-1">{UGC_STATS.engajamento_proprio}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">conteúdo próprio</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Multiplicador</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{UGC_STATS.multiplicador}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">UGC vs próprio</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Economia</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">R$1k</p>
          <p className="text-xs text-[#9CA3AF] mt-1">/mês em conteúdo</p>
        </div>
      </div>

      {/* Boas práticas */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Checklist de Boas Práticas UGC</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOAS_PRATICAS.map((bp, idx) => (
            <div key={idx} className="flex gap-3 bg-[#FAFBFC] rounded-xl p-3">
              <span className="text-2xl">{bp.icon}</span>
              <div>
                <p className="text-sm font-medium text-[#1A1D26]">{bp.titulo}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">{bp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Templates de UGC */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Templates Prontos</h2>
        <div className="space-y-3">
          {TEMPLATES_PERMISSAO.map((tmpl, idx) => (
            <div key={idx} className="bg-[#FAFBFC] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTemplate(expandedTemplate === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-[#F3F4F6] transition-colors"
              >
                <p className="font-medium text-[#1A1D26]">{tmpl.titulo}</p>
                <div className="w-3 h-3 border-r-2 border-b-2 border-[#9CA3AF]" style={{ transform: expandedTemplate === idx ? 'rotate(-135deg)' : 'rotate(45deg)' }} />
              </button>
              {expandedTemplate === idx && (
                <div className="px-4 pb-4">
                  <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-lg p-3 border border-[#E5E7EB]">{tmpl.texto}</pre>
                  <button onClick={() => copiar(tmpl.texto)} className="mt-2 px-3 py-1.5 bg-[#B8860B] text-white text-xs font-medium rounded-lg hover:bg-[#9A7209]">📋 Copiar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
