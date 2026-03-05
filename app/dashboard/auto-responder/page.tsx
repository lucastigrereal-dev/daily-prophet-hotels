'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Hotel {
  id: string
  nome: string
  cidade: string
  estado: string
  estrelas: number
}

const DM_CENARIOS = [
  {
    id: 'reserva',
    titulo: 'Pedido de Reserva',
    emoji: '🏨',
    cor: '#B8860B',
    exemplo: 'Oi! Queria fazer uma reserva para o feriado...',
    resposta: (h: Hotel) =>
      `Olá! 😊 Que alegria seu interesse no ${h.nome}! ✨\n\nTemos disponibilidade sim! Para garantir a melhor tarifa:\n\n📅 Qual período desejado?\n👥 Quantos hóspedes?\n🛏️ Preferência de quarto?\n\nAssim consigo preparar uma proposta especial para você! 💛\n\nOu se preferir, reserve direto pelo nosso link: [link bio]`,
  },
  {
    id: 'preco',
    titulo: 'Consulta de Preço',
    emoji: '💰',
    cor: '#059669',
    exemplo: 'Quanto custa a diária?',
    resposta: (h: Hotel) =>
      `Oi! 😊 Obrigado pelo interesse no ${h.nome}!\n\nNossas diárias variam conforme o período e tipo de acomodação:\n\n🏷️ A partir de R$ XXX (temporada regular)\n⭐ Suítes premium a partir de R$ XXX\n🎁 Pacotes especiais para estadias +3 noites\n\nQual período você está pensando? Assim envio o valor exato com condições especiais! 💛`,
  },
  {
    id: 'disponibilidade',
    titulo: 'Verificar Disponibilidade',
    emoji: '📅',
    cor: '#2563EB',
    exemplo: 'Vocês têm vaga pro Carnaval?',
    resposta: (h: Hotel) =>
      `Olá! 🎉 O ${h.nome} é perfeito para o Carnaval!\n\nVou verificar a disponibilidade agora mesmo. Para agilizar:\n\n📅 Quais datas exatas?\n👥 Quantas pessoas?\n🏊 Alguma preferência especial?\n\nDica: nossas vagas para feriados esgotam rápido! Posso segurar uma pré-reserva por 24h enquanto decide 😉💛`,
  },
  {
    id: 'reclamacao',
    titulo: 'Reclamação',
    emoji: '😟',
    cor: '#DC2626',
    exemplo: 'O quarto não estava limpo quando cheguei...',
    resposta: (h: Hotel) =>
      `Olá! Sentimos muito por essa experiência 😔\n\nIsso não reflete o padrão do ${h.nome} e levamos muito a sério seu feedback.\n\n🔧 Já estou acionando nossa equipe para resolver imediatamente\n📞 Nosso gerente vai entrar em contato em até 30 minutos\n🎁 Gostaríamos de compensar esse transtorno\n\nPode me passar seu nome completo e número do quarto? Vamos resolver agora! 💛`,
  },
  {
    id: 'elogio',
    titulo: 'Elogio / Feedback Positivo',
    emoji: '⭐',
    cor: '#7C3AED',
    exemplo: 'Amei a estadia! Tudo perfeito!',
    resposta: (h: Hotel) =>
      `Que mensagem maravilhosa! 🥰✨\n\nFicamos MUITO felizes que sua experiência no ${h.nome} foi especial! É pra isso que trabalhamos todos os dias 💛\n\nSe puder, adoraríamos:\n⭐ Uma avaliação no Google (link)\n📸 Compartilhar suas fotos marcando @${h.nome.toLowerCase().replace(/\s+/g, '')}\n🔄 Voltar em breve com desconto especial de hóspede VIP!\n\nAté a próxima! 🏨✨`,
  },
  {
    id: 'parceria',
    titulo: 'Proposta de Parceria',
    emoji: '🤝',
    cor: '#0891B2',
    exemplo: 'Sou influenciadora, podemos fazer uma parceria?',
    resposta: (h: Hotel) =>
      `Olá! 😊 Que legal seu interesse em uma parceria com o ${h.nome}!\n\nAdoramos trabalhar com criadores de conteúdo! Para avaliarmos:\n\n📊 Qual seu @perfil e número de seguidores?\n🎯 Qual seu nicho principal?\n📸 Que tipo de conteúdo propõe?\n📅 Tem datas em mente?\n\nEnvie essas infos que nossa equipe de marketing analisa em até 48h! 🤝💛`,
  },
]

export default function AutoResponderPage() {
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('hotels')
        .select('id, nome, cidade, estado, estrelas')
        .order('nome')
      setHotels(data || [])
      if (data && data.length > 0) setSelectedHotel(data[0])
      setLoading(false)
    }
    load()
  }, [])

  function copiar(texto: string) {
    navigator.clipboard.writeText(texto)
    toast.success('Resposta copiada!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Auto-Responder DMs com IA</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Templates inteligentes de resposta para DMs do Instagram</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Cenários</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">6</p>
          <p className="text-xs text-[#9CA3AF] mt-1">tipos de DM cobertos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Tempo Resposta</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">&lt;30s</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com templates prontos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Conversão</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">60%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">DM → Reserva esperado</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hotéis</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">{hotels.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">personalizáveis</p>
        </div>
      </div>

      {/* Hotel selector */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <label className="text-sm font-medium text-[#1A1D26] block mb-2">Personalizar respostas para:</label>
        <select
          className="w-full lg:w-72 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white"
          value={selectedHotel?.id || ''}
          onChange={(e) => setSelectedHotel(hotels.find(h => h.id === e.target.value) || null)}
        >
          {hotels.map(h => (
            <option key={h.id} value={h.id}>
              {h.nome} — {h.cidade}/{h.estado}
            </option>
          ))}
        </select>
      </div>

      {/* DM Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {DM_CENARIOS.map((cenario) => {
          const isExpanded = expandedId === cenario.id
          const resposta = selectedHotel ? cenario.resposta(selectedHotel) : ''
          return (
            <div key={cenario.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : cenario.id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-[#FAFBFC] transition-colors"
              >
                <span className="text-2xl">{cenario.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1D26]">{cenario.titulo}</p>
                  <p className="text-xs text-[#9CA3AF] italic mt-0.5">&ldquo;{cenario.exemplo}&rdquo;</p>
                </div>
                <div className="w-3 h-3 border-r-2 border-b-2 border-[#9CA3AF] transition-transform"
                  style={{ transform: isExpanded ? 'rotate(-135deg)' : 'rotate(45deg)' }} />
              </button>
              {isExpanded && selectedHotel && (
                <div className="px-4 pb-4 border-t border-[#F3F4F6]">
                  <div className="mt-3 bg-[#FAFBFC] rounded-xl p-4">
                    <p className="text-xs font-medium text-[#9CA3AF] uppercase mb-2">Resposta sugerida:</p>
                    <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed">{resposta}</pre>
                  </div>
                  <button
                    onClick={() => copiar(resposta)}
                    className="mt-3 px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#9A7209] transition-colors"
                  >
                    📋 Copiar Resposta
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
