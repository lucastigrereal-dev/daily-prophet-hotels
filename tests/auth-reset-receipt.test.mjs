import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createRequire} from 'node:module'

const require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server')
// Execute the actual reset component with controlled auth promises; no network or auth/RLS proof.
function resetPage(auth){
 const states=[];let cursor=0
 const hooks={...React,useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return[states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value}]}}
 const mod={exports:{}},code=ts.transpileModule(fs.readFileSync('app/auth/reset/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText
 new Function('require','module','exports',code)(name=>name==='react'?hooks:name==='next/link'?{__esModule:true,default:'a'}:name==='@/lib/supabase/client'?{createClient:()=>({auth})}:require(name),mod,mod.exports)
 const tree=()=>{cursor=0;return mod.exports.default()}
 return{tree,html:()=>renderToStaticMarkup(tree())}
}
function descendants(node){if(!node||typeof node!=='object')return[];return[node,...React.Children.toArray(node.props?.children).flatMap(descendants)]}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject}}

for(const failure of ['returned error','rejected promise'])test('reset receipt waits for logout and retries only logout after '+failure,async()=>{
 let saves=0,sessionReads=0;const pending=[]
 const auth={getUser:async()=>{sessionReads++;return{data:{user:{id:'synthetic-owner'}}}},updateUser:async()=>{saves++;return{error:null}},signOut:()=>{const operation=deferred();pending.push(operation);return operation.promise}}
 const ui=resetPage(auth)
 for(const id of ['reset-password','reset-confirm'])descendants(ui.tree()).find(node=>node.props?.id===id).props.onChange({target:{value:'synthetic-password-only'}})
 const submission=ui.tree().props.onSubmit({preventDefault(){}})
 await new Promise(resolve=>setImmediate(resolve))
 assert.equal(saves,1);assert.equal(pending.length,1)
 let html=ui.html()
 assert.doesNotMatch(html,/sessão encerrada/,'pending logout must not claim a completed session termination')
 assert.match(html,/Encerrando a sessão/)
 assert.doesNotMatch(html,/synthetic-password-only/)
 assert.equal(descendants(ui.tree()).some(node=>node.props?.id==='reset-password'),false)
 if(failure==='returned error')pending[0].resolve({error:Error('synthetic logout failure')});else pending[0].reject(Error('synthetic transport failure'))
 await submission
 html=ui.html();assert.match(html,/Senha alterada/);assert.match(html,/não foi confirmado/);assert.doesNotMatch(html,/sessão encerrada/)
 const retry=descendants(ui.tree()).find(node=>node.type==='button'&&node.props.children==='Tentar encerrar a sessão')
 assert.ok(retry);assert.equal(retry.props.type,'button');assert.equal(retry.props.disabled,false)
 const retrying=retry.props.onClick()
 assert.equal(pending.length,2);assert.equal(saves,1);assert.equal(sessionReads,1)
 assert.match(ui.html(),/Encerrando a sessão/);assert.doesNotMatch(ui.html(),/sessão encerrada/)
 pending[1].resolve({error:null});await retrying
 assert.match(ui.html(),/Alteração confirmada e sessão encerrada/)
 assert.equal(saves,1);assert.equal(sessionReads,1);assert.equal(pending.length,2)
 assert.equal(descendants(ui.tree()).some(node=>node.type==='button'&&node.props.children==='Tentar encerrar a sessão'),false)
})
