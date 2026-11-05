import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {spawn} from 'node:child_process'
import {setTimeout as delay} from 'node:timers/promises'
const publicKey='sb_publishable_'+'synthetic_public_key_'.repeat(3)
for(const [name,url,key] of [['both missing','',''],['URL missing','',publicKey],['key missing','https://lab.invalid',''],['invalid URL','not-a-url',publicKey],['HTTP refused','http://lab.invalid',publicKey],['placeholder refused','https://example.supabase.co',publicKey],['secret refused','https://lab.invalid','sb_secret_'+ 'x'.repeat(40)],['malformed JWT refused','https://lab.invalid','x'.repeat(60)]])
test('built runtime rejects configuration: '+name,{skip:!fs.existsSync('.next/BUILD_ID'),timeout:25000},async()=>{
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','0'],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',NEXT_PUBLIC_SUPABASE_URL:url,NEXT_PUBLIC_SUPABASE_ANON_KEY:key},stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',c=>output+=c);child.stderr.on('data',c=>output+=c)
 try{let url;for(let i=0;i<160;i++){const match=output.match(/127\.0\.0\.1:(\d+)/);if(match&&Number(match[1])>0&&output.includes('Ready')){url=`http://127.0.0.1:${match[1]}`;break}if(child.exitCode!==null)throw Error('Runtime failed: '+output);await delay(100)}assert.ok(url,'Next runtime ready: '+output);for(const path of ['/login','/dashboard/post-do-dia','/onboarding']){const response=await fetch(url+path);assert.equal(response.status,503);assert.match(await response.text(),/Configuração operacional ausente ou inválida/)}
 }finally{child.kill('SIGTERM');await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(()=>{child.kill('SIGKILL');resolve()},2000).unref()})}
})
