# ScopeLedger 0.2 — guided onboarding and evidence-aware review

## Problem and change

New visitors previously had to find network settings, deploy a contract, switch test actors manually and infer the order of agreement/request/review actions. The new default home page offers an actual public decision to read immediately, or an editable four-step walkthrough. Advanced controls remain available separately.

The walkthrough includes three scope templates, automatic test-actor selection, local draft recovery, pending-transaction resumption and readable result explanations. Public deep links identify an exact contract, agreement and optional request. Read-only visitors need no wallet; the app checks fingerprints and quoted text before presenting a verified record. It preserves both review rounds and makes disagreement explicit.

## Reviewer response

Reviewer 3books identified a needless consensus rejection: validators can agree on CHANGE_ORDER but select different valid basis IDs, such as an exclusion versus no matching clause. Previously the validator rejected every basis mismatch.

Policy `independent-label-evidence/2` keeps independent classification and exact quote validation. If labels disagree, it rejects. If labels agree and basis IDs differ, an additional semantic check must explicitly confirm the proposed evidence against the complete request. Invalid quotes, unsupported evidence and malformed check responses still fail closed. The extra model call may increase latency; no measured consensus-success improvement is claimed.

This policy applies to newly deployed contracts. Historical deployments and their records are immutable. No existing baseline is rewritten.

## Acceptance checks

- Read an actual finalized decision without creating a signer.
- Edit a template and recover its draft after reload.
- Create and accept exact terms with the two test parties.
- Record a request and obtain real validator review.
- Recover a submitted transaction after reload without duplicating it.
- Open the exact record through a public share link.
- Keep unsupported citations and contradictory reviews from becoming silent successes.

See VALIDATION.md for completed checks and transaction evidence. This remains a public test-network prototype using session-only signers, not production onboarding for independent parties.
