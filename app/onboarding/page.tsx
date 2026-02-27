'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const STEPS = ['Identificacao', 'Estrutura', 'Digital', 'Publico', 'Posicionamento', 'Metas', 'Revisao']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Record<string, any>>({
    // Step 1: Identificacao
    nome: '', tipo: 'pousada', classificacao: 3, cidade: '', estado: '',
    numero_quartos: 0, ticket_medio_diaria: 0,
    // Step 2: Estrutura
    estruturas: {} as Record<string, boolean>,
    // Step 3: Digital
    instagram: '', instagram_seguidores: 0, instagram_quem_posta: '',
    tem_site: false, site_url: '', google_business_avaliacao: 0,
    booking_nota: 0, problema_atual_redes: '',
    // Step 4: Publico
    publicos: {} as Record<string, boolean>,
    estacao_mais_movimentada: '',
    // Step 5: Posicionamento
    posicionamento: {} as Record<string, boolean>,
    concorrente_direto: '', diferencial_vs_concorrente: '', momento_uau: '',
    // Step 6: Metas
    meta_principal: '', faixa_investimento: '', principal_dor_hoje: '',
    se_daily_prophet_resolvesse: '',
  })
  const router = useRouter()
  const supabase = createClient()

  function updateData(field: string, value: any) {
    setData(prev => ({ ...prev, [field]: value }))
  }

  function toggleBool(group: string, key: string) {
    setData(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: !prev[group]?.[key] }
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { toast.error('Faça login primeiro'); return }

      const { data: hotel, error: hotelErr } = await supabase.from('hotels').insert({
        nome: data.nome, tipo: data.tipo, classificacao: data.classificacao,
        cidade: data.cidade, estado: data.estado, numero_quartos: data.numero_quartos,
        ticket_medio_diaria: data.ticket_medio_diaria, instagram: data.instagram,
        owner_id: userData.user.id, status: 'onboarding',
      }).select().single()

      if (hotelErr || !hotel) { toast.error('Erro ao criar hotel: ' + hotelErr?.message); setLoading(false); return }

      const hid = hotel.id
      await Promise.all([
        supabase.from('hotel_estruturas').insert({ hotel_id: hid, ...data.estruturas }),
        supabase.from('hotel_digital').insert({
          hotel_id: hid, instagram_handle: data.instagram,
          instagram_seguidores: data.instagram_seguidores,
          instagram_quem_posta: data.instagram_quem_posta,
          tem_site: data.tem_site, site_url: data.site_url,
          google_business_avaliacao: data.google_business_avaliacao || null,
          booking_nota: data.booking_nota || null,
          problema_atual_redes: data.problema_atual_redes,
        }),
        supabase.from('hotel_publico').insert({
          hotel_id: hid, ...data.publicos,
          estacao_mais_movimentada: data.estacao_mais_movimentada,
        }),
        supabase.from('hotel_posicionamento').insert({
          hotel_id: hid, ...data.posicionamento,
          concorrente_direto: data.concorrente_direto,
          diferencial_vs_concorrente: data.diferencial_vs_concorrente,
          momento_uau: data.momento_uau,
        }),
        supabase.from('hotel_metas').insert({
          hotel_id: hid, meta_principal: data.meta_principal,
          faixa_investimento: data.faixa_investimento,
          principal_dor_hoje: data.principal_dor_hoje,
          se_daily_prophet_resolvesse: data.se_daily_prophet_resolvesse,
        }),
        supabase.from('onboarding_respostas').insert({
          hotel_id: hid, completado: true, progresso_percent: 100,
          respostas: data,
        }),
      ])

      toast.success('Hotel cadastrado com sucesso!')
      router.push(`/dashboard/hoteis/${hid}`)
    } catch (err: any) {
      toast.error('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const canAdvance = () => {
    if (step === 0) return data.nome && data.cidade && data.estado
    return true
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6B7280]">Passo {step + 1} de {STEPS.length}</span>
          <span className="text-[#B8860B] font-medium">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div className="h-full bg-[#B8860B] rounded-full transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-sm">
        {step === 0 && <StepIdentificacao data={data} updateData={updateData} />}
        {step === 1 && <StepEstrutura data={data} toggleBool={toggleBool} />}
        {step === 2 && <StepDigital data={data} updateData={updateData} />}
        {step === 3 && <StepPublico data={data} toggleBool={toggleBool} updateData={updateData} />}
        {step === 4 && <StepPosicionamento data={data} toggleBool={toggleBool} updateData={updateData} />}
        {step === 5 && <StepMetas data={data} updateData={updateData} />}
        {step === 6 && <StepRevisao data={data} />}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3.5 bg-[#F3F4F6] text-[#1A1D26] rounded-xl font-medium hover:bg-[#E5E7EB] transition-colors">
            Voltar
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canAdvance()}
            className="flex-1 py-3.5 bg-[#B8860B] hover:brightness-110 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white rounded-xl font-semibold transition-all"
          >
            Próximo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-white rounded-xl font-semibold transition-all"
          >
            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        )}
      </div>
    </div>
  )
}

// ================ STEP COMPONENTS ================

function Input({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base transition-colors" />
    </div>
  )
}

function PillSelector({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-[#6B7280] mb-2 font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              value === o.value
                ? 'bg-[#B8860B] text-white'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function CheckGroup({ label, items, group, data, toggleBool }: any) {
  return (
    <div>
      <label className="block text-sm text-[#6B7280] mb-2 font-medium">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item: { key: string; label: string }) => (
          <button key={item.key} type="button" onClick={() => toggleBool(group, item.key)}
            className={`px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
              data[group]?.[item.key]
                ? 'bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/30 font-medium'
                : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] hover:bg-[#E5E7EB]'
            }`}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const TIPOS_HOTEL = [
  { value: 'resort', label: 'Resort' }, { value: 'pousada', label: 'Pousada' },
  { value: 'boutique', label: 'Boutique' }, { value: 'fazenda', label: 'Fazenda' },
  { value: 'urbano', label: 'Urbano' }, { value: 'eco_resort', label: 'Eco Resort' },
  { value: 'glamping', label: 'Glamping' }, { value: 'apart_hotel', label: 'Apart Hotel' },
]

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function StepIdentificacao({ data, updateData }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Identificação do Hotel</h2>
      <Input label="Nome do Hotel" value={data.nome} onChange={(v: string) => updateData('nome', v)} placeholder="Ex: Hotel Fazenda Boa Vista" />
      <PillSelector label="Tipo" options={TIPOS_HOTEL} value={data.tipo} onChange={(v) => updateData('tipo', v)} />
      <PillSelector label="Classificação" options={[{ value: '2', label: '2 estrelas' }, { value: '3', label: '3 estrelas' }, { value: '4', label: '4 estrelas' }, { value: '5', label: '5 estrelas' }]} value={String(data.classificacao)} onChange={(v) => updateData('classificacao', Number(v))} />
      <Input label="Cidade" value={data.cidade} onChange={(v: string) => updateData('cidade', v)} placeholder="Ex: Olímpia" />
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Estado</label>
        <select value={data.estado} onChange={(e) => updateData('estado', e.target.value)}
          className="w-full h-11 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] text-base focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B]">
          <option value="">Selecione</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <Input label="Número de quartos" value={data.numero_quartos || ''} onChange={(v: string) => updateData('numero_quartos', Number(v))} type="number" />
      <Input label="Diária média (R$)" value={data.ticket_medio_diaria || ''} onChange={(v: string) => updateData('ticket_medio_diaria', Number(v))} type="number" />
    </>
  )
}

function StepEstrutura({ data, toggleBool }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Estrutura do Hotel</h2>
      <CheckGroup label="Piscinas" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'tem_piscina_adulto_descoberta', label: 'Piscina adulto' }, { key: 'tem_piscina_infantil', label: 'Piscina infantil' },
        { key: 'tem_piscina_aquecida', label: 'Aquecida' }, { key: 'tem_tobogua', label: 'Tobogã' },
        { key: 'tem_borda_infinita', label: 'Borda infinita' }, { key: 'tem_hidromassagem', label: 'Hidromassagem' },
        { key: 'tem_piscina_termal', label: 'Termal' }, { key: 'tem_bar_molhado', label: 'Bar molhado' },
      ]} />
      <CheckGroup label="Alimentação" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'cafe_incluso', label: 'Café incluso' }, { key: 'tem_restaurante', label: 'Restaurante' },
        { key: 'tem_room_service', label: 'Room service' }, { key: 'tem_bar', label: 'Bar' },
        { key: 'all_inclusive', label: 'All inclusive' }, { key: 'tem_area_gourmet', label: 'Área gourmet' },
      ]} />
      <CheckGroup label="Infantil" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'tem_playground', label: 'Playground' }, { key: 'tem_brinquedoteca', label: 'Brinquedoteca' },
        { key: 'tem_kids_club_monitores', label: 'Kids club' }, { key: 'tem_recreacao', label: 'Recreação' },
      ]} />
      <CheckGroup label="Bem-estar" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'tem_academia', label: 'Academia' }, { key: 'tem_spa', label: 'Spa' },
        { key: 'tem_sauna', label: 'Sauna' }, { key: 'tem_trilhas', label: 'Trilhas' },
        { key: 'tem_yoga', label: 'Yoga' }, { key: 'tem_beach_tennis', label: 'Beach tennis' },
      ]} />
      <CheckGroup label="Localização" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'proximo_praia', label: 'Perto da praia' }, { key: 'beira_mar', label: 'Beira mar' },
        { key: 'vista_montanhas', label: 'Vista montanhas' }, { key: 'tem_cachoeira', label: 'Cachoeira' },
      ]} />
      <CheckGroup label="Outros" group="estruturas" data={data} toggleBool={toggleBool} items={[
        { key: 'tem_estacionamento', label: 'Estacionamento' }, { key: 'pet_friendly', label: 'Pet friendly' },
        { key: 'tem_wifi_alta_velocidade', label: 'WiFi rápido' }, { key: 'tem_transfer', label: 'Transfer' },
      ]} />
    </>
  )
}

function StepDigital({ data, updateData }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Presença Digital</h2>
      <Input label="Instagram (@)" value={data.instagram} onChange={(v: string) => updateData('instagram', v)} placeholder="@seuhotel" />
      <Input label="Seguidores" value={data.instagram_seguidores || ''} onChange={(v: string) => updateData('instagram_seguidores', Number(v))} type="number" />
      <Input label="Quem posta hoje?" value={data.instagram_quem_posta} onChange={(v: string) => updateData('instagram_quem_posta', v)} placeholder="Eu mesmo, agência, funcionário..." />
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => updateData('tem_site', !data.tem_site)}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            data.tem_site
              ? 'bg-[#FFF8E7] text-[#B8860B] border border-[#B8860B]/30'
              : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
          }`}>
          {data.tem_site ? 'Tem site ✓' : 'Não tem site'}
        </button>
      </div>
      {data.tem_site && <Input label="URL do site" value={data.site_url} onChange={(v: string) => updateData('site_url', v)} placeholder="https://..." />}
      <Input label="Nota Google (0-5)" value={data.google_business_avaliacao || ''} onChange={(v: string) => updateData('google_business_avaliacao', Number(v))} type="number" />
      <Input label="Nota Booking (0-10)" value={data.booking_nota || ''} onChange={(v: string) => updateData('booking_nota', Number(v))} type="number" />
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Maior problema com redes sociais</label>
        <textarea value={data.problema_atual_redes} onChange={(e) => updateData('problema_atual_redes', e.target.value)}
          rows={3} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base resize-none"
          placeholder="Ex: Não tenho tempo, não sei o que postar..." />
      </div>
    </>
  )
}

function StepPublico({ data, toggleBool, updateData }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Público-Alvo</h2>
      <CheckGroup label="Quem se hospeda?" group="publicos" data={data} toggleBool={toggleBool} items={[
        { key: 'familias_criancas_0_6', label: 'Famílias (0-6 anos)' }, { key: 'familias_criancas_7_12', label: 'Famílias (7-12)' },
        { key: 'familias_adolescentes', label: 'Adolescentes' }, { key: 'casais_jovens', label: 'Casais jovens' },
        { key: 'casais_lua_mel', label: 'Lua de mel' }, { key: 'grupos_amigos', label: 'Grupos amigos' },
        { key: 'executivos_negocios', label: 'Executivos' }, { key: 'terceira_idade', label: 'Terceira idade' },
      ]} />
      <PillSelector label="Estação mais movimentada" options={[
        { value: 'verao', label: 'Verão' }, { value: 'inverno', label: 'Inverno' },
        { value: 'o_ano_todo', label: 'Ano todo' }, { value: 'ferias', label: 'Férias escolares' },
      ]} value={data.estacao_mais_movimentada} onChange={(v) => updateData('estacao_mais_movimentada', v)} />
    </>
  )
}

function StepPosicionamento({ data, toggleBool, updateData }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Posicionamento</h2>
      <CheckGroup label="Como quer ser visto?" group="posicionamento" data={data} toggleBool={toggleBool} items={[
        { key: 'posicionamento_luxuoso', label: 'Luxuoso' }, { key: 'posicionamento_custo_beneficio', label: 'Custo-benefício' },
        { key: 'posicionamento_familia', label: 'Familiar' }, { key: 'posicionamento_romantico', label: 'Romântico' },
        { key: 'posicionamento_aventureiro', label: 'Aventureiro' }, { key: 'posicionamento_aconchegante', label: 'Aconchegante' },
        { key: 'posicionamento_exclusivo', label: 'Exclusivo' }, { key: 'posicionamento_sustentavel', label: 'Sustentável' },
      ]} />
      <Input label="Principal concorrente" value={data.concorrente_direto} onChange={(v: string) => updateData('concorrente_direto', v)} placeholder="Nome do hotel concorrente" />
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Seu diferencial vs concorrente</label>
        <textarea value={data.diferencial_vs_concorrente} onChange={(e) => updateData('diferencial_vs_concorrente', e.target.value)}
          rows={2} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base resize-none"
          placeholder="O que te diferencia?" />
      </div>
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Momento UAU do hóspede</label>
        <textarea value={data.momento_uau} onChange={(e) => updateData('momento_uau', e.target.value)}
          rows={2} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base resize-none"
          placeholder="Qual momento faz o hóspede ficar de queixo caído?" />
      </div>
    </>
  )
}

function StepMetas({ data, updateData }: any) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Metas e Objetivos</h2>
      <PillSelector label="Meta principal" options={[
        { value: 'mais_reservas', label: 'Mais reservas' }, { value: 'mais_seguidores', label: 'Mais seguidores' },
        { value: 'marca_forte', label: 'Marca forte' }, { value: 'fidelizar', label: 'Fidelizar hóspedes' },
      ]} value={data.meta_principal} onChange={(v) => updateData('meta_principal', v)} />
      <PillSelector label="Investimento mensal marketing" options={[
        { value: 'ate_500', label: 'Até R$500' }, { value: '500_1000', label: 'R$500-1000' },
        { value: '1000_3000', label: 'R$1000-3000' }, { value: 'acima_3000', label: 'Acima R$3000' },
      ]} value={data.faixa_investimento} onChange={(v) => updateData('faixa_investimento', v)} />
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Maior dor hoje</label>
        <textarea value={data.principal_dor_hoje} onChange={(e) => updateData('principal_dor_hoje', e.target.value)}
          rows={3} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base resize-none"
          placeholder="O que mais te incomoda no marketing do hotel?" />
      </div>
      <div>
        <label className="block text-sm text-[#6B7280] mb-1.5 font-medium">Se o Daily Prophet resolvesse 1 coisa, qual seria?</label>
        <textarea value={data.se_daily_prophet_resolvesse} onChange={(e) => updateData('se_daily_prophet_resolvesse', e.target.value)}
          rows={2} className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-[#1A1D26] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#DAA520]/40 focus:border-[#B8860B] text-base resize-none"
          placeholder="Ex: Ter conteúdo profissional todo mês sem eu fazer nada" />
      </div>
    </>
  )
}

function StepRevisao({ data }: any) {
  const estruturasAtivas = Object.entries(data.estruturas || {}).filter(([, v]) => v).map(([k]) => k.replace('tem_', '').replace(/_/g, ' '))
  const posAtivos = Object.entries(data.posicionamento || {}).filter(([, v]) => v).map(([k]) => k.replace('posicionamento_', ''))

  return (
    <>
      <h2 className="text-lg font-semibold text-[#1A1D26]">Revisão Final</h2>
      <div className="space-y-3 text-sm">
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">Hotel</p>
          <p className="text-[#1A1D26] font-semibold mt-1">{data.nome} ({data.tipo}) — {data.cidade}/{data.estado}</p>
          <p className="text-[#6B7280]">{data.numero_quartos} quartos | R${data.ticket_medio_diaria}/noite</p>
        </div>
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">Estruturas ({estruturasAtivas.length})</p>
          <p className="text-[#374151] mt-1">{estruturasAtivas.join(', ') || 'Nenhuma selecionada'}</p>
        </div>
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">Digital</p>
          <p className="text-[#1A1D26] mt-1">{data.instagram || 'Sem Instagram'} — {data.instagram_seguidores} seguidores</p>
        </div>
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">Posicionamento</p>
          <p className="text-[#374151] mt-1">{posAtivos.join(', ') || 'Nenhum selecionado'}</p>
        </div>
        <div className="bg-[#F3F4F6] rounded-xl p-3">
          <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wide">Meta</p>
          <p className="text-[#1A1D26] mt-1">{data.meta_principal || 'Não definida'}</p>
          <p className="text-[#6B7280]">{data.principal_dor_hoje}</p>
        </div>
      </div>
      <p className="text-xs text-[#9CA3AF] text-center mt-4">Confira os dados e clique em Finalizar Cadastro</p>
    </>
  )
}
