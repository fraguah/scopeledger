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

## Guided release 0.2

The public site currently serves site version 3. The guided release is saved as site version 4 and awaits publication. See [SUBMISSION.md](docs/SUBMISSION.md) for the reviewer link and the available Studionet receipt.

Open **See a real decision** to read an actual finalized record, its original terms, both reviews and exact citations. No wallet or signing identity is needed. **Try your own example** opens a four-step walkthrough: terms → acceptance → request → decision. Website, design and development templates are editable; drafts save locally. The browser switches between two temporary test identities for you.

New walkthroughs deploy their own sandbox with review policy `independent-label-evidence/2`. Existing contracts are immutable; the earlier deployment remains a valid historical record under its original policy (see VALIDATION.md). The home-page example now points to the verified new-policy walkthrough. No claim is made that old contracts were upgraded.

Network: GenLayer **Studionet**, chain **61999**, RPC `https://studio.genlayer.com/api`. Use public test data only. Temporary test keys stay in this tab session; closing it can lose signing access. Public record links remain readable. Never fund these keys with real assets.

Every write waits for FINALIZED/SUCCESS and rereads state before advancing. A saved transaction can be resumed after timeout or reload without sending a replacement. A cross-tab Web Lock prevents concurrent sends in supporting browsers. If the original tab identities are lost, the app offers read-only access and a fresh walkthrough.

The result explains what was agreed, what was requested, the decision, exact supporting quotes and the next action. **Copy link to this record** shares that exact contract/agreement/request. The reader rechecks the original fingerprints and quote membership; this is an integrity check, not proof of semantic correctness or contract authorship.

The **Advanced workspace** preserves amendments, contract lookup, activity, receipt inspection and source export. Its illustrative sample is explicitly labeled and is separate from the live example.

## Contract

`contracts/scope_ledger.py` pins Python SDK v0.2.16 by GenVM dependency hash. Six writes: create/accept/cancel proposal, open request, review, second review. Four views: agreement, request, paginated agreements, statistics. Limits: 1–8 clauses, 32 requests per baseline, two review rounds.

Deterministic checks require exact fields, allowed labels, sorted clause references and verbatim quotes. Validators independently classify the same inputs. Different labels are rejected. Matching labels with identical basis IDs follow the existing path. When the label agrees but the basis IDs differ, an additional model check must explicitly approve the leader’s cited evidence against the complete request; malformed, unsupported or uncertain evidence fails closed. Exact quote checks remain mandatory. This addresses the reviewer’s same-label/different-basis scenario without accepting label agreement alone. It adds one model call on that path and does not guarantee faster consensus. Input is explicitly untrusted evidence. Semantic correctness and prompt-injection resistance remain probabilistic.

`npm test` covers receipt status and contract state with an explicit GenVM mock: access, hash acceptance, immutability, deduplication, amendment races, citations and validator disagreement. Mock tests do not establish real consensus. The separate GenVM semantic validation passed for all 10 public methods. See `docs/VALIDATION.md` for network evidence and limits.

Studionet receipts confirm `FINALIZED` and `SUCCESS` for all 18 documented transactions across three deployments. The deployed code for both 0.2 sandboxes matches `contracts/scope_ledger.py` (SHA-256 `024ea26709215a7f2b3de2d417f33670930843959e8d7447391e6d995bad4ddc`). The complete guided example stored two reviews. The alternate-evidence path has mocked regression coverage, and its use in a live vote remains unverified. See [VALIDATION.md](docs/VALIDATION.md) for the hashes and checks.

## Boundaries

Test-network prototype: no escrow, payments, price setting, legal judgment or production guarantees. Sandbox identities demonstrate both parties; independent users can use the contract via SDK/Studio. Personal-wallet UI and private agreements are not implemented. Finality may be slow. A review neither changes terms nor authorizes work or payment. Public records cannot be erased.

## Author

fraguah — https://portal.genlayer.foundation/participant/67261 . Built with AI assistance. Original implementation using GenLayer SDK; related scope/dispute products exist and no first-of-kind claim is made. MIT license. Official docs: https://docs.genlayer.com/ .
