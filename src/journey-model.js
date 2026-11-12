import {validateAgreement} from './domain.js';

export const TEMPLATES = {
  website: {name:'Website', title:'Website launch', clauses:'Build a responsive five-page marketing website in English.\nInclude two rounds of visual revisions before launch.', exclusions:'E-commerce, payment processing and additional languages are excluded.', request:'Please add a product shop with checkout and credit card payments before launch.'},
  design: {name:'Design', title:'Brand identity', clauses:'Deliver one logo design in SVG and PNG formats.\nInclude two rounds of revisions to the selected logo concept.', exclusions:'Website design, printed materials and new logo concepts after approval are excluded.', request:'Please also design a six-page brochure using the new logo.'},
  software: {name:'Development', title:'CSV reporting tool', clauses:'Build a tool that imports a CSV file and displays monthly totals.\nSupport one user running the tool locally in a browser.', exclusions:'User accounts, cloud synchronization and scheduled emails are excluded.', request:'Please add user accounts and a daily emailed report.'}
};

export function readStored(storage,key,fallback){
  try { return JSON.parse(storage.getItem(key)??'null')??fallback; } catch { return fallback; }
}
export function agreementDraft(draft, counterparty){
  const result={title:draft.title.trim(),counterparty,clauses:draft.clauses.split('\n').map(x=>x.trim()).filter(Boolean),exclusions:draft.exclusions.trim()};
  validateAgreement(result); return result;
}
export function recordLink(base,{contract,agreement,request}){
  const url=new URL(base); url.search='';
  const params=new URLSearchParams({contract,agreement,...(request?{request}:{})});
  url.hash='record?'+params; return url.href;
}
export function parseRecordLink(hash){
  if(!hash.startsWith('#record?')) return null;
  const p=new URLSearchParams(hash.slice(8));
  const contract=p.get('contract'), agreement=p.get('agreement'), request=p.get('request')??'';
  const validId=id=>/^[1-9][0-9]{0,9}$/.test(id)&&Number(id)<=4294967295;
  if(!/^0x[0-9a-fA-F]{40}$/.test(contract??'')||!validId(agreement??'')||(request&&!validId(request))) throw Error('This record link is incomplete or invalid. Ask the sender for the full link.');
  return {contract,agreement,request};
}
export function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
export async function digest(value){
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
}
export async function checkRecord(agreement,request){
  const terms=Object.fromEntries(['protocol','id','title','creator','counterparty','clauses','exclusions','parent_id'].map(k=>[k,agreement[k]]));
  if(await digest(terms)!==agreement.terms_hash)throw Error('The agreement fingerprint does not match its recorded terms.');
  if(!request)return;
  if(request.agreement_id!==agreement.id||request.terms_hash!==agreement.terms_hash||!agreement.request_ids.includes(request.id))throw Error('The request is not linked to this exact agreement.');
  if(await digest({agreement_hash:agreement.terms_hash,request:request.request_text})!==request.request_hash)throw Error('The request fingerprint does not match its text.');
  if(!Array.isArray(request.reviews)||request.reviews.length>2)throw Error('Invalid review history.');
  for(const r of request.reviews){
    if(r.terms_hash!==agreement.terms_hash||r.request_hash!==request.request_hash)throw Error('A review refers to different inputs.');
    if(!['IN_SCOPE','CHANGE_ORDER','NEEDS_CLARIFICATION'].includes(r.label))throw Error('Unknown decision in the record.');
    const ids=r.basis_ids;
    if(!Array.isArray(ids)||ids.some((id,i)=>!Number.isInteger(id)||id<0||id>agreement.clauses.length||(i>0&&id<=ids[i-1])))throw Error('Invalid clause references.');
    if(typeof r.request_quote!=='string'||!r.request_quote||!request.request_text.includes(r.request_quote))throw Error('A quoted request does not match the original.');
    const sources=ids.map(id=>id===0?agreement.exclusions:agreement.clauses[id-1]);
    if(ids.length?typeof r.scope_quote!=='string'||r.scope_quote.length<5||!sources.some(s=>s.includes(r.scope_quote)):r.scope_quote!==''||r.label==='IN_SCOPE')throw Error('A quoted clause does not match the original.');
  }
  const expected=request.reviews.length===2&&request.reviews[0].label!==request.reviews[1].label?'NEEDS_CLARIFICATION':request.reviews.at(-1)?.label??'';
  if(request.decision!==expected)throw Error('The decision does not match the review history.');
}
