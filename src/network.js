import {createClient,createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {generatePrivateKey} from 'viem/accounts';
import {receiptState,parseRecord,deploymentAddress} from './domain.js';
import contractSource from '../contracts/scope_ledger.py?raw';
export const NETWORK={name:'Studionet',chainId:61999,rpc:'https://studio.genlayer.com/api',explorer:'https://explorer-studio.genlayer.com'};
const readClient=createClient({chain:studionet});
const pendingKey='scopeledger.pending.v1';
export function identities(){let keys=JSON.parse(sessionStorage.getItem('scopeledger.identities.v1')??'null');if(!keys){keys=[generatePrivateKey(),generatePrivateKey()];sessionStorage.setItem('scopeledger.identities.v1',JSON.stringify(keys));}return keys.map(k=>createAccount(k));}
export const read=async(address,functionName,args=[])=>parseRecord(await readClient.readContract({address,functionName,args,stateStatus:'finalized'}));
export function pending(){return JSON.parse(localStorage.getItem(pendingKey)??'null');}
export function clearPending(hash){if(!hash||pending()?.hash===hash)localStorage.removeItem(pendingKey);}
export async function track(hash,onUpdate){
 const started=Date.now();let receipt;
 while(Date.now()-started<180000){
  receipt=await readClient.getTransaction({hash});
  const state=receiptState(receipt);onUpdate({...state,hash,receipt});
  if(state.failed)throw Object.assign(Error(`Transaction ${state.status}: ${state.execution}. No success has been confirmed.`),{receipt,terminal:true});
  if(state.success)return receipt;
  await new Promise(r=>setTimeout(r,3000));
 }
 throw Error('Still waiting for a finalized successful execution. Resume this transaction; do not submit it again.');
}
async function submitTransaction({address,method,args=[],actor=0,deploy=false,verification={}},onUpdate){
 if(pending())throw Error('A transaction is already tracked. Resume it before starting another.');
 const account=identities()[actor];const client=createClient({chain:studionet,account});
 onUpdate({status:'SUBMITTING',execution:'UNKNOWN'});
 const hash=deploy?await client.deployContract({code:contractSource,args:[],leaderOnly:false}):await client.writeContract({address,functionName:method,args,value:0n,leaderOnly:false});
 const job={hash,address,method:deploy?'deploy':method,args,actor,sender:account.address,verification,createdAt:new Date().toISOString()};
 localStorage.setItem(pendingKey,JSON.stringify(job));onUpdate({status:'PENDING',execution:'UNKNOWN',hash});
 try{const receipt=await track(hash,onUpdate);return {hash,receipt,job,address:deploy?deploymentAddress(receipt):address};}catch(error){if(error.terminal)clearPending(hash);throw error;}
}
export {contractSource};

export async function transact(options,onUpdate){
 if(navigator.locks)return navigator.locks.request('scopeledger-submit',{ifAvailable:true},lock=>{if(!lock)throw Error('Another tab is submitting an action. Wait, then resume its transaction.');return submitTransaction(options,onUpdate);});
 return submitTransaction(options,onUpdate);
}
