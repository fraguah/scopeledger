# ScopeLedger

GenLayer scope-change triage for freelance projects. Two parties accept an exact baseline. A proposed change is pinned to its hash and classified **IN_SCOPE**, **CHANGE_ORDER**, or **NEEDS_CLARIFICATION**, with exact citations.

This targets the moment before new work is agreed, rather than deliverable quality or payment release. GenLayer is central: semantic classification runs inside validator consensus, not in a frontend LLM call. Scope records, requests, results and amendments are stored by the contract.

## Run

Node 22+ and Python 3.11+:

```sh
npm ci
npm test
npm run build
npx vite --host 0.0.0.0
```

The example's three outcomes are marked **illustrative**, not network results. For live actions use **Open live workspace → Network & source → Deploy new sandbox**. Two temporary session-only test identities are generated in your browser. They must never hold real assets; closing the session loses access. Network: GenLayer **Studionet**, chain **61999**, RPC `https://studio.genlayer.com/api`. All inputs are public test data.

1. Actor A proposes a baseline; the form suggests actor B as counterparty.
2. Switch to B and accept its exact terms hash.
3. Record a concrete change request. Recording and review are separate transactions.
4. Run consensus review. Finalized successful execution and a fresh state read are required before success appears.
5. The other party may request one second review. Different labels preserve both results and require clarification. This is an application-level second opinion, not a protocol appeal.
6. Propose an amendment and accept it as the counterparty. The old baseline is superseded only on acceptance; existing requests keep their original terms hash.

Activity exports contain transaction receipts. Timed-out transactions keep their hash and can be resumed without resubmission. Public records can be loaded by contract address and agreement ID. Activity also offers read-only transaction hash verification without resubmission. Download the contract or complete source ZIP in Network & source.

## Contract

`contracts/scope_ledger.py` pins Python SDK v0.2.16 by GenVM dependency hash. Six writes: create/accept/cancel proposal, open request, review, second review. Four views: agreement, request, paginated agreements, statistics. Limits: 1–8 clauses, 32 requests per baseline, two review rounds.

Deterministic checks require exact fields, allowed labels, sorted clause references and verbatim quotes. Validators independently classify the same inputs and compare **label and basis IDs**; valid JSON alone is insufficient. Input is explicitly untrusted evidence. Semantic correctness and prompt-injection resistance remain probabilistic.

`npm test` covers receipt status and contract state with an explicit GenVM mock: access, hash acceptance, immutability, deduplication, amendment races, citations and validator disagreement. Mock tests do not establish real consensus. The separate GenVM semantic validation passed for all 10 public methods. See `docs/VALIDATION.md` for network evidence and limits.

## Boundaries

Test-network prototype: no escrow, payments, price setting, legal judgment or production guarantees. Sandbox identities demonstrate both parties; independent users can use the contract via SDK/Studio. Personal-wallet UI and private agreements are not implemented. Finality may be slow. A review neither changes terms nor authorizes work or payment. Public records cannot be erased.

## Author

fraguah — https://portal.genlayer.foundation/participant/67261 . Built with AI assistance. Original implementation using GenLayer SDK; related scope/dispute products exist and no first-of-kind claim is made. MIT license. Official docs: https://docs.genlayer.com/ .
