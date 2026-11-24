# Backlog

Authoritative project backlog. Prioritize application throughput, correctness and reduced manual effort; use portfolio value as a tiebreaker.

**Priority:** P0 = direct application friction; P1 = meaningful reliability or productivity improvement; P2 = secondary improvement; P3 = optional enhancement.

**Workflow:** Investigate → Ready → In progress → Done. Blocked and Deferred as needed. Keep ticket IDs stable. Add acceptance criteria before implementation; mark work done only after verification. Record consequential decisions and results in [JOURNAL.md](JOURNAL.md).

## In progress

None.

## Ready

### JH-001 — One-click tracker refresh

**P0 · Product, reliability**

Observed: a potentially closed posting remained marked for application. The tracker should be current before an application session begins.

**Acceptance criteria:**

- [ ] Initiate a refresh of actionable postings with one action.
- [ ] Verify availability using authoritative employer or ATS sources.
- [ ] Distinguish open, closed and unknown availability from application progress (JH-002).
- [ ] Distinguish confirmed closure from a failed verification; retain the last known availability on transient failure.
- [ ] Record successful verification timestamps; do not represent failed checks as successful.
- [ ] Detect material posting changes where source data supports comparison; flag affected research for review.
- [ ] Preserve manual decisions, notes and approved answers.
- [ ] Safely rerun after partial failure without duplicate records or unintended changes.
- [ ] Report checked, changed, closed and failed records.
- [ ] Test representative open, closed, changed and unavailable source responses.
- [ ] Keep the refresh logic callable by a future scheduled trigger.

Select the execution environment against this workflow. JH-002 is part of the initial delivery, not a separate infrastructure project.

### JH-002 — Separate posting and application state

**P0 · Technical debt, correctness**

Observed: the same Status field represents both posting closure and personal application progress.

**Acceptance criteria:**

- [ ] Represent posting availability independently of application status.
- [ ] Preserve existing records and decisions; flag ambiguous legacy states rather than guessing.
- [ ] Keep an applied job's application status intact when its posting closes.
- [ ] Distinguish verification, material change, status change and submission timestamps where needed.
- [ ] Maintain usable filtering and sorting in the existing Sheets interface.

### JH-003 — One-click application bookkeeping

**P0 · Product, correctness**

Reduce manual work after applying or dismissing an opportunity. A deliberate user action should update the relevant state and timestamps together.

**Acceptance criteria:**

- [ ] Mark an opportunity applied with one action, recording its submission timestamp.
- [ ] Repeated actions do not silently overwrite the original submission timestamp.
- [ ] Support intentional corrections and preserve unrelated fields.
- [ ] Keep submission itself manual.

Depends on JH-002.

## Needs investigation

Items below are candidates, not commitments. Distinguish observed deficiencies from unverified risks during triage.

| ID | Priority | Ticket | Problem / desired outcome |
|---|---|---|---|
| JH-004 | P0 | Application readiness | Observed missing motivation answers across the actionable queue. Identify why; reliably provide concise fit research and grounded drafts before review. |
| JH-005 | P1 | Audit workflow coordination | Inspect existing scheduled tasks, dependencies, overlap, failure behavior and ownership. Replace prompt-based orchestration with deterministic logic where useful. |
| JH-006 | P1 | Identity and deduplication | Establish stable posting identifiers and safe upsert behavior. Investigate duplicate and wrong-row update risks. |
| JH-007 | P1 | Manual edit protection | Define human-owned and machine-owned fields. Test preservation of approved content and deliberate decisions across reruns. |
| JH-008 | P1 | Retry and partial failure recovery | Establish actual failure modes; ensure completed work survives interruptions and failed records can be retried independently where justified. |
| JH-009 | P1 | Data validation | Observed eligibility and fit details embedded in notes. Structure only information needed for filtering, validation or automated decisions; retain useful narrative context. |
| JH-010 | P1 | Automation visibility | Surface last successful run, record counts and actionable errors. Prefer lightweight summaries over a monitoring subsystem. |
| JH-011 | P1 | Systematic employer discovery | Measure coverage; use the existing Companies registry to poll known employer ATS boards. Retain exploratory AI research for unfamiliar employers. |
| JH-012 | P1 | Queue prioritization | Keep actionable opportunities prominent; account for freshness, fit, readiness and personal preferences without overriding human rankings. |
| JH-013 | P1 | Correspondence reconciliation | Audit current Gmail sync. Deduplicate messages, match confirmations and subsequent developments to the correct application, and flag ambiguity. |
| JH-014 | P2 | Incremental processing | Investigate repeated employer research and inference. Reuse verified context and evaluate only new, changed or incomplete records as appropriate. |
| JH-015 | P2 | AI output quality | Establish representative, synthetic evaluation cases for factual grounding, eligibility, fit and answer quality. Validate structured outputs and measure quality, latency and cost. |
| JH-016 | P2 | Configuration and candidate context | Inventory scattered prompts, preferences and professional experience sources. Establish clear ownership and versioned, reusable context without publishing private data. |
| JH-017 | P2 | Application material access | Reduce time spent locating relevant resumes, experience notes and reusable answers; link supporting Drive materials from job records where useful. |
| JH-018 | P2 | Scheduled refresh | Schedule the verified JH-001 workflow after manual use proves reliable. Avoid overlapping writers and unnecessary repeated checks. |
| JH-019 | P2 | Outcome measurement | Establish a lightweight baseline for applications submitted, preparation time, stale-posting encounters and automation failures. Measure improvement without burdensome tracking. |
| JH-020 | P3 | Feedback-informed discovery | Investigate whether recurring dismissal reasons should inform subsequent filtering and AI evaluation. No fine-tuning required. |
| JH-021 | P3 | Targeted preparation | Generate additional answers and tailored resume content on demand; consider Docs templates only if formatting becomes recurring friction. |

## Deferred

| ID | Priority | Ticket | Revisit when |
|---|---|---|---|
| JH-022 | P3 | Durable asynchronous orchestration | Simple execution and persisted state no longer provide adequate retry, duration or concurrency guarantees. |
| JH-023 | P3 | Dedicated database | Sheets demonstrably impedes consistency, queryability or state management. |
| JH-024 | P3 | Custom frontend | The existing interface materially limits application throughput or usability. |

Automated application submission and general-purpose agent frameworks are outside the current scope.

## Done

None.

## Triage

First deliver JH-001 and JH-002 as a small end-to-end improvement; JH-003 and JH-004 are the next candidates. Incorporate the reliability work needed for each delivery rather than building generic infrastructure up front. Investigate JH-005 early to avoid conflicting automation writes.

Reassess priorities after real application sessions. Preserve Google Sheets, Drive and Gmail unless evidence warrants replacing them.
