import Link from 'next/link'
import {getWorkspace} from '@/lib/hotel/workspace-actions'

export default async function DashboardPage(){
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Fortaleza',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
 let workspace:Awaited<ReturnType<typeof getWorkspace>>|null=null,error:string|null=null
 try{workspace=await getWorkspace(date,true)}catch(e){error=e instanceof Error?e.message:'Não foi possível ler seu planejamento. Tente novamente.'}
 const links=[['/dashboard/post-do-dia','Hoje','Retome sua janela salva, adapte e revise antes de exportar.'],['/dashboard/calendario','Calendário','Consulte os rascunhos persistidos e planeje datas explicitamente.'],['/onboarding','Meu negócio','Confirme identidade, capacidade e fatos da hospedagem.'],['/dashboard/biblioteca','Biblioteca','Referências para revisão de origem, direitos e adequação.'],['/dashboard/campanhas','Campanhas','Referências datadas, sem preço ou desconto presumido.']]
 return <div className="space-y-5"><header><h1 className="text-2xl font-bold">Hotel Pro</h1><p>{workspace?.hotel.nome??'Seu estabelecimento'} · planejamento e textos editáveis</p></header>
 {error&&<p role="alert" className="p-4 border rounded-xl">{error} <Link href="/onboarding" className="underline">Revisar meu negócio</Link></p>}
 {workspace&&<section className="p-4 border rounded-xl space-y-2"><h2 className="font-bold">Planejamento salvo</h2><p>{workspace.drafts.length} rascunhos na janela de {workspace.anchor}. {workspace.drafts.filter(d=>d.intention==='sugerir_publicacao').length} sugestões de publicação; as demais datas são de preparação.</p><p>{workspace.profile?'DNA confirmado disponível para comparação.':'DNA pendente de confirmação.'} Nenhum rascunho equivale a postagem, reserva ou resultado comercial.</p><Link href="/dashboard/post-do-dia" className="underline">Retomar Hoje</Link></section>}
 <div className="grid gap-4 sm:grid-cols-2">{links.map(([href,title,text])=><Link key={href} href={href} className="block p-4 border rounded-xl bg-white focus-visible:outline-2"><h2 className="font-bold">{title}</h2><p>{text}</p></Link>)}</div></div>
}
