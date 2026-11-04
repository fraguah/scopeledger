# Validation record

- GenVM semantic validation passed, SDK v0.2.16, 10 public methods (6 writes, 4 views).
- `npm test`: domain and mocked contract tests; these are local checks, not network consensus.
- `npm run build`: Vite production build.

## Network evidence

Verified through the deployed frontend on GenLayer Studionet, chain 61999. Contract: `0x2eB236a1245BDC5a86b69b478AC3d0655134bdA7`. Both signing identities are disposable sandbox actors. Every operation below reached FINALIZED / SUCCESS, followed by a fresh finalized-state read.

| Operation | Transaction |
| --- | --- |
| Deploy, verify protocol scopeledger/1 | `0xe66560ac4406832fec699f8fbb9362ddc8146986f08730dad19310bb74af85e9` |
| Actor A creates agreement 1 | `0xb2ad6d50bf95d10f39b4e344ffccc2ff2b984dd0419bfaffcf88f2669917847b` |
| Actor B accepts terms hash; ACTIVE | `0xef35845c112cea20edbc228527ca12ee946076b424a7900b2479e3f671427407` |
| Actor B records request 1 | `0x1a641a98247c7caf72c57f788c04b9304fc3bb15487fe88267a16f468bdb5ae1` |
| Consensus review; CHANGE_ORDER | `0x087edc330dbee7f34fd87de2152431fcb2acf1996a9186fc0bda10d7340043fc` |

Explorer transaction URL prefix: `https://explorer-studio.genlayer.com/transactions/`.

Baseline: responsive five-page English marketing website, two pre-launch visual revision rounds, one contact form. Exclusions: “E-commerce, payment processing, additional languages and post-launch maintenance are excluded.” Request: “Can you add a product shop with checkout and credit card payments before we launch?” Stored result: CHANGE_ORDER, basis_ids=[0], exact exclusion quotation. Accepted baseline terms hash: `f2f5a841ef708bbef6651defe242c05410b0a22349282084324034f723d3769b`.

Actor A requested second review (the other actor from round 1). Transaction `0xb91c8c0efe9ccb06885666e20413b807967adfebcef86fafb4646628d91e4bf2`. The page was deliberately reloaded while ACCEPTED. Activity retained the original pending hash. Resume tracking observed FINALIZED/SUCCESS, reread request 1, verified two reviews with the matching second reviewer and cleared the pending entry without resubmission. Round 2 also returned CHANGE_ORDER with the same exact exclusion quote.

Illustrative fixtures remain separately marked and are never counted as network activity. Amendment 2 was created by A (`0x3502cd873e2dda1965958babea99cdf2e24be1af7fddbc2522e3e21c00ed0649`). The Agreements view still showed agreement 1 ACTIVE and amendment 2 PROPOSED. B then accepted (`0xfe99b555a26dc1197ea07684f901e5de92d2a192eecd9556eacfb10d27eafc0f`), and a fresh read confirmed agreement 2 ACTIVE. The new baseline explicitly includes a product shop, one checkout page and card payment integration. Terms hash: `e611ddb58ff201500a3cdb1fdd8bb93fcfe3e8c6a1be3e764958762620d045cd`.

The identical checkout request was then recorded as request 2 under amendment 2 (`0x53a8f37ead0c2c28bb967312b5ff8918f59d2c9be5041e4d04c983cf4f02fd8c`), demonstrating deduplication is baseline-specific. Review transaction `0x5e1df866fa1c221ca149e0c113f361a77c157c52a6442697f6b0e29db7d5d90a` reached FINALIZED/SUCCESS in the official Explorer. Its equivalence output is IN_SCOPE, basis_ids=[4], with the exact new checkout clause. The earlier frontend misread a trailing idle validator receipt as the leader outcome, and stopped local tracking at ACCEPTED/ERROR despite successful execution. The parser now selects the leader-mode receipt; regression tests cover both trailing idle errors and failed leaders. Nonfinal execution errors also retain tracking. The new receipt lookup checks any existing hash without resubmitting a write.

The official Explorer separately confirmed the first review transaction: FINALIZED, execution SUCCESS, consensus Accepted, normal execution mode, initial validators 5, rotation count 1. Consensus details showed agree votes and identical nonempty state hashes for the successful validator executions. Two additional validators were idle; no claim of unanimity is made.

Local contract source SHA-256: `b3658ef62fda88a022a66213625225ee0bcd85da23c76253c2721e1568a650c2`.

## Limits

- Temporary sandbox keys in sessionStorage; no personal-wallet UI, private state or independent-user onboarding.
- Exact quote checks verify grounding, not semantic truth or completeness. Prompt injection remains a risk despite input boundaries and independent validator classification.
- Exact basis-ID agreement can delay consensus when multiple clauses support the same label.
- Second review is not a protocol appeal and cannot guarantee interpretation accuracy.
- Deduplication covers exact trimmed text per baseline, not paraphrases.
- The mock model does not simulate rollback, protocol consensus, fees or network failures.

A fresh public record read after amendment acceptance confirmed agreement 1 SUPERSEDED, its original terms hash and exclusion unchanged, and request 1 still CHANGE_ORDER with two reviews. Agreement 2 is ACTIVE under its distinct terms hash. No transaction was resubmitted after the frontend receipt error.

Final local suite: 23 passing tests (13 domain/receipt, 10 mocked contract). Browser verification used the actual deployed website; no local preview or responsive viewport override was used.
