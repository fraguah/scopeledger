export const LABELS={IN_SCOPE:'Within agreed scope',CHANGE_ORDER:'Change order',NEEDS_CLARIFICATION:'Needs clarification'};
export const TONES={IN_SCOPE:'green',CHANGE_ORDER:'amber',NEEDS_CLARIFICATION:'purple'};
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function validateAgreement({title,counterparty,clauses,exclusions=''}){
 if(title.trim().length<3||title.trim().length>100)throw Error('Use a title between 3 and 100 characters.');
 if(!/^0x[0-9a-fA-F]{40}$/.test(counterparty)||/^0x0{40}$/i.test(counterparty))throw Error('Enter a nonzero counterparty address.');
 if(clauses.length<1||clauses.length>8||clauses.some(c=>c.trim().length<10||c.trim().length>800))throw Error('Use 1–8 clauses, each 10–800 characters.');
 if(new Set(clauses.map(c=>c.trim())).size!==clauses.length)throw Error('Each scope clause must be different.');
 if(exclusions.length>1200)throw Error('Exclusions must be at most 1,200 characters.');
 return true;
}
export function receiptState(receipt){
 const raw=receipt?.statusName??receipt?.status_name??receipt?.status;
 const statuses={0:'PENDING',1:'ACTIVATED',2:'CANCELED',3:'PROPOSING',4:'COMMITTING',5:'REVEALING',6:'ACCEPTED',7:'FINALIZED',8:'UNDETERMINED'};
 const status=String(statuses[raw]??raw??'UNKNOWN').toUpperCase();
 const leaders=receipt?.consensus_data?.leader_receipt;
 const leader=Array.isArray(leaders)?(leaders.filter(r=>r.mode==='leader').at(-1)??leaders[0]):leaders;
 const execution=String(receipt?.txExecutionResultName??leader?.execution_result??receipt?.execution_result??'UNKNOWN').toUpperCase();
 const executionOK=['SUCCESS','FINISHED_WITH_RETURN'].includes(execution);
 const executionFailed=['ERROR','FAILURE','FINISHED_WITH_ERROR'].includes(execution);
 return {status,execution,success:status==='FINALIZED'&&executionOK,failed:['CANCELED','CANCELLED','UNDETERMINED'].includes(status)||(status==='FINALIZED'&&executionFailed)};
}
export function finalDecision(reviews){if(!reviews.length)return '';return reviews.length===2&&reviews[0].label!==reviews[1].label?'NEEDS_CLARIFICATION':reviews.at(-1).label;}
export function short(value,n=6){const s=String(value??'');return s.length>n*2+3?`${s.slice(0,n)}…${s.slice(-n)}`:s;}
export function parseRecord(data){return typeof data==='string'?JSON.parse(data):data;}
export function deploymentAddress(receipt){return receipt?.data?.contract_address??receipt?.data?.contractAddress??receipt?.contract_address??receipt?.recipient??receipt?.to_address??receipt?.txDataDecoded?.contractAddress??null;}
