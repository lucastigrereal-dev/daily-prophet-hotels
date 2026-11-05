import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const files=execFileSync('git',['ls-files','-z']).toString().split('\0').filter(Boolean),findings=[]
for(const file of files){let text;try{text=fs.readFileSync(file,'utf8')}catch{continue}if(text.includes('\0'))continue
 for(const [i,line] of text.split('\n').entries()){
  for(const token of line.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){let role;try{role=JSON.parse(Buffer.from(token.split('.')[1],'base64url')).role}catch{role='UNPARSED'}findings.push({file,line:i+1,kind:'JWT',public_role_only:role==='anon',blocked:role!=='anon'})}
  if(/\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{20,}|sb_secret_[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/.test(line))findings.push({file,line:i+1,kind:'possible secret',blocked:true})
 }
}
console.log(JSON.stringify({scope:'tracked files; values never logged',findings,blocked:findings.some(x=>x.blocked)},null,2))
if(findings.some(x=>x.blocked))process.exitCode=1
