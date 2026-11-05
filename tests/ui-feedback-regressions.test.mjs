import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {fixture,catalog} from './fixtures.mjs'
import * as domain from '../lib/hotel/v2/domain.ts'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
// Execute actual page components with controlled read-only boundaries. This does not test auth/RLS.
function page(path,mocks={}){
 const states=[],refs=[],effects=[],effectDeps=[];let cursor=0,mounted=false
 const hooks={...React,useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],v=>{states[i]=typeof v==='function'?v(states[i]):v}]},useRef(initial){const i=cursor++;return refs[i]??=( {current:initial})},useEffect(fn,deps){const i=cursor++;if(!effectDeps[i]||!deps||deps.some((v,k)=>v!==effectDeps[i][k])){effectDeps[i]=deps;effects.push(fn)}}}
 const mod={exports:{}},code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('require','module','exports',code)(n=>n==='react'?hooks:n==='next/link'?{__esModule:true,default:'a'}:n==='sonner'?{toast:{error(){},success(){}}}:n==='@/components/hotel/editorial-preferences'?{EditorialPreferencesSummary:()=>null,EditorialPreferencesFields:()=>null}:n in mocks?mocks[n]:n==='@/lib/hotel/v2/domain'?domain:require(n),mod,mod.exports)
 function tree(){cursor=0;const t=mod.exports.default();mounted=true;return t}
 return{tree,html:()=>renderToStaticMarkup(tree()),async mount(){for(let i=0;i<8;i++){tree();const pending=effects.splice(0);if(!pending.length)break;pending.forEach(f=>f());await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r))}return this.html()}}
}
function descendants(node){if(!node||typeof node!=='object')return[];return[node,...React.Children.toArray(node.props?.children).flatMap(descendants)]}
const taxonomy={TEMAS:[],TEMA_LABEL:{},FORMATOS:[],FORMATO_LABEL:{},PUBLICOS:[],PUBLICO_LABEL:{},OBJETIVOS:[],OBJETIVO_LABEL:{},SAZONALIDADES:[],SAZONALIDADE_LABEL:{},labelFor:x=>x}
function client(results){return{auth:{getUser:async()=>({data:{user:{id:'synthetic'}}})},from(table){const q={};for(const m of ['select','eq','order','limit'])q[m]=()=>q;q.maybeSingle=async()=>results.hotels??({data:{id:'hotel',nome:'FICTICIO'}});q.then=(ok,bad)=>Promise.resolve().then(()=>{const r=results[table]??{data:[],count:0};if(r instanceof Error)throw r;return r}).then(ok,bad);return q}}}
function library(results){return page('app/dashboard/biblioteca/page.tsx',{'@/lib/supabase/client':{createClient:()=>client(results)},'@/lib/content/taxonomy':taxonomy,'@/lib/hotel/content-dna':{getContentDNA:async()=>null},'@/lib/hotel/v2/domain':{copyWithFeedback:async()=>{}}})}
test('DNA transport failure renders an error without asserting profile absence',async()=>{
 const ui=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':{getWorkspace:async()=>{throw Error('Não foi possível ler o DNA')}},'@/lib/hotel/v2/domain':{},'@/lib/hotel/v2/catalog':{draftCatalog:[]}})
 const html=await ui.mount();assert.match(html,/Não foi possível ler o DNA/);assert.doesNotMatch(html,/Falta confirmar o DNA/);assert.match(html,/Tentar carregar novamente/)
})
test('confirmed missing DNA remains actionable without claiming a transport error',async()=>{
 const ui=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':{getWorkspace:async()=>({hotel:{id:'h',status:'ativo'},profile:null,drafts:[]})},'@/lib/hotel/v2/domain':{},'@/lib/hotel/v2/catalog':{draftCatalog:[]}})
 const html=await ui.mount();assert.match(html,/Falta confirmar o DNA/);assert.doesNotMatch(html,/Tentar carregar novamente/)
})
for(const table of ['hooks','benchmarks_posts','hashtag_combos'])test('library '+table+' read failure is not an empty result and retry retains search',async()=>{
 const responses={[table]:{data:null,error:{message:'synthetic 503'}}},ui=library(responses);await ui.mount()
 let tree=ui.tree();const search=descendants(tree).find(e=>e.type==='input');search.props.onChange({target:{value:'rascunho humano'}})
 let html=ui.html();assert.match(html,/Não foi possível carregar a biblioteca/);assert.doesNotMatch(html,/Nenhum hook|Nenhuma legenda|peças recomendadas/)
 const retry=descendants(ui.tree()).find(e=>e.type==='button'&&e.props.children==='Tentar carregar novamente');assert.ok(retry)
 responses[table]={data:[],count:0};await retry.props.onClick();html=ui.html();assert.doesNotMatch(html,/Não foi possível carregar a biblioteca/);assert.match(html,/value="rascunho humano"/)
})
test('library thrown transport exception settles into retryable error',async()=>{const ui=library({hooks:new Error('offline')});assert.match(await ui.mount(),/Não foi possível carregar a biblioteca/)})
test('library confirmed missing hotel retains public references without a retry loop',async()=>{const ui=library({hotels:{data:null,error:null}}),html=await ui.mount();assert.doesNotMatch(html,/Não foi possível carregar a biblioteca/);assert.match(html,/Complete o onboarding/)})
test('library hotel read failure is not treated as confirmed absence',async()=>{const ui=library({hotels:{data:null,error:{message:'offline'}}});assert.match(await ui.mount(),/Não foi possível carregar a biblioteca/)})
test('successful empty library can explicitly show empty hooks',async()=>{const ui=library({});await ui.mount();const hooks=descendants(ui.tree()).find(e=>e.type==='button'&&renderToStaticMarkup(e).includes('Hooks'));hooks.props.onClick();assert.match(ui.html(),/Nenhum hook encontrado para este filtro/);assert.doesNotMatch(ui.html(),/Não foi possível carregar a biblioteca/)})
test('login labels reference unique existing email and password inputs',()=>{
 const ui=page('app/auth/login/page.tsx',{'@/lib/supabase/client':{createClient:()=>({})},'next/navigation':{useRouter:()=>({})}}),nodes=descendants(ui.tree())
 for(const type of ['email','password']){const input=nodes.find(e=>e.type==='input'&&e.props.type===type);assert.ok(input.props.id);assert.equal(nodes.filter(e=>e.type==='label'&&e.props.htmlFor===input.props.id).length,1)}
})
test('seasonal page presents planning references without fabricated performance or automation',async()=>{
 const ui=page('app/dashboard/sazonal/page.tsx',{'@/lib/supabase/client':{createClient:()=>client({})}}),html=await ui.mount()
 assert.doesNotMatch(html,/200\+|100%|20%|conteúdo automático|templates prontos/);assert.match(html,/Referências para planejar/)
})

test('Today settles on actual local day inside a previously saved window without refetch losing selection',async()=>{
 const A=fixture(),ds=domain.week(catalog,A.profile,'2026-10-23'),calls=[];globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}}
 const ui=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':{getWorkspace:async(anchor,resolve)=>{calls.push([anchor,resolve]);return{hotel:{id:A.id,actorId:'A',status:'ativo'},profile:A.profile,day:anchor||'2026-10-25',anchor:resolve?'2026-10-23':anchor,drafts:resolve?ds:[]}}},'@/lib/hotel/v2/catalog':{draftCatalog:catalog}})
 await ui.mount();const text=descendants(ui.tree()).find(e=>e.props?.id==='draft-text');assert.equal(text.props.value,ds[2].text);assert.deepEqual(calls,[['',true]]);delete globalThis.sessionStorage
})
for(const failure of ['logout','save','session'])test('reset distinguishes password receipt from '+failure+' failure',async()=>{
 let saves=0;const auth={getUser:async()=>({data:{user:failure==='session'?null:{id:'A'}}}),updateUser:async()=>{saves++;return{error:failure==='save'?Error('failed'):null}},signOut:async()=>({error:failure==='logout'?Error('failed'):null})}
 const ui=page('app/auth/reset/page.tsx',{'@/lib/supabase/client':{createClient:()=>({auth})}});for(const id of ['reset-password','reset-confirm'])descendants(ui.tree()).find(e=>e.props?.id===id).props.onChange({target:{value:'synthetic-password-only'}});await ui.tree().props.onSubmit({preventDefault(){}});const html=ui.html();if(failure==='logout'){assert.match(html,/Senha alterada/);assert.match(html,/Tentar encerrar/);assert.doesNotMatch(html,/sessão encerrada/)}else{assert.match(html,/Não foi possível confirmar/);assert.doesNotMatch(html,/Alteração confirmada/);assert.equal(saves,failure==='session'?0:1)}
})


function memoryStorage(){const entries=new Map();return{getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)}}
for(const module of [1,2,3])test('C16 resume partial onboarding after M'+module+' without a tab buffer',async()=>{
 const A=fixture();globalThis.sessionStorage=memoryStorage()
 try{
  const ui=page('app/onboarding/page.tsx',{'@/lib/supabase/client':{createClient:()=>({})},'next/navigation':{useRouter:()=>({})},'@/components/hotel/minimum-diagnosis':{MinimumDiagnosisFields:()=>null},'./actions':{resumeOnboarding:async()=>({actor_id:'A',hotel_id:A.id,answers:A.snapshot,revision:module,complete:false,last_module:module})}})
  const html=await ui.mount();assert.match(html,new RegExp('Módulo '+(module+1)+' de 4'))
  const stored=JSON.parse(sessionStorage.getItem('hotel-onboarding:A'))
  assert.equal(stored.revision,module);assert.equal(stored.hotelId,A.id)
  for(const [section,answers] of Object.entries(A.snapshot))for(const [key,value] of Object.entries(answers))assert.deepEqual(stored.answers[section][key],value)
 }finally{delete globalThis.sessionStorage}
})
test('C16 reauthentication restores the selected date and its unsaved text and title',async()=>{
 const A=fixture(),ds=domain.week(catalog,A.profile,'2026-10-23');let fail=false
 globalThis.sessionStorage=memoryStorage();globalThis.window={location:{search:''}}
 const actions={getWorkspace:async(anchor,resolve)=>{if(fail)throw Error('SESSION_EXPIRED');return{hotel:{id:A.id,actorId:'A',status:'ativo'},profile:A.profile,day:'2026-10-25',anchor:'2026-10-23',drafts:ds}}}
 try{
  const ui=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':actions,'@/lib/hotel/v2/catalog':{draftCatalog:catalog}});await ui.mount()
  const date=descendants(ui.tree()).find(e=>e.type==='button'&&renderToStaticMarkup(e).includes(ds[5].date));date.props.onClick();ui.html()
  descendants(ui.tree()).find(e=>e.props?.id==='draft-title-editor').props.onChange({target:{value:'Título local futuro'}})
  descendants(ui.tree()).find(e=>e.props?.id==='draft-text').props.onChange({target:{value:'Texto local futuro preservado'}})
  fail=true;await descendants(ui.tree()).find(e=>e.type==='button'&&e.props.children==='Comparar versão remota sem descartar meu texto').props.onClick()
  const link=descendants(ui.tree()).find(e=>e.props?.children==='Entrar novamente e retomar este estabelecimento');assert.ok(link)
  const next=new URL(link.props.href,'http://localhost').searchParams.get('next');const target=new URL(next,'http://localhost')
  assert.equal(target.searchParams.get('draft'),ds[5].id);assert.equal(target.searchParams.get('anchor'),'2026-10-23')
  globalThis.window.location.search=target.search;fail=false;const calls=[]
  const resumed=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':{getWorkspace:async(...args)=>{calls.push(args);return actions.getWorkspace(...args)}},'@/lib/hotel/v2/catalog':{draftCatalog:catalog}})
  await resumed.mount();assert.deepEqual(calls,[['2026-10-23',false]])
  const nodes=descendants(resumed.tree());assert.equal(nodes.find(e=>e.props?.id==='draft-text').props.value,'Texto local futuro preservado');assert.equal(nodes.find(e=>e.props?.id==='draft-title-editor').props.value,'Título local futuro')
 }finally{delete globalThis.sessionStorage;delete globalThis.window}
})
test('C16 reauthentication refuses a different owner instead of opening another hotel draft',async()=>{
 const A=fixture(),B=fixture('B'),ds=domain.week(catalog,B.profile,'2026-10-23');globalThis.sessionStorage=memoryStorage()
 globalThis.window={location:{search:'?'+new URLSearchParams({actor:'A',hotel:A.id,anchor:'2026-10-23',draft:A.id+':2026-10-23:5'})}}
 try{
  const ui=page('app/dashboard/post-do-dia/page.tsx',{'@/lib/hotel/workspace-actions':{getWorkspace:async()=>({hotel:{id:B.id,actorId:'B',status:'ativo'},profile:B.profile,day:'2026-10-25',anchor:'2026-10-23',drafts:ds})},'@/lib/hotel/v2/catalog':{draftCatalog:catalog}})
  assert.match(await ui.mount(),/ACCESS_DENIED/);assert.equal(descendants(ui.tree()).some(e=>e.props?.id==='draft-text'),false)
 }finally{delete globalThis.sessionStorage;delete globalThis.window}
})

test('C16 server resume exposes the confirmed module and revision without writing',async()=>{
 const A=fixture(),row={respostas:{...A.snapshot,_v2:{revision:3}},completado:false,ultima_secao_completada:3};let columns
 const q={select(value){columns=value;return q},eq(){return q},maybeSingle:async()=>({data:row,error:null})}
 const mod={exports:{}},code=ts.transpileModule(fs.readFileSync('app/onboarding/actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 new Function('require','module','exports',code)(name=>name==='@/lib/hotel/server-access'?{ownerContext:async()=>({client:{from:table=>{assert.equal(table,'onboarding_respostas');return q}},actor:{id:'A'},hotel:{id:A.id}})}:name==='@/lib/hotel/v2/domain'?domain:require(name),mod,mod.exports)
 const result=await mod.exports.resumeOnboarding();assert.equal(result.last_module,3);assert.equal(result.revision,3);assert.equal(result.complete,false);assert.deepEqual(result.answers,row.respostas);assert.match(columns,/ultima_secao_completada/)
})
