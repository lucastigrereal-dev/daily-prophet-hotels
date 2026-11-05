import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'
import * as domain from '../lib/hotel/v2/domain.ts'
import {fixture,catalog} from './fixtures.mjs'

test('actual workspace actions use hotel midnight in read, approval and export with synthetic IO',async()=>{
 const RealDate=Date,A=fixture(),profile=structuredClone(A.profile),ts=createRequire(import.meta.url)('typescript')
 profile.timezone='America/Rio_Branco'
 let instant='2026-01-01T03:30:00Z'
 globalThis.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[instant]))}static now(){return new RealDate(instant).getTime()}}
 try {
  let draft=domain.week(catalog,profile,'2025-12-31')[0]
  for(const fact of Object.values(profile.facts))fact.valid_until='2025-12-31'
  draft.facts_used=Object.fromEntries(Object.keys(draft.facts_used).map(k=>[k,structuredClone(profile.facts[k])]))
  let writes=[]
  const client={from(){const q={select(){return q},eq(){return q},gte(){return q},lte(){return Promise.resolve({data:[{v2:{anchor:'2025-12-31',draft}}],error:null})},limit(){return Promise.resolve({data:[{v2:{draft}}],error:null})},maybeSingle(){return Promise.resolve({data:{regras_extras:{profile}},error:null})}};return q},async rpc(name,args){writes.push(name);draft=structuredClone(args.p_reviewed_draft);return{data:draft,error:null}}}
  const m={exports:{}},compiled=ts.transpileModule(fs.readFileSync('lib/hotel/workspace-actions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
  new Function('require','module','exports',compiled)(name=>name==='./server-access'?{ownerContext:async()=>({client,actor:A.actor,hotel:{id:A.id,nome:'FICTICIO',status:'ativo'}})}:name==='./v2/domain'?domain:name==='./v2/catalog'?{draftCatalog:catalog}:(()=>{throw Error(name)})(),m,m.exports)
  const workspace=await m.exports.getWorkspace('',true)
  assert.equal(workspace.day,'2025-12-31');assert.equal(workspace.anchor,'2025-12-31');assert.equal(writes.length,0)
  const saved=await m.exports.saveDraft(A.id,draft,draft.text,true,profile.dna_version,'Humano')
  assert.equal(saved.editorial_review.reviewed_on,'2025-12-31')
  assert.match(await m.exports.getExport(A.id,saved.id,saved.revision),/Humano/)
  instant='2026-01-01T05:00:00Z'
  assert.equal((await m.exports.getWorkspace('',true)).day,'2026-01-01')
  await assert.rejects(m.exports.getExport(A.id,saved.id,saved.revision))
  await assert.rejects(m.exports.saveDraft(A.id,saved,saved.text,true,profile.dna_version))
  assert.equal(writes.length,1)
  const unapproved=await m.exports.saveDraft(A.id,saved,'Intencao humana preservada',false)
  assert.equal(unapproved.text,'Intencao humana preservada');assert.equal(unapproved.editorial_review,null)
 } finally {globalThis.Date=RealDate}
})
