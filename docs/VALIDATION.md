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
- Historical contracts require exact basis-ID agreement. Release 0.2 adds an evidence-checked alternative when labels agree; semantic checks and network finality remain probabilistic.
- Second review is not a protocol appeal and cannot guarantee interpretation accuracy.
- Deduplication covers exact trimmed text per baseline, not paraphrases.
- The mock model does not simulate rollback, protocol consensus, fees or network failures.

A fresh public record read after amendment acceptance confirmed agreement 1 SUPERSEDED, its original terms hash and exclusion unchanged, and request 1 still CHANGE_ORDER with two reviews. Agreement 2 is ACTIVE under its distinct terms hash. No transaction was resubmitted after the frontend receipt error.

Final local suite: 23 passing tests (13 domain/receipt, 10 mocked contract). Browser verification used the actual deployed website; no local preview or responsive viewport override was used.

## Guided release 0.2 — 12 November 2026

An independent read of the 18 transaction hashes below and in the historical section returned `FINALIZED` and `SUCCESS` for every receipt. The totals were 10 transactions on the historical contract, two on the first 0.2 sandbox and six on the completed guided example. The code bytes in all three deployment receipts matched the corresponding source SHA-256 documented here.

Local checks: 31 passing tests (18 JavaScript, 13 mocked contract). GenVM lint (3 checks) and semantic validation passed with all 10 public methods. Production build passed. Regression cases cover matching labels with alternate valid citations, unsupported evidence, malformed evidence-check answers, fabricated quotes, permalink validation, original-input fingerprints and conflicting review histories. Mock tests do not measure real validator agreement rates.

Browser checks on the managed preview of the release build covered the landing page, a historical record with both finalized reviews and verified fingerprints, draft recovery after reload, and recovery after closing the original signing tab. A deliberate reload interrupted sandbox deployment tracking. Resumption tracked the same hash.

The deployment in the earlier section is historical and was not upgraded. New walkthroughs deploy the revised contract policy `independent-label-evidence/2`. The additional semantic check is only used when independently derived labels agree but their basis IDs differ. Its effect on latency and consensus success has not been benchmarked.

### New-policy live workflow

Managed-browser walkthrough, Studionet contract `0x18Aebb92EF49d186665e77CCFEefA33E58E51B06`, agreement 1 / request 1. The deployment reports `independent-label-evidence/2`. Verified FINALIZED/SUCCESS followed by finalized-state reads for:

| Operation | Transaction |
| --- | --- |
| Deploy and resume the same hash after deliberate reload | `0x86273cc8e64a7c546804f5908dede307ed39103a1605793d3c70136d828172e6` |
| Create agreement | `0x14516670d322bb0975d4c1b7c9d7808b29e58262e34afe45a5a8df57a1f64459` |
| Accept exact terms as test client | `0x29a25398231ac78727cdfa22d6385d2178efc13405c6d553b3dd20b370b6bada` |
| Record request | `0xe612b43d49de4c6147d007d8294eb2d92d7676f43927ba0b784e178f9a47f1a3` |

Accepted terms fingerprint: `31ae41aea517d6e46f4923dd5a49b7e0a8496b9bea46b2c0d8ceba79176b7f41`.

First consensus review `0x160babd04b09a511585da67a3fd622df5123ce327cdad695fddde2843e0ad83d` reached FINALIZED/SUCCESS and was state-verified by the guided UI: CHANGE_ORDER, basis `[0]`, exact exclusion quote. This proves the revised contract executes a real review; it does not prove that validators exercised the alternate-basis branch in this particular transaction.

Second review `0x67311a93bfe5e32574a1f9386dc79522907b2d35cbd545a83ae11b4807874e4b` reached FINALIZED/SUCCESS after another page reload and same-hash resumption. State verification confirmed the other test party requested round 2. Both rounds classify CHANGE_ORDER; round 1 cites `[0]` and the exclusion, round 2 cites `[0,1]` and the exact five-page clause. Both are displayed, not overwritten. Different bases across two rounds are not proof of a per-validator basis mismatch.

The record permalink opened in a separate preview tab without a signing session and displayed both reviews with verified fingerprints. Copy link exposes a selectable URL as a fallback. Advanced workspace and return to the walkthrough were checked. [SUBMISSION.md](SUBMISSION.md) contains the direct reviewer link.

### First 0.2 sandbox

The first attempt used a separate contract at `0x424EEbFa2e5988Fb871D56460BF80F876ec6Bb86`. Both transactions reached `FINALIZED` and `SUCCESS`. When the original tab closed, the app offered read-only access to the saved agreement.

| Operation | Transaction |
| --- | --- |
| Deploy first sandbox | `0x6e16023546d283d1206694273673aca94ef2f1afcc76881a6a65cab788b96f68` |
| Create agreement | `0x20663fd58f1cd4b68fdf13bc079d10f48f99ad2ecf0c375cae00e5b58453df64` |

Release contract source SHA-256: `024ea26709215a7f2b3de2d417f33670930843959e8d7447391e6d995bad4ddc`. Both 0.2 deployments returned identical source bytes. Receipt success confirms both reviews ran on the revised contract. The alternate-evidence branch has mocked regression coverage. Its use during live validator voting remains unverified.
