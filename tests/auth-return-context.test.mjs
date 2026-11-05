import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'
import {safeAuthReturn} from '../lib/hotel/v2/domain.ts'
const ts=createRequire(import.meta.url)('typescript')
function middleware(user=null){
 const mod={exports:{}},code=ts.transpileModule(fs.readFileSync('lib/supabase/middleware.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 const response={next:()=>({cookies:{set(){}}}),redirect:url=>new Response(null,{status:307,headers:{location:String(url)}})}
 new Function('require','module','exports',code)(name=>name==='./config'?{publicConfig:()=>({url:'https://synthetic.invalid',key:'synthetic-public-test-key'})}:name==='@supabase/ssr'?{createServerClient:()=>({auth:{getUser:async()=>({data:{user}})}})}:name==='next/server'?{NextResponse:response}:name==='../hotel/v2/domain'?{safeAuthReturn}:null,mod,mod.exports)
 return mod.exports.updateSession
}
test('unauthenticated middleware preserves the local editor return query through login',async()=>{
 const updateSession=middleware()
 for(const path of ['/dashboard/post-do-dia?actor=A&hotel=H&anchor=2026-10-23&draft=H%3A2026-10-23%3A5','/onboarding?step=3','/admin?hotel=synthetic']){
  const url=new URL(path,'http://localhost:7777');url.clone=()=>new URL(url)
  const result=await updateSession({nextUrl:url,cookies:{getAll:()=>[],set(){}}}),login=new URL(result.headers.get('location'))
  assert.equal(result.status,307);assert.equal(login.pathname,'/auth/login');assert.equal(login.origin,url.origin)
  assert.equal(safeAuthReturn(login.searchParams.get('next'),url.origin),url.pathname+url.search)
 }
})

test('already authenticated login keeps the editor return when another tab restored the session',async()=>{
 const updateSession=middleware({id:'synthetic-owner'}),target='/dashboard/post-do-dia?actor=A&hotel=H&anchor=2026-10-23&draft=H%3A2026-10-23%3A5'
 const url=new URL('/auth/login?'+new URLSearchParams({next:target}),'http://localhost:7777');url.clone=()=>new URL(url)
 const result=await updateSession({nextUrl:url,cookies:{getAll:()=>[],set(){}}})
 assert.equal(result.headers.get('location'),new URL(target,url.origin).href)
})
test('authenticated login never loops into login or register and never redirects outside this origin',async()=>{
 const updateSession=middleware({id:'synthetic-owner'})
 for(const target of ['/auth/login?next=/auth/login','/auth/register','https://evil.invalid','//evil.invalid','/\\evil.invalid']){
  const url=new URL('/auth/login?'+new URLSearchParams({next:target}),'http://localhost:7777');url.clone=()=>new URL(url)
  const result=await updateSession({nextUrl:url,cookies:{getAll:()=>[],set(){}}}),location=new URL(result.headers.get('location'))
  assert.equal(location.origin,url.origin);assert.equal(location.pathname,'/dashboard')
 }
})
