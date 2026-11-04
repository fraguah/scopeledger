# Project Explorer draft

Project name: ScopeLedger

Primary tag: Dispute Resolution

One-liner (under 180 characters):
Agree the scope. Record the change. Let GenLayer classify extra requests against the exact terms both parties accepted.

Description (under 1,000 characters):
ScopeLedger helps freelancers and clients handle scope creep before it becomes a payment dispute. Two parties accept an immutable brief. Each change request is pinned to its terms hash. GenLayer validators independently classify the whole request as IN_SCOPE, CHANGE_ORDER or NEEDS_CLARIFICATION and record exact source citations. A second review must be requested by the other party; conflicting labels preserve both records and require clarification. Amendments take effect only after bilateral acceptance, while earlier requests retain their original baseline. The app submits real Studionet transactions, tracks finality and execution, rereads state, resumes pending hashes and exports receipts. Complete source, tests and limitations are included. Test-network prototype using temporary browser signers; no escrow, payments, legal judgments or private data. Built with AI assistance.

Website: https://scopeledger-fraguah.pipedcoconut.chatgpt.site

GitHub: https://github.com/fraguah/scopeledger

## How-to

1. Inspect an existing record: Open live workspace; inspect the verified deployment's agreement 1 and request 1. Review details show a stored classification and exact scope quotation. These are distinct from the separately labeled illustrative workspace.
2. Try the full flow: Network & source → Deploy new sandbox. New agreement → enter title, scope clauses and exclusions; the app suggests the other temporary actor as counterparty. Propose exact terms.
3. Accept bilaterally: Switch actor → Accept exact terms. Wait for STATE VERIFIED and ACTIVE.
4. Review a change: New request → describe added work → Record request. After STATE VERIFIED, Run consensus review. Wait for finalized execution and the stored verdict/citation.
5. Inspect history: Activity & receipts → inspect Explorer links or Export history. If tracking times out, Resume tracking keeps the original transaction hash. For a second review switch to the other actor. Amendments require another bilateral acceptance.

Expected verification outcome (under 500 characters):
A freshly deployed ScopeLedger address returns protocol scopeledger/1. A proposed agreement becomes ACTIVE only after the named counterparty accepts its terms hash. A recorded request receives a stored classification, exact quote and baseline hash after finalized successful consensus execution. Activity includes the submitted hash and State verified. The supplied live example should show CHANGE_ORDER for checkout/payments excluded from the accepted scope.

## Before submission

- Complete actual network evidence in VALIDATION.md.
- The website and repository currently remain private; stewards need public review access before submission.
- No project submission has been sent. The form requires GitHub Repository evidence and a new CAPTCHA confirmation at action time.
- Do not claim accepted points, legal enforceability, production safety or guaranteed semantic correctness.
