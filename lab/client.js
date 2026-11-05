'use strict'
// Browser UI only. All factual/export policy stays in the shared server-side domain.
const $=id=>document.getElementById(id),state={owner:'A',w:null,selected:null,expected:1,remote:null,busy:false,profileRevision:0,module:null,exportArgs:null,context:0,intent:0,unsaved:false}
const key=kind=>`hotel-lab:${state.owner}:${state.w?.hotel.id??'none'}:${kind}`
const editorKey=()=>key('draft:'+state.selected)
function tell(message){$('message').textContent=message}
function restore(k){try{return JSON.parse(sessionStorage.getItem(k)??'null')}catch{return null}}
function keepText(){if(state.selected)sessionStorage.setItem(editorKey(),JSON.stringify({text:$('text').value,title:$('title').value,expected:state.expected,dirty:state.unsaved}))}
function keepProfile(){if(state.w)sessionStorage.setItem(key('profile'),JSON.stringify({text:$('snapshot').value,revision:state.profileRevision,module:state.module}))}
async function api(route,args={},fault='',owner=state.owner){const response=await fetch('/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner,args,fault})}),body=await response.json();if(!response.ok)throw Error(body.error+': '+body.message);return body}
async function run(fn){if(state.busy)return;state.busy=true;document.querySelectorAll('button,select').forEach(x=>x.disabled=true);try{await fn()}catch(e){tell(e.message+'\nTexto/campos locais preservados. Não foi presumido sucesso.')}finally{state.busy=false;document.querySelectorAll('button,select').forEach(x=>x.disabled=false)}}
function draft(){return state.w?.drafts.find(d=>d.id===state.selected)}
function capture(){return{owner:state.owner,context:state.context,selected:state.selected,intent:state.intent}}
function sameContext(shot){return shot.owner===state.owner&&shot.context===state.context&&shot.selected===state.selected}
function sameIntent(shot){return sameContext(shot)&&shot.intent===state.intent}
function clearExport(){state.exportArgs=null;$('export-label').hidden=true;$('export-text').value=''}
function clearRemote(){state.remote=null;$('remote-title').textContent='';$('remote-label').hidden=true;$('remote').value=''}
function invalidateEditorial(){if(state.selected)state.unsaved=true;clearExport()}
function invalidate(){state.intent++;invalidateEditorial()}
function showRemote(){state.remote=draft()??null;$('remote').value=state.remote?.text??'';$('remote-title').textContent=state.remote?.title??'';$('remote-label').hidden=!state.remote}
function showRemoteProfile(){$('profile-remote').textContent=JSON.stringify({revision:state.w.revision,answers:state.w.answers},null,2);$('profile-remote').hidden=false}
function choose(id,{fresh=false,preserveEditor=false}={}){
 const same=id===state.selected;if(state.selected&&!fresh)keepText();if(!same)state.context++;state.selected=id;const d=draft()
 if(!d){clearRemote();clearExport();$('text').value='';$('title').value='';$('review').checked=false;$('draft-info').textContent='';return}
 if(!same||!preserveEditor){const buffer=fresh?null:restore(editorKey());$('text').value=buffer?.text??d.text;$('title').value=buffer?.title??d.title;state.expected=buffer?.expected??d.revision;state.unsaved=buffer?.dirty??($('text').value!==d.text||$('title').value!==d.title||state.expected!==d.revision);clearRemote();clearExport();$('review').checked=false}
 $('draft-title').textContent=d.date+' · '+d.title;$('draft-info').textContent=`RASCUNHO salvo r${d.revision}, edição espera r${state.expected}. ${d.intention==='preparar'?'Preparação sem obrigação de publicar':'Sugestão, não agendada'}. ${d.format}, ${d.minutes} minutos.`
 document.querySelectorAll('#cards button').forEach(b=>b.classList.toggle('selected',b.dataset.id===id))
}
function isOwnProfileReceipt(w,own){const r=own?.receipt;return r?.complete===true&&r.module===4&&w.hotel.id===r.hotel_id&&w.hotel.complete===true&&w.lastModule===4&&w.revision===r.revision&&w.profile?.dna_version===`hotel-recomposed:${r.hotel_id}:r${r.revision}`&&JSON.stringify(w.answers)===JSON.stringify(own.snapshot)}
async function refresh({initial=false,fresh=false,preserveEditor=false,guard=capture(),ownOnboarding=null}={}){
 const response=await fetch('/api/workspace?owner='+guard.owner),w=await response.json();if(!sameContext(guard))return false;if(!response.ok)throw Error(w.message)
 // Own exact receipt changes editorial validity, not the generation of human input.
 // External/unknown profile changes still invalidate pending intention.
 if(state.selected&&state.w?.profile?.dna_version!==w.profile?.dna_version){if(isOwnProfileReceipt(w,ownOnboarding))invalidateEditorial();else invalidate();$('review').checked=false}
 const changedIntent=state.intent!==guard.intent;state.w=w;$('summary').textContent=`${w.hotel.nome} · ${w.hotel.status} · perfil r${w.revision}`;$('facts').textContent=JSON.stringify(w.profile??{aviso:'DNA ausente; texto histórico preservado, aprovação/exportação negadas.'},null,2);$('events').textContent=JSON.stringify(w.events,null,2)
 if(initial&&!changedIntent){const p=restore(key('profile'));$('snapshot').value=p?.text??JSON.stringify(Object.keys(w.answers).length?w.answers:w.example,null,2);state.profileRevision=p?.revision??w.revision;state.module=p?.module??(w.hotel.complete?null:Math.min(4,w.lastModule+1));keepProfile()}
 else if(initial&&changedIntent){state.module??=1;keepProfile();showRemoteProfile()}
 $('onboard').textContent=state.module?'Salvar módulo '+state.module:'Perfil concluído; reabra para reconfirmar';$('cards').replaceChildren()
 for(const d of w.drafts){const button=document.createElement('button');button.textContent=`${d.date} · ${d.title} · r${d.revision}`;button.dataset.id=d.id;button.onclick=()=>choose(d.id);$('cards').append(button)}
 if(w.drafts.length){choose(w.drafts.some(d=>d.id===state.selected)?state.selected:w.drafts[0].id,{fresh:fresh&&!changedIntent,preserveEditor:preserveEditor||changedIntent})}
 else{if(state.selected)state.context++;state.selected=null;state.expected=1;state.unsaved=false;clearRemote();clearExport();$('text').value='';$('title').value='';$('review').checked=false;$('draft-info').textContent='';$('draft-title').textContent='Sem janela salva neste proprietário fictício'}
 return true
}
$('title').oninput=()=>{invalidate();keepText();$('review').checked=false};$('snapshot').oninput=()=>{invalidate();keepProfile()};$('text').oninput=()=>{invalidate();keepText();$('review').checked=false};$('review').onchange=()=>{invalidate();keepText()}
$('owner').onchange=()=>run(async()=>{keepText();keepProfile();state.context++;state.owner=$('owner').value;state.selected=null;state.w=null;state.expected=1;state.unsaved=false;state.profileRevision=0;state.module=null;clearRemote();clearExport();$('text').value='';$('title').value='';$('review').checked=false;$('draft-info').textContent='';$('snapshot').value='';$('profile-remote').textContent='';$('profile-remote').hidden=true;$('facts').textContent='';$('events').textContent='';await refresh({initial:true});tell('Proprietário fictício '+state.owner+' selecionado. Isso não é login nem teste de RLS.')})
$('reload').onclick=()=>run(async()=>{keepText();await refresh();tell('Leitura atualizada; buffers locais mantidos. Compare explicitamente para escolher revisão.')})
$('onboard').onclick=()=>run(async()=>{
 if(!state.module)throw Error('Clique Reabrir/reconfirmar primeiro.')
 const shot=capture(),args={module:state.module,snapshot:JSON.parse($('snapshot').value),revision:state.profileRevision,hotelId:state.w.hotel.id},attemptKey=key('attempt'),old=restore(attemptKey),signature=JSON.stringify(args)
 let attempt=old;if(old&&old.signature!==signature)throw Error('ATTEMPT_CHANGED: há tentativa anterior com outros campos. Compare a ficha remota e escolha manter local para uma nova tentativa.')
 if(!attempt){attempt={signature,args:{...args,operationId:crypto.randomUUID()}};sessionStorage.setItem(attemptKey,JSON.stringify(attempt))}
 const receipt=await api('onboarding',attempt.args,$('fault').value,shot.owner),sent=attempt.args
 if(receipt.hotel_id!==sent.hotelId||receipt.module!==sent.module||receipt.revision!==sent.revision+1||receipt.complete!==(sent.module===4)||receipt.operation_id!==sent.operationId)throw Error('INVALID_RECEIPT')
 if(!sameContext(shot))return
 await refresh({preserveEditor:true,guard:shot,ownOnboarding:{receipt,snapshot:sent.snapshot}});if(!sameContext(shot))return
 if(!sameIntent(shot)||state.w.revision!==receipt.revision||JSON.stringify(state.w.answers)!==JSON.stringify(sent.snapshot)){keepProfile();showRemoteProfile();tell('A ficha enviada foi salva, mas há intenção/edição local posterior ou mudança externa. Campos e revisão esperada preservados; compare antes de avançar.');return}
 sessionStorage.removeItem(attemptKey);state.profileRevision=receipt.revision;state.module=receipt.complete?null:receipt.module+1;keepProfile();$('onboard').textContent=state.module?'Salvar módulo '+state.module:'Perfil concluído; reabra para reconfirmar'
 tell(`Recibo confirmado: módulo ${receipt.module}, r${receipt.revision}. ${receipt.complete?'Novo DNA confirmado; rascunhos anteriores preservados.':'Próximo módulo liberado.'}`)
})
$('reconfirm').onclick=()=>{invalidate();state.module=1;keepProfile();$('onboard').textContent='Salvar módulo 1';tell('Reconfirmação reaberta. Os fatos atuais só receberão nova identidade após confirmar o módulo 4.')}
$('load-remote-profile').onclick=()=>run(async()=>{await refresh();$('profile-remote').textContent=JSON.stringify({revision:state.w.revision,answers:state.w.answers},null,2);$('profile-remote').hidden=false;tell('Ficha remota exibida abaixo. Seu JSON local não foi substituído.')})
$('reapply-profile').onclick=()=>{invalidate();state.profileRevision=state.w.revision;sessionStorage.removeItem(key('attempt'));keepProfile();tell('Campos locais mantidos sobre a revisão remota conhecida. Revise e salve explicitamente; nenhuma escrita automática.')}
$('window').onclick=()=>run(async()=>{const opKey=key('window-op');let op=sessionStorage.getItem(opKey);if(!op){op=crypto.randomUUID();sessionStorage.setItem(opKey,op)}await api('window',{anchor:state.w.lab_clock,operationId:op});sessionStorage.removeItem(opKey);await refresh();tell('Janela completa lida: sete datas, nenhum post foi publicado.')})
$('save').onclick=()=>run(async()=>{
 const d=draft();if(!d)throw Error('Selecione rascunho.');keepText();const shot=capture(),submittedKey=editorKey(),args={draftId:d.id,hotelId:state.w.hotel.id,revision:state.expected,text:$('text').value,title:$('title').value,confirmExact:$('review').checked,expectedDnaVersion:state.w.profile?.dna_version}
 try{await api('save',args,'',shot.owner)}catch(e){if(sameContext(shot)&&e.message.includes('REVISION_CONFLICT'))await compareRemote();throw e}
 if(!sameContext(shot))return
 await refresh({preserveEditor:true,guard:shot});if(!sameContext(shot))return
 if(!sameIntent(shot)){keepText();showRemote();tell('A revisão enviada foi salva, mas há intenção/edição local posterior. Seu buffer e revisão esperada continuam aqui; compare e escolha como reaplicar.');return}
 sessionStorage.removeItem(submittedKey);choose(d.id,{fresh:true});tell('Revisão salva. '+(draft().editorial_review?'Aceite exato registrado; ainda não publicado.':'Texto não aprovado, sem exportação.'))
})
async function compareRemote(){keepText();const shot=capture();await refresh({preserveEditor:true,guard:shot});if(!sameContext(shot))return;showRemote();keepText();tell('Remoto comparado, texto local preservado. Escolha manter/mesclar ou descartar explicitamente.')}
$('compare').onclick=()=>run(compareRemote)
$('reapply').onclick=()=>{if(!state.remote)return tell('Compare remoto primeiro.');invalidate();state.expected=state.remote.revision;keepText();$('review').checked=false;tell('Texto local mantido sobre r'+state.expected+'. Revise e salve explicitamente.')}
$('discard').onclick=()=>{if(!state.remote)return tell('Compare remoto primeiro.');invalidate();$('text').value=state.remote.text;$('title').value=state.remote.title;state.expected=state.remote.revision;state.unsaved=false;sessionStorage.removeItem(editorKey());$('review').checked=false;tell('Você escolheu descartar local e usar remoto. Nenhuma nova escrita.')}
$('export').onclick=()=>run(async()=>{
 const d=draft();if(!d||state.unsaved||$('text').value!==d.text||$('title').value!==d.title||state.expected!==d.revision)throw Error('Salve/compare a revisão local antes de exportar.')
 const shot=capture(),args={draftId:d.id,revision:d.revision,hotelId:state.w.hotel.id},verified=await api('export',args,'',shot.owner)
 if(!sameIntent(shot)){if(sameContext(shot))tell('Exportação anterior não aplicada: há edição/intenção local posterior. Salve e revise o texto atual.');return}
 $('export-text').value=verified.text;$('export-label').hidden=false;const exportArgs={...args,operationId:crypto.randomUUID()};state.exportArgs=exportArgs
 try{await navigator.clipboard.writeText(verified.text)}catch{if(sameIntent(shot))tell('Cópia automática indisponível. Texto verificado disponível abaixo para selecionar/copiar manualmente; nenhum EXPORTED registrado.');return}
 if(!sameIntent(shot)){if(sameContext(shot))tell('Cópia da revisão anterior terminou; edição atual preservada e nenhum histórico novo foi registrado.');return}
 await api('record',exportArgs,'',shot.owner);if(!sameContext(shot))return;state.exportArgs=null;await refresh({preserveEditor:true,guard:shot});if(sameContext(shot))tell('Copiado e registrado EXPORTED da revisão enviada no LAB, nunca publicado.')
})
$('export-text').onfocus=e=>e.target.select()
$('manual-record').onclick=()=>run(async()=>{if(!state.exportArgs)throw Error('Verifique uma exportação e copie manualmente antes.');const shot=capture(),args={...state.exportArgs};await api('record',args,'',shot.owner);if(!sameContext(shot))return;state.exportArgs=null;await refresh({preserveEditor:true,guard:shot});if(sameContext(shot))tell('Você informou a cópia manual; EXPORTED sintético da revisão enviada registrado, sem publicação.')})
for(const b of document.querySelectorAll('[data-scenario],[data-status]'))b.onclick=()=>run(async()=>{keepText();await api('scenario',b.dataset.status?{kind:'status',value:b.dataset.status}:{kind:b.dataset.scenario});await refresh();tell('Cenário LAB aplicado explicitamente. Texto histórico mantido. A exportação será revalidada pelo domínio compartilhado.')})
run(async()=>{await refresh({initial:true});tell('LAB explicitamente ativo. Comece pelos quatro módulos fictícios A ou B.')})
