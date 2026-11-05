/** Local-only synthetic LAB. Explicit mode; no SDK, credentials or external requests. */
import http from 'node:http'
import fs from 'node:fs'
import {LabStore} from './adapter.mjs'
import {fixture,anchor} from './fixtures.mjs'
if(process.env.HOTEL_MODE!=='lab')throw Error('EXPLICIT_LAB_REQUIRED: HOTEL_MODE=lab required; operational app remains separate.')
if(!process.env.HOTEL_LAB_STATE)throw Error('LAB_STATE_PATH_REQUIRED: choose a synthetic JSON file outside source.')
const store=new LabStore({mode:process.env.HOTEL_MODE,filename:process.env.HOTEL_LAB_STATE}),port=Number(process.env.PORT??4177)
const assets={'/':['index.html','text/html; charset=utf-8'],'/client.js':['client.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']}
const server=http.createServer(async(req,res)=>{let status=200,result;const host=req.headers.host??'',origin=req.headers.origin
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store')
 try{
  if(!/^127\.0\.0\.1:\d+$/.test(host)||origin&&origin!=='http://'+host||req.headers['sec-fetch-site']==='cross-site')throw Error('LAB_ORIGIN_DENIED')
  const url=new URL(req.url,'http://'+host)
  if(req.method==='GET'&&assets[url.pathname]){const[file,type]=assets[url.pathname];res.setHeader('Content-Type',type);return res.end(fs.readFileSync(new URL(file,import.meta.url)))}
  if(req.method==='GET'&&url.pathname==='/api/workspace'){const owner=url.searchParams.get('owner')??'A';result={...store.workspace(owner,url.searchParams.get('anchor')??anchor),example:fixture(owner).snapshot,lab_clock:anchor}}
  else if(req.method==='POST'&&url.pathname.startsWith('/api/')){
   if(!req.headers['content-type']?.startsWith('application/json'))throw Error('JSON_REQUIRED')
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>100000)throw Error('REQUEST_TOO_LARGE')}const b=JSON.parse(raw),options={fault:b.fault},owner=b.owner??'A',args=b.args??{}
   switch(url.pathname){case'/api/onboarding':result=store.saveOnboarding(owner,args,options);break;case'/api/window':result=store.createWindow(owner,args,options);break;case'/api/save':result=store.saveDraft(owner,args,options);break;case'/api/export':result={text:store.getExport(owner,args),not_published:true};break;case'/api/record':result=store.recordExport(owner,args,options);break;case'/api/scenario':result=store.scenario(owner,args,options);break;default:status=404;result={error:'NOT_FOUND'}}
  }else{status=404;result={error:'NOT_FOUND'}}
 }catch(e){status=409;result={synthetic:true,error:e.code??e.message,message:e.message}}
 res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result))
})
server.listen(port,'127.0.0.1',()=>console.log('HOTEL_SYNTHETIC_LAB_READY http://127.0.0.1:'+server.address().port))
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(()=>process.exit(0)))
