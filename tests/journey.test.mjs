import test from 'node:test';
import assert from 'node:assert/strict';
import {TEMPLATES,agreementDraft,recordLink,parseRecordLink,digest,checkRecord,readStored} from '../src/journey-model.js';
const address='0x'+'1'.repeat(40);
async function records(){
 const terms={protocol:'scopeledger/1',id:'1',title:'Сайт “Київ”',creator:address,counterparty:'0x'+'2'.repeat(40),clauses:['Build five pages.'],exclusions:'Payments are excluded.',parent_id:''};
 const a={...terms,terms_hash:await digest(terms),status:'ACTIVE',request_ids:['1']};
 const r={id:'1',agreement_id:'1',terms_hash:a.terms_hash,request_text:'Please add card payments.',reviews:[],decision:''};
 r.request_hash=await digest({agreement_hash:a.terms_hash,request:r.request_text});
 return {a,r};
}
test('share link round trips exact record and removes unrelated query data',()=>{
 const link=recordLink('https://example.test/?secret=ignore#old',{contract:address,agreement:'23',request:'42'});
 assert.equal(new URL(link).search,'');
 assert.deepEqual(parseRecordLink(new URL(link).hash),{contract:address,agreement:'23',request:'42'});
 assert.throws(()=>parseRecordLink('#record?contract='+address+'&agreement=-1'));
 assert.throws(()=>parseRecordLink('#record?contract='+address+'&agreement=1&request=4294967296'));
 assert.equal(parseRecordLink('#other'),null);
});
test('templates produce valid trimmed agreements',()=>{for(const t of Object.values(TEMPLATES))assert.equal(agreementDraft(t,address).clauses.length,2);assert.throws(()=>agreementDraft({...TEMPLATES.website,clauses:''},address));});
test('corrupt draft storage is recoverable',()=>assert.deepEqual(readStored({getItem:()=>'{broken'},'key',{}),{}));
test('valid pending record and both review rounds verify; disagreement is preserved',async()=>{
 const {a,r}=await records();await checkRecord(a,r);
 const review={label:'CHANGE_ORDER',basis_ids:[0],scope_quote:'Payments are excluded.',request_quote:'card payments',terms_hash:a.terms_hash,request_hash:r.request_hash};
 r.reviews=[review];r.decision='CHANGE_ORDER';await checkRecord(a,r);
 r.reviews.push({...review,label:'NEEDS_CLARIFICATION'});r.decision='NEEDS_CLARIFICATION';await checkRecord(a,r);
 r.decision='CHANGE_ORDER';await assert.rejects(()=>checkRecord(a,r),/history/);
});
test('tampered terms, request, links and invented evidence fail closed',async()=>{
 const {a,r}=await records();await assert.rejects(()=>checkRecord({...a,title:'Tampered'},r),/fingerprint/);
 await assert.rejects(()=>checkRecord(a,{...r,request_text:'Another request'}),/fingerprint/);
 await assert.rejects(()=>checkRecord(a,{...r,agreement_id:'2'}),/linked/);
 const reviewed={...r,decision:'IN_SCOPE',reviews:[{label:'IN_SCOPE',basis_ids:[1],scope_quote:'Invented quote',request_quote:'card payments',terms_hash:a.terms_hash,request_hash:r.request_hash}]};
 await assert.rejects(()=>checkRecord(a,reviewed),/quoted clause/);
 reviewed.reviews[0].basis_ids=[];reviewed.reviews[0].scope_quote='';await assert.rejects(()=>checkRecord(a,reviewed),/quoted clause/);
});
