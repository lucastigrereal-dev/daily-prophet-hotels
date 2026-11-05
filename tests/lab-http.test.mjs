import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawn} from 'node:child_process'
import {setTimeout as delay} from 'node:timers/promises'
import {fixture} from './fixtures.mjs'
async function start(filename){const child=spawn(process.execPath,['lab/server.mjs'],{env:{...process.env,HOTEL_MODE:'lab',HOTEL_LAB_STATE:filename,PORT:'0'},stdio:['ignore','pipe','pipe']});let log='';child.stdout.on('data',c=>log+=c);child.stderr.on('data',c=>log+=c);for(let i=0;i<100;i++){const match=log.match(/HOTEL_SYNTHETIC_LAB_READY (http:\/\/127\.0\.0\.1:\d+)/);if(match)return{child,url:match[1]};if(child.exitCode!==null)throw Error(log);await delay(50)}child.kill();throw Error('LAB failed to start: '+log)}
async function stop(child){child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve()},2000).unref()})}
test('LAB HTTP local adapter demonstrates rollback, retry, A/B, exact export, revocation, suspension and restart; not auth/RLS',{timeout:20000},async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hotel-http-')),filename=path.join(dir,'synthetic.json');let running
 try{running=await start(filename);let url=running.url
  const get=async(owner='A')=>{const r=await fetch(url+'/api/workspace?owner='+owner);assert.equal(r.status,200);return r.json()}
  const post=async(route,args,owner='A',fault='')=>{const r=await fetch(url+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner,args,fault})});return{status:r.status,body:await r.json()}}
  const html=await fetch(url+'/');assert.equal(html.status,200);assert.match(await html.text(),/LAB sintético/);assert.match(html.headers.get('content-security-policy'),/script-src 'self'/)
  const foreign=await fetch(url+'/api/scenario',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://not-the-lab.invalid'},body:JSON.stringify({owner:'A',args:{kind:'revoke'}})});assert.equal(foreign.status,409)
  const a=fixture();for(let module=1;module<=3;module++)assert.equal((await post('onboarding',{module,snapshot:a.snapshot,revision:module-1,operationId:'m'+module})).status,200)
  const completion={module:4,snapshot:a.snapshot,revision:3,operationId:'m4'};assert.equal((await post('onboarding',completion,'A','after_profile')).status,409);let w=await get();assert.equal(w.revision,3);assert.equal(w.hotel.complete,false);assert.equal(w.profile,null)
  assert.equal((await post('onboarding',completion)).body.complete,true);assert.equal((await post('onboarding',completion)).body.revision,4);assert.equal((await get()).events.filter(x=>x.event==='ONBOARDING_SAVED').length,4)
  const rows=(await post('window',{anchor:'2026-10-23',operationId:'window'})).body;assert.equal(rows.length,7);assert.equal((await get('B')).drafts.length,0);const original=rows[0],profile=(await get()).profile
  const edit={draftId:original.id,revision:1,text:original.text,confirmExact:true,expectedDnaVersion:profile.dna_version};const saved=(await post('save',edit)).body;assert.equal(saved.revision,2);assert.equal((await post('save',edit,'B')).status,409)
  const args={draftId:saved.id,revision:saved.revision,operationId:'copy'};assert.match((await post('export',args)).body.text,/revisão 2/);assert.equal((await post('record',args)).status,200);assert.equal((await post('record',args)).status,200);assert.equal((await get()).events.filter(x=>x.event==='EXPORTED').length,1)
  await stop(running.child);running=await start(filename);url=running.url;assert.equal((await get()).drafts[0].text,original.text);assert.equal((await get()).events.filter(x=>x.event==='EXPORTED').length,1)
  assert.equal((await post('scenario',{kind:'revoke'})).status,200);assert.equal((await post('export',args)).status,409);assert.equal((await post('record',{...args,operationId:'denied'})).status,409);assert.equal((await get()).events.filter(x=>x.event==='EXPORTED').length,1)
  await post('scenario',{kind:'missing_dna'});const human='  TEXTO HUMANO HTTP\n preservado  ';assert.equal((await post('save',{draftId:saved.id,revision:2,text:human})).body.text,human);assert.equal((await get()).drafts[0].text,human)
  await post('scenario',{kind:'status',value:'pausado'});assert.equal((await post('save',{draftId:saved.id,revision:3,text:'blocked'})).status,409);assert.equal((await get()).drafts[0].text,human)
 }finally{if(running)await stop(running.child);fs.rmSync(dir,{recursive:true,force:true})}
})
test('LAB cannot start by operational config failure or implicit default mode',{timeout:5000},async()=>{const child=spawn(process.execPath,['lab/server.mjs'],{env:{...process.env,HOTEL_MODE:'',HOTEL_LAB_STATE:''},stdio:['ignore','pipe','pipe']});let log='';child.stderr.on('data',c=>log+=c);const code=await new Promise(resolve=>child.once('exit',resolve));assert.notEqual(code,0);assert.match(log,/EXPLICIT_LAB_REQUIRED/)})
