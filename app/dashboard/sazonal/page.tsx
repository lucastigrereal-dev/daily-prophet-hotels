'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KBEntry {
  id: string
  titulo: string
  conteudo: Record<string, unknown>
  categoria: string
}

const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

interface DatasKey {
  data: string
  tema: string
  dica: string
}

const CALENDARIO_ESTATICO: Record<number, { resumo: string; datas: DatasKey[] }> = {
  0:  { resumo: 'Alta temporada, verão, virada do ano ainda em vigor. Foco em experiência, relaxamento e memórias.', datas: [{ data: '01/01', tema: 'Ano Novo', dica: 'Post de boas-vindas ao novo ano com foto da área de lazer' }, { data: '20/01', tema: 'Férias de Verão', dica: 'Destaque pacotes de verão e diárias especiais' }] },
  1:  { resumo: 'Carnaval = pico de reservas. Publique fantasias, decoração e festa. Valentine BR = 12/06.', datas: [{ data: 'Fev', tema: 'Carnaval', dica: 'Posts com decoração, festa e experiência do hóspede' }, { data: '14/02', tema: 'Dia dos Namorados (EUA)', dica: 'Se seu público é estrangeiro, crie oferta especial' }] },
  2:  { resumo: 'Semana Santa (datas variam). Foco em família, paz e natureza. Ótimo para pousadas e fazendas.', datas: [{ data: 'Mar/Abr', tema: 'Semana Santa', dica: 'Pacotes para casais e famílias, cardápio de Páscoa' }, { data: '08/03', tema: 'Dia da Mulher', dica: 'Pacotes especiais para mulheres — spa, brunch, retiro' }] },
  3:  { resumo: 'Páscoa + férias escolares curtas. Destaque atividades para crianças e experiências gastronômicas.', datas: [{ data: 'Abr', tema: 'Páscoa', dica: 'Caça ao ovo, café da manhã especial, decoração temática' }, { data: '21/04', tema: 'Tiradentes', dica: 'Feriado prolongado — post de escapada e pacote fim de semana' }] },
  4:  { resumo: 'Dia das Mães = segunda data mais comercializada do Brasil. Crie experiências memoráveis.', datas: [{ data: '2ª Dom', tema: 'Dia das Mães', dica: 'Café da manhã na cama, passeios, pacote mãe e filho/a' }, { data: '01/05', tema: 'Dia do Trabalho', dica: 'Feriado prolongado — "mereça um descanso" na copy' }] },
  5:  { resumo: 'Dia dos Namorados (12/06) + Festa Junina. Alta procura por pacotes românticos.', datas: [{ data: '12/06', tema: 'Dia dos Namorados', dica: 'Jantar à luz de velas, decoração, chocolates, suite especial' }, { data: 'Jun', tema: 'Festa Junina', dica: 'Decoração caipira, comidas típicas, fogueira se possível' }] },
  6:  { resumo: 'Férias de Julho = maior pico de família com crianças. Pacotes all-inclusive e atividades kids.', datas: [{ data: 'Jul', tema: 'Férias Escolares', dica: 'Destaque kids club, piscina, entretenimento. Parece caro, mas a família está pronta pra pagar' }] },
  7:  { resumo: 'Dia dos Pais + baixa temporada. Bom para promoções e pacotes de aventura/esporte.', datas: [{ data: '2ª Dom', tema: 'Dia dos Pais', dica: 'Experiências ao ar livre, trilha, pesca, aventura' }, { data: 'Ago', tema: 'Baixa Temporada', dica: 'Oferta de baixa + "tranquilidade garantida, sem multidão"' }] },
  8:  { resumo: 'Início da primavera. Natureza, flores, casamentos. Ótimo para eco resorts e pousadas de charme.', datas: [{ data: '22/09', tema: 'Primavera', dica: 'Fotos da natureza em flor, ar puro, trilhas — natureza como diferencial' }, { data: '07/09', tema: 'Independência', dica: 'Feriado prolongado — pacote de fuga da cidade' }] },
  9:  { resumo: 'Dia das Crianças (12/10) + feriados prolongados. Familiar e lazer são os focos.', datas: [{ data: '12/10', tema: 'Dia das Crianças', dica: 'Surpresa para kids, atividades especiais, presente de viagem' }, { data: '02/11', tema: 'Finados', dica: 'Feriado prolongado — escapada de descanso' }] },
  10: { resumo: 'Pré-Natal + Black Friday. Promoções de antecipação de férias de dezembro.', datas: [{ data: '15/11', tema: 'Proclamação da República', dica: 'Feriado prolongado — pacote especial de novembro' }, { data: 'Nov', tema: 'Black Friday', dica: 'Oferta relâmpago para reservas antecipadas de dezembro/janeiro' }] },
  11: { resumo: 'Natal + Réveillon = meses mais valorizados do ano. Reserve com antecedência de 60+ dias.', datas: [{ data: '25/12', tema: 'Natal', dica: 'Ceia especial, decoração natalina, presença de Papai Noel' }, { data: '31/12', tema: 'Réveillon', dica: 'Contagem regressiva, fogos, festa, ceia de ano-novo' }] },
}

const MESES_CORES = [
  'border-l-blue-500', 'border-l-pink-500', 'border-l-purple-500',
  'border-l-emerald-500', 'border-l-green-600', 'border-l-yellow-500',
  'border-l-orange-500', 'border-l-red-500', 'border-l-amber-600',
  'border-l-teal-500', 'border-l-indigo-500', 'border-l-rose-500',
]

export default function SazonalPage() {
  const [loading, setLoading] = useState(true)
  const [sazonalidade, setSazonalidade] = useState<KBEntry[]>([])
  const [campanhas, setCampanhas] = useState<KBEntry[]>([])
  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth())
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: saz }, { data: camp }] = await Promise.all([
        supabase.from('knowledge_base').select('*').eq('categoria', 'sazonalidade').order('titulo'),
        supabase.from('knowledge_base').select('*').eq('categoria', 'templates_campanha').order('titulo'),
      ])
      setSazonalidade(saz || [])
      setCampanhas(camp || [])
      setLoading(false)
    }
    load()
  }, [])

  const mesAtual = new Date().getMonth()
  const proximosMeses = [mesAtual, (mesAtual + 1) % 12, (mesAtual + 2) % 12]

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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Planejador Sazonal Inteligente</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">200+ datas comemorativas com conteúdo automático 7 dias antes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Meses Mapeados</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{sazonalidade.length || 12}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">com temas e datas</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Campanhas</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">{campanhas.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">templates prontos</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Mês Atual</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{MESES_NOMES[mesAtual].slice(0, 3)}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">{MESES_NOMES[mesAtual]} 2026</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Aproveitamento</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">100%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">vs 20% sem planejamento</p>
        </div>
      </div>

      {/* Calendário de meses */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Calendário Anual de Sazonalidade</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {MESES_NOMES.map((nome, idx) => (
            <button
              key={nome}
              onClick={() => setMesAtivo(idx)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mesAtivo === idx
                  ? 'bg-[#B8860B] text-white'
                  : proximosMeses.includes(idx)
                    ? 'bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/20'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {nome.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Detalhe do mês selecionado */}
        {(() => {
          const kbDoMes = sazonalidade.filter(s => s.titulo.toLowerCase().includes(MESES_NOMES[mesAtivo].toLowerCase().slice(0, 3)))
          const estatico = CALENDARIO_ESTATICO[mesAtivo]
          if (kbDoMes.length > 0) {
            return (
              <div className="space-y-3">
                {kbDoMes.map(s => (
                  <div key={s.id} className={`border-l-4 ${MESES_CORES[mesAtivo]} bg-[#FAFBFC] rounded-r-xl p-4`}>
                    <p className="font-semibold text-[#1A1D26]">{s.titulo}</p>
                    <div className="mt-2 text-sm text-[#6B7280]">
                      {typeof s.conteudo === 'object' && s.conteudo !== null ? (
                        <div className="space-y-1">
                          {Object.entries(s.conteudo).map(([key, val]) => (
                            <div key={key}>
                              <span className="font-medium text-[#1A1D26] capitalize">{key.replace(/_/g, ' ')}: </span>
                              <span>{typeof val === 'string' ? val : JSON.stringify(val)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{JSON.stringify(s.conteudo)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
          if (estatico) {
            return (
              <div className="space-y-3">
                <div className={`border-l-4 ${MESES_CORES[mesAtivo]} bg-[#FAFBFC] rounded-r-xl p-4`}>
                  <p className="font-semibold text-[#1A1D26]">{MESES_NOMES[mesAtivo]} — Panorama Geral</p>
                  <p className="text-sm text-[#6B7280] mt-1">{estatico.resumo}</p>
                </div>
                {estatico.datas.map((d, i) => (
                  <div key={i} className={`border-l-4 ${MESES_CORES[mesAtivo]} bg-white border border-[#E5E7EB] rounded-r-xl p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-[#FFF8E7] text-[#B8860B] rounded-full font-medium">{d.data}</span>
                      <span className="text-sm font-semibold text-[#1A1D26]">{d.tema}</span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{d.dica}</p>
                  </div>
                ))}
              </div>
            )
          }
          return <p className="text-sm text-[#9CA3AF] italic">Dados para {MESES_NOMES[mesAtivo]} em breve.</p>
        })()}
      </div>

      {/* Templates de Campanha */}
      {campanhas.length > 0 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">Templates de Campanha ({campanhas.length})</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {campanhas.map(c => (
              <div key={c.id} className="bg-[#FAFBFC] rounded-xl p-4">
                <p className="font-medium text-[#1A1D26]">{c.titulo}</p>
                <div className="mt-2 text-sm text-[#6B7280]">
                  {typeof c.conteudo === 'object' && c.conteudo !== null ? (
                    Object.entries(c.conteudo).slice(0, 5).map(([key, val]) => (
                      <p key={key}><span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>{typeof val === 'string' ? val : JSON.stringify(val)}</p>
                    ))
                  ) : (
                    <p>{JSON.stringify(c.conteudo).slice(0, 200)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
