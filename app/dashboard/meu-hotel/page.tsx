'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'

interface HotelFull {
  id: string
  nome: string
  tipo: string
  classificacao: number | null
  cidade: string
  estado: string
  regiao: string | null
  instagram: string | null
  site: string | null
  email_comercial: string | null
  telefone: string | null
  whatsapp: string | null
  numero_quartos: number | null
  taxa_ocupacao_media: number | null
  ticket_medio_diaria: number | null
  tempo_operacao: number | null
  status: string
  onboarding_completo: boolean
  created_at: string
}

const TIPO_LABEL: Record<string, string> = {
  resort: 'Resort',
  pousada: 'Pousada',
  boutique: 'Boutique',
  fazenda: 'Hotel Fazenda',
  urbano: 'Hotel Urbano',
  hostel: 'Hostel',
  eco_resort: 'Eco Resort',
  glamping: 'Glamping',
  apart_hotel: 'Apart Hotel',
}

interface PrintItem {
  id: string
  tipo_print: string
  file_url: string
  uploaded_at: string
}

const PRINT_TYPES = [
  { value: 'feed', label: 'Feed Principal' },
  { value: 'perfil', label: 'Perfil / Bio' },
  { value: 'stories', label: 'Stories / Destaques' },
  { value: 'insights', label: 'Insights / Metricas' },
]

export default function MeuHotelPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hotel, setHotel] = useState<HotelFull | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<Partial<HotelFull>>({})
  const [prints, setPrints] = useState<PrintItem[]>([])
  const [showPrintForm, setShowPrintForm] = useState(false)
  const [printForm, setPrintForm] = useState({ tipo_print: 'feed', file_url: '' })
  const [savingPrint, setSavingPrint] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('hotels')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setHotel(data)
      setForm(data)
      // Load prints
      const { data: printsData } = await supabase
        .from('hotel_instagram_prints')
        .select('*')
        .eq('hotel_id', data.id)
        .order('uploaded_at', { ascending: false })
      setPrints(printsData || [])
    }
    setLoading(false)
  }

  async function savePrint() {
    if (!hotel || !printForm.file_url.trim()) return
    setSavingPrint(true)
    const { error } = await supabase.from('hotel_instagram_prints').insert({
      hotel_id: hotel.id,
      tipo_print: printForm.tipo_print,
      file_url: printForm.file_url.trim(),
    })
    setSavingPrint(false)
    if (error) {
      toast.error('Erro ao salvar print: ' + error.message)
    } else {
      toast.success('Print adicionado!')
      setPrintForm({ tipo_print: 'feed', file_url: '' })
      setShowPrintForm(false)
      load()
    }
  }

  async function deletePrint(id: string) {
    await supabase.from('hotel_instagram_prints').delete().eq('id', id)
    setPrints(prev => prev.filter(p => p.id !== id))
    toast.success('Print removido')
  }

  async function save() {
    if (!hotel) return
    setSaving(true)

    const { error } = await supabase
      .from('hotels')
      .update({
        nome: form.nome,
        instagram: form.instagram,
        site: form.site,
        email_comercial: form.email_comercial,
        telefone: form.telefone,
        whatsapp: form.whatsapp,
        numero_quartos: form.numero_quartos,
        taxa_ocupacao_media: form.taxa_ocupacao_media,
        ticket_medio_diaria: form.ticket_medio_diaria,
      })
      .eq('id', hotel.id)

    setSaving(false)
    if (error) {
      toast.error('Erro ao salvar: ' + error.message)
    } else {
      toast.success('Hotel atualizado!')
      setHotel({ ...hotel, ...form } as HotelFull)
      setEditMode(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#B8860B] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-[#6B7280] mb-4">Nenhum hotel cadastrado</p>
        <Link href="/onboarding" className="px-6 py-3 bg-[#B8860B] text-white font-semibold rounded-lg">
          Cadastrar meu hotel
        </Link>
      </div>
    )
  }

  const estrelas = hotel.classificacao ? Array.from({ length: hotel.classificacao }, (_, i) => i) : []

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-[#1A1D26]">Meu Hotel</h1>
          <p className="text-sm text-[#6B7280] mt-0.5">Identidade e dados do seu hotel</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditMode(false); setForm(hotel) }}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {/* Card identidade */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#FFF8E7] flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-[#B8860B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1">
            {editMode ? (
              <input
                value={form.nome || ''}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="text-lg font-bold text-[#1A1D26] border-b border-[#E5E7EB] w-full pb-1 focus:outline-none focus:border-[#B8860B]"
              />
            ) : (
              <h2 className="text-lg font-bold text-[#1A1D26]">{hotel.nome}</h2>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] font-medium">
                {TIPO_LABEL[hotel.tipo] || hotel.tipo}
              </span>
              <span className="text-xs text-[#9CA3AF]">{hotel.cidade}/{hotel.estado}</span>
              {estrelas.length > 0 && (
                <span className="text-xs text-[#B8860B]">
                  {estrelas.map(() => '\u2605').join('')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280]">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                hotel.status === 'ativo' ? 'bg-emerald-50 text-emerald-700' :
                hotel.status === 'onboarding' ? 'bg-[#FFF8E7] text-[#B8860B]' :
                'bg-[#F3F4F6] text-[#6B7280]'
              }`}>{hotel.status}</span>
              {hotel.onboarding_completo && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Onboarding completo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2 colunas — Dados + Digital */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Dados operacionais */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-[#1A1D26] text-sm mb-4">Dados Operacionais</h3>
          <div className="space-y-3">
            <InfoRow label="Quartos" value={editMode ? (
              <input type="number" value={form.numero_quartos || ''} onChange={e => setForm({ ...form, numero_quartos: Number(e.target.value) || null })}
                className="text-sm text-right border-b border-[#E5E7EB] w-24 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.numero_quartos ? `${hotel.numero_quartos} quartos` : '—'
            )} />
            <InfoRow label="Ocupacao media" value={editMode ? (
              <input type="number" step="0.1" value={form.taxa_ocupacao_media || ''} onChange={e => setForm({ ...form, taxa_ocupacao_media: Number(e.target.value) || null })}
                className="text-sm text-right border-b border-[#E5E7EB] w-24 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.taxa_ocupacao_media ? `${hotel.taxa_ocupacao_media}%` : '—'
            )} />
            <InfoRow label="Ticket medio" value={editMode ? (
              <input type="number" step="0.01" value={form.ticket_medio_diaria || ''} onChange={e => setForm({ ...form, ticket_medio_diaria: Number(e.target.value) || null })}
                className="text-sm text-right border-b border-[#E5E7EB] w-24 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.ticket_medio_diaria ? `R$ ${Number(hotel.ticket_medio_diaria).toLocaleString('pt-BR')}` : '—'
            )} />
            <InfoRow label="Tempo de operacao" value={
              hotel.tempo_operacao ? `${hotel.tempo_operacao} anos` : '—'
            } />
            <InfoRow label="Regiao" value={hotel.regiao || '—'} />
          </div>
        </div>

        {/* Presenca digital */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-[#1A1D26] text-sm mb-4">Presenca Digital</h3>
          <div className="space-y-3">
            <InfoRow label="Instagram" value={editMode ? (
              <input value={form.instagram || ''} onChange={e => setForm({ ...form, instagram: e.target.value })}
                placeholder="@seuhotel"
                className="text-sm text-right border-b border-[#E5E7EB] w-40 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.instagram ? `@${hotel.instagram.replace('@', '')}` : '—'
            )} />
            <InfoRow label="Site" value={editMode ? (
              <input value={form.site || ''} onChange={e => setForm({ ...form, site: e.target.value })}
                className="text-sm text-right border-b border-[#E5E7EB] w-40 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.site || '—'
            )} />
            <InfoRow label="Email" value={editMode ? (
              <input value={form.email_comercial || ''} onChange={e => setForm({ ...form, email_comercial: e.target.value })}
                className="text-sm text-right border-b border-[#E5E7EB] w-40 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.email_comercial || '—'
            )} />
            <InfoRow label="Telefone" value={editMode ? (
              <input value={form.telefone || ''} onChange={e => setForm({ ...form, telefone: e.target.value })}
                className="text-sm text-right border-b border-[#E5E7EB] w-40 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.telefone || '—'
            )} />
            <InfoRow label="WhatsApp" value={editMode ? (
              <input value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                className="text-sm text-right border-b border-[#E5E7EB] w-40 focus:outline-none focus:border-[#B8860B]" />
            ) : (
              hotel.whatsapp || '—'
            )} />
          </div>
        </div>

      </div>

      {/* Prints do Instagram */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#1A1D26] text-sm">Prints do Instagram</h3>
          <button
            onClick={() => setShowPrintForm(!showPrintForm)}
            className="text-xs text-[#B8860B] hover:text-[#DAA520] font-medium"
          >
            {showPrintForm ? 'Cancelar' : '+ Adicionar'}
          </button>
        </div>

        {showPrintForm && (
          <div className="mb-4 p-3 bg-[#F8F9FB] rounded-xl space-y-3">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Tipo</label>
              <select
                value={printForm.tipo_print}
                onChange={e => setPrintForm(f => ({ ...f, tipo_print: e.target.value }))}
                className="w-full h-9 px-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#B8860B]"
              >
                {PRINT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">URL da imagem</label>
              <input
                value={printForm.file_url}
                onChange={e => setPrintForm(f => ({ ...f, file_url: e.target.value }))}
                placeholder="https://..."
                className="w-full h-9 px-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#B8860B]"
              />
            </div>
            <button
              onClick={savePrint}
              disabled={savingPrint || !printForm.file_url.trim()}
              className="w-full py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-50"
            >
              {savingPrint ? 'Salvando...' : 'Salvar Print'}
            </button>
          </div>
        )}

        {prints.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] text-center py-4">
            Nenhum print adicionado. Adicione screenshots do seu Instagram para analise.
          </p>
        ) : (
          <div className="space-y-2">
            {prints.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFF8E7] text-[#B8860B] font-medium capitalize">
                    {PRINT_TYPES.find(t => t.value === p.tipo_print)?.label || p.tipo_print}
                  </span>
                  <span className="text-xs text-[#9CA3AF] truncate max-w-[180px]">{p.file_url}</span>
                </div>
                <button
                  onClick={() => deletePrint(p.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding status */}
      {!hotel.onboarding_completo && (
        <div className="bg-[#FFF8E7] border border-[#B8860B]/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm text-[#B8860B]">Onboarding incompleto</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Complete para desbloquear missoes e campanhas personalizadas</p>
            </div>
            <Link href="/onboarding" className="px-4 py-2 bg-[#B8860B] text-white text-sm font-medium rounded-lg hover:brightness-110">
              Completar
            </Link>
          </div>
        </div>
      )}

      {/* Membro desde */}
      <p className="text-xs text-[#9CA3AF] text-center">
        Membro desde {new Date(hotel.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
      </p>

    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F3F4F6] last:border-0">
      <span className="text-xs text-[#6B7280]">{label}</span>
      <span className="text-sm text-[#1A1D26] font-medium">{typeof value === 'string' ? value : value}</span>
    </div>
  )
}
