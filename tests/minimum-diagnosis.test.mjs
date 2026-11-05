import test from 'node:test'
import assert from 'node:assert/strict'
import * as d from '../lib/hotel/v2/domain.ts'
import {fixture} from './fixtures.mjs'
test('completion refuses every omitted minimum without inventing an authorization',()=>{
 const a=fixture();for(const key of Object.keys(a.snapshot.modulo_2.diagnostico)){const s=structuredClone(a.snapshot);delete s.modulo_2.diagnostico[key];assert.throws(()=>d.profileFrom(s,a.id,5),/Confirme motivo/)}
})
test('minimum human text and explicit capability survive profile construction',()=>{
 const a=fixture(),s=structuredClone(a.snapshot);s.modulo_2.diagnostico.promessa='  Nossa promessa humana  ';s.modulo_2.diagnostico.pessoas_autorizadas=true
 const p=d.profileFrom(s,a.id,5);assert.equal(p.people,true);assert.equal(p.photography,false);assert.equal(p.diagnosis.promessa,'Nossa promessa humana');assert.equal(p.facts.promessa,undefined);assert.deepEqual(a.profile.diagnosis,a.snapshot.modulo_2.diagnostico)
})
test('string booleans and oversized human inputs cannot complete diagnosis',()=>{const a=fixture();for(const bad of [{pessoas_autorizadas:'false'},{promessa:'a'.repeat(1001)},{canal_consulta:' '}])assert.throws(()=>d.minimumDiagnosis({...a.snapshot.modulo_2.diagnostico,...bad}),/Confirme motivo/)})
test('prior active profiles need explicit minimum reconfirmation without changing stored human data',()=>{const a=fixture(),p=structuredClone(a.profile);delete p.diagnosis;const before=JSON.stringify(p);assert.equal(d.hasEditorialProfile(p),false);assert.equal(JSON.stringify(p),before)})
test('unicode codepoints and whitespace follow the diagnosis contract',()=>{const a=fixture().snapshot.modulo_2.diagnostico;assert.equal(d.minimumDiagnosis({...a,promessa:'😀'.repeat(600)}).promessa.length,1200);for(const blank of ['\t','\u00a0','\ufeff'])assert.throws(()=>d.minimumDiagnosis({...a,promessa:blank}),/Confirme motivo/)})
