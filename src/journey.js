import './journey.css';
import {escapeHTML as e,short,receiptState,deploymentAddress} from './domain.js';
import {NETWORK,identities,read,pending,clearPending,transact,track} from './network.js';
import {TEMPLATES,readStored,agreementDraft,recordLink,parseRecordLink,checkRecord} from './journey-model.js';
import example from './deployment.json';

const key='scopeledger.journey.v2';
const saved=readStored(localStorage,key,{});
let draft={...TEMPLATES.website,...saved.draft};
let flow=saved.flow??{id:crypto.randomUUID(),contract:'',agreement:'',request:'',parties:[]};
let ui={page:'home',busy:false,loading:false,error:'',notice:'',job:null,agreement:null,request:null,contract:'',readonly:false};
let openAdvanced;
const $=s=>document.querySelector(s);
const button=(text,action,style='primary')=>`<button class="${style}" data-j="${action}" ${ui.busy?'disabled':''}>${text}</button>`;
const verdicts={
  IN_SCOPE:{title:'Included in the agreed work',copy:'The requested work fits the accepted terms.',next:'Use the cited terms to confirm the work with the other party.',tone:'green'},
  CHANGE_ORDER:{title:'Additional work to agree',copy:'The request goes beyond the accepted scope.',next:'Agree the extra work, timing and any price changes before proceeding.',tone:'amber'},
  NEEDS_CLARIFICATION:{title:'Clarify the terms together',copy:'The record does not support a clear shared answer.',next:'Resolve the ambiguity together and agree revised terms.',tone:'purple'}
};

function save(){localStorage.setItem(key,JSON.stringify({version:2,draft,flow}));}
function partiesAvailable(){
  const stored=readStored(sessionStorage,'scopeledger.identities.v1',null);
  if(!stored||!flow.parties.length)return false;
  return identities().every((a,i)=>a.address.toLowerCase()===flow.parties[i]?.toLowerCase());
}
function nextStep(){if(!flow.agreement)return 0;if(ui.agreement?.status==='PROPOSED')return 1;if(!flow.request)return 2;return 3;}
function disclosure(){return '<p class="j-disclosure">Test network · Public, permanent records. Use sample information. This walkthrough uses two temporary test identities in this tab.</p>';}
function progress(){
  if(!ui.job)return '';
  const stages={SUBMITTING:'Sending your action',PENDING:'Waiting for the network',ACTIVATED:'Waiting for validators',PROPOSING:'Validators are evaluating',COMMITTING:'Validators are voting',REVEALING:'Validators are comparing decisions',ACCEPTED:'Waiting for final confirmation',FINALIZED:'Checking the saved record',VERIFIED:'Record confirmed'};
  return `<section class="j-progress" role="status"><span class="j-dot ${ui.busy?'pulse':''}"></span><div><strong>${e(stages[ui.job.status]??'Checking network progress')}</strong><p>${ui.busy?'This may take a few minutes. Keep this tab open. Once submitted, the transaction is saved for recovery.':ui.job.status==='VERIFIED'?'The saved record matches your action. Continue below.':'You can inspect or resume the existing transaction.'}</p>${ui.job.hash?`<a href="${NETWORK.explorer}/transactions/${e(ui.job.hash)}" target="_blank" rel="noreferrer">View transaction ↗</a>`:''}</div></section>`;
}
function header(){return `<header class="j-header"><a href="#" data-j="home" class="j-brand"><span class="brand-symbol"><i></i><b></b></span>ScopeLedger</a><nav aria-label="Main"><button data-j="home">Start</button><button data-j="advanced" ${ui.busy?'disabled':''}>Advanced workspace ↗</button><a href="https://github.com/fraguah/scopeledger" target="_blank" rel="noreferrer">Source ↗</a></nav></header>`;}
function home(){return `<section class="j-hero"><div><span class="eyebrow">FOR FREELANCERS & CLIENTS</span><h1>“One more thing.”<br>Is it in the scope?</h1><p>Compare a client's new request with the terms you both accepted. See the decision and the exact words behind it.</p><div class="j-actions">${button('Try your own example →','start')}${button('See a real decision','example','secondary')}</div><p class="j-caption">Try both sides on GenLayer's test network. No personal wallet needed.</p>${flow.contract||saved.draft?`<div class="j-resume"><strong>Your last walkthrough is saved.</strong>${button('Continue walkthrough','continue','text-button')}</div>`:''}</div><article class="j-story"><span class="eyebrow">WEBSITE PROJECT</span><div><small>Agreed</small><p>Five-page website. Payments excluded.</p></div><div><small>New request</small><p>“Can you add a shop and card payments?”</p></div><div class="j-story-answer"><span class="j-symbol">+</span><div><small>The question to resolve</small><strong>Included, extra, or unclear?</strong></div></div><p class="j-caption">Open the real decision to read the recorded answer from GenLayer.</p></article></section><section class="j-how"><h2>A clear path from request to answer.</h2><div><article><h3>Agree the scope</h3><p>Write what is included and excluded. Both sides accept the same version.</p></article><article><h3>Describe the change</h3><p>Use the client's exact request, so everyone reviews the same work.</p></article><article><h3>Read the decision</h3><p>GenLayer validators compare the request with the terms. Share a link to the result.</p></article></div></section>`;}
function terms(){return `<form id="j-terms"><span class="eyebrow">STEP 1 · THE AGREEMENT</span><h1>What did you agree to do?</h1><p class="j-intro">Start with a template, then make the terms your own. Your draft saves as you type.</p><div class="j-templates" role="group" aria-label="Agreement templates">${Object.entries(TEMPLATES).map(([id,t])=>`<button type="button" data-template="${id}">${t.name}</button>`).join('')}</div><label>Project name<input name="title" value="${e(draft.title)}" minlength="3" maxlength="100" required></label><label>Included work<textarea name="clauses" rows="4" required>${e(draft.clauses)}</textarea><small>One clear commitment per line. Include deliverables and revision limits. Up to 8 lines.</small></label><label>Excluded work<textarea name="exclusions" rows="2" maxlength="1200">${e(draft.exclusions)}</textarea></label>${disclosure()}<label class="j-check"><input type="checkbox" required ${ui.consent?'checked':''} name="consent">These terms contain only information I am willing to publish on the test network.</label><button class="primary" type="submit" ${ui.busy||pending()?'disabled':''}>${flow.contract?'Record these terms':'Create test workspace & record terms'} →</button><p class="j-caption">You play the service provider first. The next step lets you accept as the test client.</p></form>`;}
function acceptedTerms(a){return `<section class="j-terms-card"><h2>${e(a.title)}</h2><h3>Included work</h3><ul>${a.clauses.map(c=>`<li>${e(c)}</li>`).join('')}</ul><h3>Excluded work</h3><p>${e(a.exclusions||'No exclusions were specified.')}</p></section>`;}
function acceptance(){return `<span class="eyebrow">STEP 2 · BOTH SIDES AGREE</span><h1>Now review as the client.</h1><p class="j-intro">Read the exact terms below. This walkthrough switches to the second test identity when you accept.</p>${acceptedTerms(ui.agreement)}<p class="j-caption">Acceptance saves this version. Later changes require a new proposal accepted by both sides.</p>${button('Accept these terms as test client →','accept')}<details class="j-technical"><summary>Verify the version and parties</summary><p>Provider ${e(ui.agreement.creator)}</p><p>Client ${e(ui.agreement.counterparty)}</p><p>Terms fingerprint ${e(ui.agreement.terms_hash)}</p></details>`;}
function requestForm(){return `<form id="j-request"><span class="eyebrow">STEP 3 · THE NEW REQUEST</span><h1>What is the client asking for?</h1><p class="j-intro">Describe the concrete work. The request will be checked against your accepted agreement.</p><label>Client's request<textarea name="request" rows="5" minlength="10" maxlength="2400" required>${e(draft.request)}</textarea></label><details class="j-technical"><summary>Read the accepted agreement</summary>${acceptedTerms(ui.agreement)}</details>${disclosure()}<label class="j-check"><input type="checkbox" name="consent" required ${ui.requestConsent?'checked':''}>This request contains only public test information.</label><button class="primary" type="submit" ${ui.busy||pending()?'disabled':''}>Record request →</button><p class="j-caption">After the request is recorded, you can ask GenLayer to review it.</p></form>`;}
function result(){
  const a=ui.agreement,r=ui.request;
  if(!a)return '';
  if(!r)return `${acceptedTerms(a)}<p>This link contains an agreement. A change request has not been selected.</p>`;
  const v=verdicts[r.decision];
  const title=v?.title??'Ready to check the request';
  return `<span class="eyebrow">${ui.readonly?'PUBLIC RECORD':'STEP 4 · THE DECISION'}</span><h1>${e(title)}</h1><p class="j-intro">${e(v?.copy??'Ask GenLayer validators to compare this request with the accepted terms.')}</p>${r.status==='DISAGREEMENT'?'<div class="j-warning"><strong>The two reviews disagree.</strong><p>Both are preserved below. Clarify the agreement together before deciding how to proceed.</p></div>':''}<div class="j-result-grid"><section class="j-terms-card"><h2>What was agreed</h2><ul>${a.clauses.map(c=>`<li>${e(c)}</li>`).join('')}</ul><h3>Excluded work</h3><p>${e(a.exclusions||'No exclusions specified.')}</p></section><section class="j-terms-card"><h2>What was requested</h2><blockquote>${e(r.request_text)}</blockquote></section></div>${r.reviews.map(review=>`<section class="j-evidence ${e(verdicts[review.label]?.tone)}"><div class="j-evidence-heading"><h2>${e(verdicts[review.label]?.title)}</h2><span>Review ${e(review.round)}</span></div>${review.scope_quote?`<p>From ${review.basis_ids.includes(0)?'the exclusions / cited terms':'the cited terms'} (${review.basis_ids.map(i=>i===0?'exclusions':'clause '+i).join(', ')})</p><blockquote>“${e(review.scope_quote)}”</blockquote>`:'<p>This review cites no matching clause. It records an interpretation of the accepted scope; no supporting quotation is available.</p>'}<details><summary>Exact request excerpt and review metadata</summary><blockquote>“${e(review.request_quote)}”</blockquote><p>${e(review.reviewed_at)} · Requested by ${e(short(review.reviewer))}</p></details></section>`).join('')}${v?`<section class="j-next"><h2>What to do next</h2><p>${e(v.next)}</p><small>The review classifies scope. Both parties still agree any changes to the work.</small></section>`:''}<div class="j-actions">${!ui.readonly&&!r.reviews.length?button('Ask GenLayer to review →','review'):''}${!ui.readonly&&r.reviews.length===1?button('Ask for a second review as provider','second','secondary'):''}${button('Copy link to this record','share','secondary')}${button('Download record','download','quiet')}${!ui.readonly?button('Start another walkthrough','fresh','quiet'):''}</div>${ui.shareLink?`<label>Record URL<input readonly aria-label="Record URL" value="${e(ui.shareLink)}"></label>`:''}<p class="j-caption">Loaded from finalized Studionet state. Input fingerprints and quoted text checked in this browser.</p><details class="j-technical"><summary>Network, contract and record identifiers</summary><p>Studionet · ${NETWORK.chainId}</p><p>Contract <a href="${NETWORK.explorer}/address/${e(ui.contract)}" target="_blank" rel="noreferrer">${e(ui.contract)} ↗</a></p><p>Agreement ${e(a.id)} · Request ${e(r.id)}</p><p>Terms fingerprint ${e(a.terms_hash)}</p><p>The address identifies this record's source. A shared link does not prove who deployed the contract.</p></details>${ui.readonly?`<div class="j-actions">${button('Try with your own terms →','start')}${button('Reload record','reload-record','quiet')}</div>`:''}`;
}
function render(){
  const isFlow=ui.page==='flow';
  let body=home();
  if(ui.loading)body='<section class="j-loading" role="status"><span class="j-dot pulse"></span><h1>Reading the saved record…</h1><p>The result will appear after the network responds and the inputs are checked.</p></section>';
  else if(ui.page==='record')body=ui.error?'<h1>This record could not be verified.</h1>'+(ui.target?button('Try loading again','reload-record','secondary'):button('Back to start','home','secondary')):result();
  else if(isFlow){
    const step=nextStep();
    body=`<ol class="j-steps" aria-label="Walkthrough progress">${['Terms','Accept','Request','Decision'].map((t,i)=>`<li ${i===step?'aria-current="step"':''} class="${i===step?'current':i<step?'done':''}">${i<step?'✓':i+1}<span>${t}</span></li>`).join('')}</ol>`;
    if(flow.contract&&!partiesAvailable())body+='<section class="j-warning"><h2>Your test signing session has ended.</h2><p>Public records can still be read. Continuing writes needs the original test identities from this tab session.</p>'+button('Start a fresh walkthrough','fresh','secondary')+(flow.agreement?button('Read saved result','saved-record','quiet'):'')+'</section>';
    else body+=step===0?terms():step===1?acceptance():step===2?requestForm():result();
  }
  const job=pending();
  $('#app').innerHTML=`<div class="journey">${header()}<main class="j-main ${ui.page==='home'?'j-home':''}">${ui.error?`<div class="j-warning" role="alert">${e(ui.error)}</div>`:''}${ui.notice?`<div class="j-notice" role="status">${e(ui.notice)}</div>`:''}${progress()}${job&&!ui.busy?`<div class="j-warning"><strong>A submitted action needs confirmation.</strong><p>Resume it to check the saved transaction before starting another.</p>${button('Resume submitted action','resume','secondary')}</div>`:''}${body}</main><footer class="j-footer"><span>ScopeLedger · Built on GenLayer</span><span>Public test-network prototype</span></footer></div>`;
  bind();
}
function guarded(fn){return async event=>{event?.preventDefault();if(ui.busy)return;ui.error='';ui.notice='';try{await fn(event);}catch(error){ui.error=error.message;ui.loading=false;render();}};}
async function loadRecord(target){
  ui.shareLink='';ui.loading=true;ui.page='record';ui.readonly=true;ui.agreement=null;ui.request=null;ui.contract=target.contract;ui.target=target;render();
  const stats=await read(target.contract,'get_stats');
  if(stats.protocol!=='scopeledger/1')throw Error('This address does not report a compatible ScopeLedger protocol.');
  const a=await read(target.contract,'get_agreement',[target.agreement]);
  const r=target.request?await read(target.contract,'get_request',[target.request]):null;
  await checkRecord(a,r);ui.agreement=a;ui.request=r;ui.loading=false;render();
}
async function loadFlow(){
  ui.shareLink='';ui.page='flow';ui.readonly=false;ui.contract=flow.contract;ui.agreement=null;ui.request=null;
  if(flow.agreement){ui.loading=true;render();const a=await read(flow.contract,'get_agreement',[flow.agreement]);const r=flow.request?await read(flow.contract,'get_request',[flow.request]):null;await checkRecord(a,r);ui.agreement=a;ui.request=r;}
  ui.loading=false;render();
}
async function verifyJob(job,receipt){
  if(job.verification?.flowId!==flow.id)throw Error('This transaction belongs to another workspace. Open Advanced workspace to inspect it.');
  if(job.method==='deploy'){
    const address=deploymentAddress(receipt);if(!/^0x[0-9a-fA-F]{40}$/.test(address??''))throw Error('The deployed address is not available yet. Resume this transaction.');
    const stats=await read(address,'get_stats');if(stats.review_policy!=='independent-label-evidence/2')throw Error('The deployed contract does not report the expected review policy.');
    flow.contract=address;save();return;
  }
  if(job.address.toLowerCase()!==flow.contract.toLowerCase())throw Error('The pending action belongs to a different contract.');
  const args=job.args;
  if(job.method==='create_agreement'){
    const stats=await read(flow.contract,'get_stats');let matches=[];
    const before=job.verification.agreementCount;
    if(!Number.isInteger(before)||stats.agreements-before>2000)throw Error('This record needs manual inspection in Advanced workspace. Keep the transaction hash.');
    for(let offset=before;offset<stats.agreements;offset+=20){const rows=await read(flow.contract,'list_agreements',[offset,20]);matches.push(...rows.filter(a=>a.creator.toLowerCase()===job.sender.toLowerCase()&&a.counterparty.toLowerCase()===args[1].toLowerCase()&&a.title===args[0]&&JSON.stringify(a.clauses)===args[2]&&a.exclusions===args[3]&&a.parent_id===args[4]));}
    if(matches.length!==1)throw Error('The submitted agreement cannot yet be identified uniquely. Resume to check again.');
    await checkRecord(matches[0]);flow.agreement=matches[0].id;
  } else if(job.method==='accept_agreement'){
    const a=await read(flow.contract,'get_agreement',[args[0]]);await checkRecord(a);
    if(a.terms_hash!==args[1]||!['ACTIVE','SUPERSEDED'].includes(a.status))throw Error('Acceptance is not yet visible in finalized state.');
  } else if(job.method==='open_request'){
    const a=await read(flow.contract,'get_agreement',[args[0]]);
    const requests=await Promise.all(a.request_ids.map(id=>read(flow.contract,'get_request',[id])));
    const r=requests.find(r=>r.terms_hash===args[1]&&r.request_text===args[2]&&r.author.toLowerCase()===job.sender.toLowerCase());
    if(!r)throw Error('The recorded request is not yet visible. Resume to check again.');
    await checkRecord(a,r);flow.request=r.id;
  } else {
    const r=await read(flow.contract,'get_request',[args[0]]);const a=await read(flow.contract,'get_agreement',[r.agreement_id]);await checkRecord(a,r);
    const round=job.method==='second_review'?2:1;
    if(r.reviews.length<round||r.reviews[round-1].reviewer.toLowerCase()!==job.sender.toLowerCase())throw Error('The requested review is not yet confirmed.');
  }
  save();
}
async function finishJob(job,receipt){
  await verifyJob(job,receipt);
  const history=readStored(localStorage,'scopeledger.history.v1',[]);
  const item={...job,receipt,...receiptState(receipt),stateVerified:true,completedAt:new Date().toISOString()};
  localStorage.setItem('scopeledger.history.v1',JSON.stringify([item,...history.filter(x=>x.hash!==job.hash)].slice(0,40),(_,v)=>typeof v==='bigint'?v.toString():v));
  clearPending(job.hash);ui.job={status:'VERIFIED',hash:job.hash};await loadFlow();
}
async function send(method,args,actor){
  const verification={flowId:flow.id,...(method==='create_agreement'?{agreementCount:(await read(flow.contract,'get_stats')).agreements}:{})};
  const result=await transact({address:flow.contract,method,args,actor,deploy:method==='deploy',verification},job=>{ui.job=job;render();});
  await finishJob(result.job,result.receipt);
}
async function writeAction(fn){ui.busy=true;render();try{await fn();}finally{ui.busy=false;render();}}
async function act(action){
  if(action==='home'){history.replaceState(null,'',location.pathname);ui.page='home';ui.job=null;render();return;}
  if(action==='advanced'){openAdvanced();return;}
  if(action==='example'){await loadRecord({contract:example.address,agreement:example.agreementId,request:example.requestId});return;}
  if(action==='start'||action==='continue'){await loadFlow();return;}
  if(action==='fresh'){
    if(pending())throw Error('Resume the submitted transaction first.');
    flow={id:crypto.randomUUID(),contract:'',agreement:'',request:'',parties:[]};save();await loadFlow();return;
  }
  if(action==='saved-record'){await loadRecord({contract:flow.contract,agreement:flow.agreement,request:flow.request});return;}
  if(action==='reload-record'){await loadRecord(ui.target);return;}
  if(action==='share'){
    const link=recordLink(location.href,{contract:ui.contract,agreement:ui.agreement.id,request:ui.request?.id});
    ui.shareLink=link;try{await navigator.clipboard.writeText(link);ui.notice='Record link copied. Anyone with it can read this public record.';}catch{ui.notice=link;}
    render();return;
  }
  if(action==='download'){
    const blob=new Blob([JSON.stringify({network:NETWORK,contract:ui.contract,agreement:ui.agreement,request:ui.request},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='scopeledger-record.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(action==='resume'){
    const job=pending();if(!job)throw Error('There is no submitted action to resume.');
    if(job.verification?.flowId!==flow.id){openAdvanced();return;}
    await writeAction(async()=>{try{const receipt=await track(job.hash,j=>{ui.job=j;render();});await finishJob(job,receipt);}catch(error){if(error.terminal)clearPending(job.hash);throw error;}});return;
  }
  if(!partiesAvailable())throw Error('The original test identities are no longer available. Start a fresh walkthrough.');
  if(action==='accept'){await writeAction(()=>send('accept_agreement',[ui.agreement.id,ui.agreement.terms_hash],1));return;}
  if(action==='review'||action==='second'){await writeAction(()=>send(action==='review'?'review_request':'second_review',[flow.request],action==='review'?1:0));}
}
function bind(){
  document.querySelectorAll('.journey input,.journey textarea,.j-templates button').forEach(el=>{el.disabled=ui.busy;});
  document.querySelectorAll('[data-j]').forEach(el=>el.addEventListener('click',guarded(()=>act(el.dataset.j))));
  document.querySelectorAll('[data-template]').forEach(el=>el.addEventListener('click',guarded(()=>{draft={...TEMPLATES[el.dataset.template]};ui.consent=false;save();render();})));
  $('#j-terms')?.addEventListener('input',event=>{const f=event.currentTarget;for(const name of ['title','clauses','exclusions'])draft[name]=f.elements[name].value;ui.consent=f.elements.consent.checked;save();});
  $('#j-request')?.addEventListener('input',event=>{draft.request=event.currentTarget.elements.request.value;ui.requestConsent=event.currentTarget.elements.consent.checked;save();});
  $('#j-terms')?.addEventListener('submit',guarded(async()=>{
    const accounts=identities();const d=agreementDraft(draft,accounts[1].address);
    if(!flow.parties.length){flow.parties=accounts.map(a=>a.address);save();}
    if(!partiesAvailable())throw Error('Your test identity session has changed. Start a fresh walkthrough.');
    await writeAction(async()=>{
      if(!flow.contract)await send('deploy',[],0);
      await send('create_agreement',[d.title,d.counterparty,JSON.stringify(d.clauses),d.exclusions,''],0);
    });
  }));
  $('#j-request')?.addEventListener('submit',guarded(async()=>{
    const text=draft.request.trim();if(text.length<10||text.length>2400)throw Error('Describe the request in 10–2,400 characters.');
    if(!partiesAvailable())throw Error('Your test identity session has ended.');
    await writeAction(()=>send('open_request',[ui.agreement.id,ui.agreement.terms_hash,text],1));
  }));
}
export function showJourney(onAdvanced){openAdvanced=onAdvanced;ui.error='';render();}
export async function openSharedRecord(){
  try{const target=parseRecordLink(location.hash);if(target)await loadRecord(target);}catch(error){ui.page='record';ui.loading=false;ui.error=error.message;render();}
}
