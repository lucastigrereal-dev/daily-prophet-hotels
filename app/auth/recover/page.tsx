'use client'
import {useState} from 'react'
import Link from 'next/link'
import {createClient} from '@/lib/supabase/client'
export default function RecoverPage(){
 const[email,setEmail]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false)
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try{await createClient().auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth/callback?next=/auth/reset'})}catch{/* Same neutral answer; never expose account existence. */}finally{setSent(true);setBusy(false)}}
 return <form onSubmit={submit} className="space-y-4"><h1>Recuperar acesso</h1><p>A resposta é igual para todos os endereços. Se houver uma conta e o serviço de entrega estiver disponível, você receberá instruções. Nunca informe sua senha ao suporte.</p><label htmlFor="recover-email">Email<input id="recover-email" className="w-full p-3 border rounded-lg" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} aria-describedby="recover-status"/></label><p id="recover-status" role="status">{sent?'Solicitação processada. Verifique sua caixa de entrada. Se não receber, tente novamente ou procure o suporte; isso não confirma a existência de conta.':''}</p><button disabled={busy} className="p-3 border rounded-lg">{busy?'Processando…':'Solicitar instruções'}</button><Link href="/auth/login">Voltar ao acesso</Link></form>
}
