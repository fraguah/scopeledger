# Project Explorer draft

Project name: ScopeLedger

Primary tag: Dispute Resolution

One-liner (under 180 characters):
Agree the scope. Record the change. Let GenLayer classify extra requests against the exact terms both parties accepted.

Description (under 1,000 characters):
ScopeLedger helps freelancers and clients handle scope creep before it becomes a payment dispute. Two parties accept an immutable brief. Each change request is pinned to its terms hash. GenLayer validators independently classify the whole request as IN_SCOPE, CHANGE_ORDER or NEEDS_CLARIFICATION and record exact source citations. A second review must be requested by the other party; conflicting labels preserve both records and require clarification. Amendments take effect only after bilateral acceptance, while earlier requests retain their original baseline. The app submits real Studionet transactions, tracks finality and execution, rereads state, resumes pending hashes and exports receipts. Complete source, tests and limitations are included. Test-network prototype using temporary browser signers; no escrow, payments, legal judgments or private data. Built with AI assistance.

Website: https://scopeledger-fraguah.pipedcoconut.chatgpt.site

GitHub: https://github.com/fraguah/scopeledger

The Studionet record and its [second review receipt](https://explorer-studio.genlayer.com/transactions/0x67311a93bfe5e32574a1f9386dc79522907b2d35cbd545a83ae11b4807874e4b) are public.

## How to review the guided release

Direct link to agreement 1, request 1. No wallet is required.

https://scopeledger-fraguah.pipedcoconut.chatgpt.site/#record?contract=0x18Aebb92EF49d186665e77CCFEefA33E58E51B06&agreement=1&request=1

The guided home page opens the same record from **See a real decision**. The record shows the accepted terms, the change request, both reviews and their exact quotations.

To try the workflow, select **Try your own example** and follow **Terms → Accept → Request → Decision**. The walkthrough provides editable templates, switches between two temporary test identities and can resume a saved transaction by its existing hash. Use public test data. The **Advanced workspace** provides amendments, transaction history and receipt export.

Expected verification outcome (under 500 characters):
A freshly deployed ScopeLedger address returns protocol scopeledger/1. A proposed agreement becomes ACTIVE only after the named counterparty accepts its terms hash. A recorded request receives a stored classification, exact quote and baseline hash after finalized successful consensus execution. Activity includes the submitted hash and State verified. The supplied live example should show CHANGE_ORDER for checkout/payments excluded from the accepted scope.

## Evidence for the reviewer

The six transactions for the guided example are listed in [VALIDATION.md](VALIDATION.md) with the source fingerprint and the other 12 historical receipts. Both reviews returned `CHANGE_ORDER`. The two recorded rounds used different clause references. Whether validators used the new evidence check during either vote remains unverified on Studionet. The alternate-evidence path is covered by mocked contract tests.
