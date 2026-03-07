'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CaptionTemplate {
  id: string
  nome: string
  descricao: string
  estrutura: string
  objetivo: string
}

interface Hook {
  id: string
  hook: string
  tema: string
}

export default function VoiceCaptionPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<CaptionTemplate[]>([])
  const [hooks, setHooks] = useState<Hook[]>([])
  const [textoInput, setTextoInput] = useState('')
  const [templateSel, setTemplateSel] = useState('')
  const [legendaGerada, setLegendaGerada] = useState('')
  const [gerando, setGerando] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: tmpl }, { data: hks }] = await Promise.all([
        supabase.from('caption_templates').select('id, nome, descricao, estrutura, objetivo').order('nome'),
        supabase.from('hooks').select('id, hook, tema').limit(20),
      ])
      setTemplates(tmpl || [])
      setHooks(hks || [])
      if (tmpl && tmpl.length > 0) setTemplateSel(tmpl[0].id)
      setLoading(false)
    }
    load()
  }, [])

  function gerarLegenda() {
    if (!textoInput.trim()) {
      toast.error('Digite ou cole seu texto/áudio transcrito')
      return
    }
    setGerando(true)
    const tmpl = templates.find(t => t.id === templateSel)
    const hookAleatorio = hooks[Math.floor(Math.random() * hooks.length)]

    setTimeout(() => {
      const legenda = `${hookAleatorio?.hook || '✨ Descubra!'}\n\n${textoInput.trim()}\n\n${tmpl ? `📌 Framework: ${tmpl.nome}\n` : ''}💬 Salve esse post para não perder!\n\n#hotelaria #turismo #viagem #hospedagem #brasil`
      setLegendaGerada(legenda)
      setGerando(false)
      toast.success('Legenda gerada!')
    }, 1500)
  }

  function copiar() {
    navigator.clipboard.writeText(legendaGerada)
    toast.success('Legenda copiada!')
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
        <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Voice-to-Caption</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Transforme áudio ou texto bruto em legendas profissionais em 2 minutos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Frameworks</p>
          <p className="text-3xl font-bold text-[#B8860B] mt-1">{templates.length}</p>
          <p className="text-xs text-[#9CA3AF] mt-1">modelos de legenda</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Hooks</p>
          <p className="text-3xl font-bold text-emerald-700 mt-1">1.000+</p>
          <p className="text-xs text-[#9CA3AF] mt-1">aberturas disponíveis</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Economia</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">93%</p>
          <p className="text-xs text-[#9CA3AF] mt-1">mais rápido (30min → 2min)</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wide font-medium">Formato</p>
          <p className="text-3xl font-bold text-[#1A1D26] mt-1">🎙️</p>
          <p className="text-xs text-[#9CA3AF] mt-1">áudio ou texto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">1. Cole seu texto ou transcrição</h2>
          <textarea
            value={textoInput}
            onChange={(e) => setTextoInput(e.target.value)}
            placeholder="Cole aqui o texto bruto, transcrição de áudio, ou suas ideias soltas..."
            className="w-full h-40 border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1A1D26] placeholder-[#9CA3AF] resize-none focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]"
          />

          <h2 className="font-semibold text-[#1A1D26] mt-4 mb-2">2. Escolha o framework</h2>
          <select
            value={templateSel}
            onChange={(e) => setTemplateSel(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A1D26] bg-white"
          >
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.nome} — {t.objetivo}</option>
            ))}
          </select>

          <button
            onClick={gerarLegenda}
            disabled={gerando}
            className="mt-4 w-full px-4 py-3 bg-[#B8860B] text-white font-semibold rounded-xl hover:bg-[#9A7209] transition-colors disabled:opacity-50"
          >
            {gerando ? '⏳ Gerando...' : '⚡ Gerar Legenda'}
          </button>
        </div>

        {/* Output */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-[#1A1D26] mb-4">3. Legenda formatada</h2>
          {legendaGerada ? (
            <>
              <div className="bg-[#FAFBFC] rounded-xl p-4 min-h-[200px]">
                <pre className="text-sm text-[#1A1D26] whitespace-pre-wrap font-sans leading-relaxed">{legendaGerada}</pre>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={copiar} className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:bg-[#9A7209]">
                  📋 Copiar
                </button>
                <button onClick={() => setLegendaGerada('')} className="px-4 py-2 bg-[#F3F4F6] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#E5E7EB]">
                  🔄 Limpar
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#9CA3AF] text-sm">
              Sua legenda aparecerá aqui...
            </div>
          )}
        </div>
      </div>

      {/* Frameworks disponíveis */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-[#1A1D26] mb-4">Frameworks Disponíveis ({templates.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.slice(0, 12).map(t => (
            <div key={t.id} className="bg-[#FAFBFC] rounded-xl p-3">
              <p className="font-medium text-sm text-[#1A1D26]">{t.nome}</p>
              <p className="text-xs text-[#6B7280] mt-1">{t.estrutura}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{t.objetivo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
