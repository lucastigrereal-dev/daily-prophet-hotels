import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'
import * as d from '../lib/hotel/v2/domain.ts'
import {fixture,catalog,anchor} from './fixtures.mjs'
import {LabStore} from '../lab/adapter.mjs'
const A=fixture(),drafts=d.week(catalog,A.profile,anchor)
test('C9 title is persisted as a reviewed revision and exported exactly; subsequent title edit revokes approval',()=>{
 const store=new LabStore({mode:'lab'});for(let module=1;module<=4;module++)store.saveOnboarding('A',{module,snapshot:A.snapshot,revision:module-1,operationId:'m'+module});store.createWindow('A',{anchor,operationId:'week'});const first=store.workspace('A').drafts[0],title='Título FICTÍCIO adaptado por A'
 const saved=store.saveDraft('A',{draftId:first.id,revision:1,title,text:first.text,confirmExact:true,expectedDnaVersion:store.workspace('A').profile.dna_version})
 assert.equal(saved.title,title);assert.equal(saved.editorial_review.exact_title,title);assert.ok(store.getExport('A',{draftId:first.id,revision:2}).includes(title))
 const unapproved=store.saveDraft('A',{draftId:first.id,revision:2,title:'Outra intenção FICTÍCIA',text:first.text});assert.equal(unapproved.editorial_review,null);assert.throws(()=>store.getExport('A',{draftId:first.id,revision:3}),/Confirme explicitamente/)
 assert.throws(()=>store.saveDraft('A',{draftId:first.id,revision:2,title:'Concorrente',text:first.text}),/Compare versões/);assert.equal(store.workspace('A').drafts[0].title,'Outra intenção FICTÍCIA')
})
test('C9 blank/oversize/unsupported title is rejected and title tampering cannot reuse exact review',()=>{
 for(const title of ['', ' ', '\t\n', '\u00a0', '\ufeff', 'x'.repeat(241), ' '+ 'x'.repeat(239)+' ', '🏨'.repeat(241)])assert.throws(()=>d.revise(drafts[0],A.profile,catalog,drafts[0].text,A.actor.id,anchor,true,title),/Título obrigatório/)
 assert.throws(()=>d.revise(drafts[0],A.profile,catalog,drafts[0].text,A.actor.id,anchor,true,'Últimas vagas garantidas'),/alegação/)
 const saved=d.revise(drafts[0],A.profile,catalog,drafts[0].text,A.actor.id,anchor,true,'Revisão FICTÍCIA');saved.title='Outra revisão';assert.throws(()=>d.exportable(saved,A.profile,catalog,anchor,A.actor.id),/Confirme explicitamente/)
})
test('C9 alternative uses same relevant date, strictly lower effort and leaves human revision byte-exact',()=>{
 const profile={...structuredClone(A.profile),minutes:120,filming:true,people:true,preferred:[]};const high=d.week(catalog,profile,anchor).find(x=>x.minutes>5);assert.ok(high)
 high.text+=' HUMAN INTENT';const before=JSON.stringify(high),alt=d.lowerEffortAlternative(high,profile,catalog,anchor)
 assert.ok(alt);assert.ok(alt.minutes<high.minutes);assert.equal(alt.date,high.date);assert.equal(alt.editorial_review,null);assert.notEqual(alt.template_id,high.template_id);assert.equal(JSON.stringify(high),before)
 const minimum={...high,minutes:5};assert.equal(d.lowerEffortAlternative(minimum,profile,catalog,anchor),null)
 const none={...profile,facts:{}};assert.equal(d.lowerEffortAlternative(high,none,catalog,anchor),null)
})
test('C9 clipboard feedback waits for fulfillment and rejection never announces success',async()=>{
 let resolve,success=0,failed=0;const pending=d.copyWithFeedback('FICTÍCIO',()=>new Promise(r=>resolve=r),()=>success++,()=>failed++)
 await Promise.resolve();assert.equal(success,0);resolve();assert.equal(await pending,true);assert.equal(success,1)
 assert.equal(await d.copyWithFeedback('FICTÍCIO',async()=>{throw Error('denied')},()=>success++,()=>failed++),false);assert.equal(success,1);assert.equal(failed,1)
})
test('C9 actual workspace action recovers containing window on day change, while exact explicit anchor stays explicit',async()=>{
 const require=createRequire(import.meta.url),ts=require('typescript'),rows=drafts.map(draft=>({v2:{anchor,draft}}));let written=0
 function query(){let lo,hi;const q={select(){return q},eq(){return q},maybeSingle:async()=>({data:{regras_extras:{profile:A.profile}},error:null}),gte(_,v){lo=v;return q},lte(_,v){hi=v;return Promise.resolve({data:rows.filter(r=>r.v2.draft.date>=lo&&r.v2.draft.date<=hi),error:null})}};return q}
 const client={from:query,rpc:async()=>{written++;throw Error('No write expected')}}
 const src=fs.readFileSync('lib/hotel/workspace-actions.ts','utf8'),compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,m={exports:{}}
 new Function('require','module','exports',compiled)(n=>n==='./server-access'?{ownerContext:async()=>({client,actor:A.actor,hotel:{id:A.id,status:'ativo',nome:'FICTÍCIO'}})}:n==='./v2/domain'?d:n==='./v2/catalog'?{draftCatalog:catalog}:null,m,m.exports)
 const w=await m.exports.getWorkspace('2026-10-24',true);assert.equal(w.anchor,anchor);assert.equal(w.drafts.length,7);assert.equal(w.drafts.find(x=>x.date==='2026-10-24').id,drafts[1].id)
 assert.equal((await m.exports.getWorkspace('2026-10-24',false)).drafts.length,0);assert.equal(written,0)
})
test('C9 historical SQL remains untouched and added editorial migration has no role/grant/policy mutation',()=>{
 const sql=fs.readFileSync('sql/MIGRATION_C9_EDITORIAL_FIELDS_NOT_APPLIED.sql','utf8');assert.ok(sql.includes("'title',new_title"));assert.ok(sql.includes('INVALID_REVIEW_TITLE'));assert.ok(sql.includes('EXACT_REVIEW_TITLE_REQUIRED'))
 assert.doesNotMatch(sql,/^\s*(?:CREATE|ALTER|DROP)\s+(?:ROLE|POLICY)|^\s*(?:GRANT|REVOKE)\b/im)
})

test('C9 alternative preview becomes ineligible when facts are revoked; UI drops cached preview before comparison or retry',()=>{const profile={...structuredClone(A.profile),minutes:120,filming:true,people:true,preferred:[]};const high=d.week(catalog,profile,anchor).find(x=>x.minutes>5);const alt=d.lowerEffortAlternative(high,profile,catalog,anchor);assert.ok(alt);d.currentDraft(alt,profile,catalog,anchor);for(const f of Object.values(profile.facts))f.confirmed=false;assert.throws(()=>d.currentDraft(alt,profile,catalog,anchor),/reconfirmação/);const ui=fs.readFileSync('app/dashboard/post-do-dia/page.tsx','utf8');assert.ok(ui.includes('alternative&&!issue(alternative)'));assert.ok(ui.includes('setAlternative(null);buffer(text);'));assert.ok(ui.includes('setAlternative(null);const result=await getAlternative'))})

test('C9 title bound counts Unicode code points consistently with PostgreSQL char_length',()=>{const title='🏨'.repeat(240);const saved=d.revise(drafts[0],A.profile,catalog,drafts[0].text,A.actor.id,anchor,true,title);assert.equal(saved.title,title);assert.equal(saved.editorial_review.exact_title,title);assert.ok(d.exportText(saved).includes(title))})

test('C9 alternative response binds fresh profile and preview after another session changes DNA',async()=>{
 const profile={...structuredClone(A.profile),minutes:120,filming:true,people:true,preferred:[]},high=d.week(catalog,profile,anchor).find(x=>x.minutes>5);const fresh={...profile,dna_version:'EXTERNAL-NEW-FICTITIOUS-DNA'}
 const require=createRequire(import.meta.url),ts=require('typescript');function query(){const q={select(){return q},eq(){return q},limit:async()=>({data:[{v2:{draft:high}}],error:null}),maybeSingle:async()=>({data:{regras_extras:{profile:fresh}},error:null})};return q}
 const src=fs.readFileSync('lib/hotel/workspace-actions.ts','utf8'),compiled=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,m={exports:{}}
 new Function('require','module','exports',compiled)(n=>n==='./server-access'?{ownerContext:async()=>({client:{from:query},actor:A.actor,hotel:{id:A.id,status:'ativo'}})}:n==='./v2/domain'?d:n==='./v2/catalog'?{draftCatalog:catalog}:null,m,m.exports)
 const result=await m.exports.getAlternative(A.id,high.id);assert.equal(result.profile.dna_version,fresh.dna_version);assert.ok(result.alternative);assert.equal(result.alternative.dna_version,result.profile.dna_version);d.currentDraft(result.alternative,result.profile,catalog,anchor)
 const ui=fs.readFileSync('app/dashboard/post-do-dia/page.tsx','utf8');assert.ok(ui.includes('setProfile(result.profile);setConfirmed(false);setManual(\'\');setAlternative(result.alternative)'))
})
