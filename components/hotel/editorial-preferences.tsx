'use client'
import {EDITORIAL_TONES,EDITORIAL_PILLARS} from '@/lib/hotel/v2/domain'

export type EditorialAnswers={tom:string;temas_vetados:string[];vetos_confirmados:boolean}
export function EditorialPreferencesFields({value,onChange}:{value:EditorialAnswers;onChange:(value:EditorialAnswers)=>void}) {
  function toggle(pillar:string){onChange({...value,temas_vetados:value.temas_vetados.includes(pillar)?value.temas_vetados.filter(p=>p!==pillar):[...value.temas_vetados,pillar],vetos_confirmados:false})}
  return <section aria-labelledby="editorial-heading" className="space-y-4 p-4 bg-white border rounded-xl">
    <h3 id="editorial-heading" className="font-semibold">Tom e vetos editoriais</h3>
    <label htmlFor="editorial-tone" className="block font-medium">Tom editorial *</label>
    <select id="editorial-tone" required value={value.tom} aria-describedby="editorial-tone-help" onChange={e=>onChange({...value,tom:e.target.value,vetos_confirmados:false})} className="w-full p-3 border rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">
      <option value="">Selecione o tom</option>
      {Object.entries(EDITORIAL_TONES).map(([key,label])=><option key={key} value={key}>{label}</option>)}
    </select>
    <p id="editorial-tone-help" className="text-sm text-[#6B7280]">O tom altera a abertura do modelo “Um detalhe da acomodação, com contexto”. Nos demais modelos, use o tom como orientação para sua edição. Rascunhos existentes permanecem intactos.</p>
    <fieldset aria-describedby="editorial-veto-help" className="space-y-3">
      <legend className="font-medium">Temas vetados</legend>
      <p id="editorial-veto-help" className="text-sm text-[#6B7280]">Marque os pilares que não devem entrar em novas sugestões. Você pode manter todos desmarcados. Se faltarem sete modelos elegíveis, nenhum plano parcial será salvo.</p>
      <div className="grid gap-2 sm:grid-cols-2">{Object.entries(EDITORIAL_PILLARS).map(([key,label])=><label key={key} htmlFor={'veto-'+key} className="flex items-center gap-3 p-3 border rounded-lg"><input id={'veto-'+key} type="checkbox" checked={value.temas_vetados.includes(key)} onChange={()=>toggle(key)} className="h-5 w-5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"/>Vetar {label}</label>)}</div>
    </fieldset>
    <label htmlFor="editorial-confirmed" className="flex items-start gap-3 p-3 border rounded-lg"><input id="editorial-confirmed" type="checkbox" checked={value.vetos_confirmados} onChange={e=>onChange({...value,vetos_confirmados:e.target.checked})} className="h-5 w-5 mt-0.5 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"/>Confirmei o tom e os vetos acima, inclusive quando nenhum tema está vetado.</label>
    {(!value.tom||!value.vetos_confirmados)&&<p role="status" className="text-sm text-amber-900">Selecione o tom e confirme os vetos para continuar.</p>}
  </section>
}

export function EditorialPreferencesSummary({tone,avoid}:{tone:string;avoid:string[]}) {
  return <div className="space-y-2"><p><strong>Tom informado:</strong> {Object.hasOwn(EDITORIAL_TONES,tone)?EDITORIAL_TONES[tone as keyof typeof EDITORIAL_TONES]:'A confirmar'}</p><p><strong>Temas vetados:</strong> {avoid.length?avoid.map(p=>EDITORIAL_PILLARS[p]??'Tema a confirmar').join(', '):'Nenhum tema selecionado'}</p></div>
}
