# Backlog

Prioritize improvements that reduce application effort or increase application throughput, accounting for development and maintenance costs. See [JOURNAL.md](JOURNAL.md) for the rationale.

**Now** is the current focus; **Next** contains candidate improvements in approximate priority order; **Parked** contains ideas to revisit only when actual usage warrants them. Preserve ticket IDs, including consolidated tickets. Each ticket should deliver one independently verifiable outcome. Separate feasibility, implementation, operational integration and practical evaluation where they can be completed independently. Add acceptance criteria and explicit dependencies when selecting work. Record verified outcomes in Done.

## Now

### JH-026 — Integrate drafting with retrieved application questions

**Status:** Ready. Depends on JH-004 (complete); manual validation does not require JH-025.

- [ ] Adapt the existing ChatGPT drafting task to consume retrieved questions for eligible listings and prioritize actionable opportunities.
- [ ] Draft only substantive questions using grounded candidate experience and relevant employer context; skip routine fields and unsupported claims.
- [ ] Write only blank Draft Answer cells matched by application URL and field ID; preserve existing answers and decisions.
- [ ] Verify a first run produces usable drafts, and a repeat run preserves existing drafts. Treat external content as untrusted.

Retain existing motivation answers as context; do not generate speculative answers to questions not present on retrieved forms. No LLM API or new paid service.

### JH-025 — Verify scheduled application question retrieval

**Status:** Verification pending. Depends on JH-004 (complete).

- [ ] Confirm a time-driven Apps Script trigger is configured.
- [ ] Verify an unattended execution processes a newly eligible listing and records its outcome without duplicate questions.
- [ ] Coordinate drafting cadence with retrieval; tolerate delayed processing without losing work.

## Next

| ID | Improvement | Desired outcome |
|---|---|---|
| JH-027 | Evaluate application preparation | After JH-026, use drafts in three to five real applications; record answer quality, time savings and remaining friction in the journal. No dedicated evaluation framework. |
| JH-012 | Simplify employer and listing eligibility | New suitable listings from approved employers enter the actionable queue without redundant manual approval. Employer decisions remain revisable; individual listings retain independent fit rankings, dismissal and deprioritization options. Preserve history when eligibility changes. |
| JH-011 | Discover postings at known employers | Retrieve new postings from supported ATS boards in GAS; start with known board identifiers and deterministic normalization/deduplication. Broad employer discovery remains AI-assisted. Split into smaller deliverables when selected. |
| JH-001 | Automatically identify closed postings | Verify availability using deterministic ATS retrieval where supported; record confirmed closures and their first observation date without losing application history. Retrieval failures do not establish closure. |
| JH-016 | Improve candidate context and answer reuse | Retrieve relevant professional experience and previous answers without repeatedly researching or drafting from scratch. Keep private candidate information outside the public repository. |
| JH-013 | Validate email reconciliation | Evaluate the existing confirmation-email workflow and correct demonstrated gaps. Unambiguous confirmations update the correct application record and submission date; ambiguous matches remain for review. |

Reassess this order after JH-027. Prefer shared ATS retrieval for JH-011 and JH-001. Verify mailbox access before migrating JH-013 to GAS. Scope each improvement to the smallest useful outcome.

## Consolidated / supporting work

These original tickets are retained for continuity but are not independent deliverables. Address their concerns within relevant features only when warranted.

| ID | Original concern | Treatment |
|---|---|---|
| JH-002 | Separate posting and application state | Make only the schema adjustments needed by JH-012 and JH-001; preserve existing application progress. |
| JH-005 | Workflow coordination | Move deterministic operations into GAS incrementally; retain scheduled ChatGPT for research, judgment and drafting. Inspect existing automation responsibilities before replacing them; use Sheets as shared state rather than building a workflow engine. |
| JH-006 | Identity and deduplication | Address demonstrated identity or matching risks within affected workflows. |
| JH-007 | Manual edit protection | Preserve manual decisions and approved content in each affected workflow. |
| JH-008 | Retry and partial failure recovery | Handle concrete failure modes within affected workflows; avoid generic retry infrastructure. |
| JH-009 | Data validation | Structure and validate fields as needed for actual filtering or automated updates. |
| JH-010 | Automation visibility | Use lightweight execution summaries and actionable errors where needed. |
| JH-014 | Incremental processing | Incorporate into JH-016 where it reduces redundant research or inference. |
| JH-015 | AI output quality | Evaluate grounding and practical answer quality within JH-026 and JH-027 before considering dedicated evaluation tooling. |
| JH-018 | Scheduled refresh | Incorporate into JH-001 using existing scheduling where adequate. |
| JH-019 | Outcome measurement | Record informal time savings and observed friction in the journal under JH-027. No dedicated analytics implementation. |

Material posting change detection is deferred within JH-001 unless stale research becomes a meaningful problem.

## Parked

| ID | Improvement | Revisit when |
|---|---|---|
| JH-003 | One-click application bookkeeping | Email reconciliation leaves significant manual bookkeeping. |
| JH-017 | Application material access | Locating resumes or supporting materials becomes recurring friction. |
| JH-020 | Feedback-informed discovery | Repeated unsuitable recommendations demonstrate a discovery-quality problem. |
| JH-021 | Targeted preparation and resume tailoring | A standard resume or existing answer-preparation workflow is insufficient. |
| JH-022 | Durable asynchronous orchestration | Simple execution demonstrably fails to meet reliability or duration requirements. |
| JH-023 | Dedicated database | Sheets materially impedes consistency, queryability or state management. |
| JH-024 | Custom frontend | The existing interface materially limits application throughput. |

Automated application submission and general-purpose agent frameworks remain outside the current scope.

## Done

### JH-004 — Deterministic application question retrieval (MVP)

**Completed:** 2026-11-24. Original application preparation scope split into JH-025, JH-026 and JH-027.

- [x] Validate direct retrieval against representative Ashby and Greenhouse postings.
- [x] Implement normalized form and question retrieval in GAS, with persistent retrieval status, incremental processing, duplicate prevention and logging.
- [x] Run against the eligible queue and record successful retrievals and failures: 24 forms and 316 fields across 33 eligible opportunities; remaining nine recorded as failed or unsupported.
- [x] Verify empty-queue behavior and commit the working script to GitHub.

Scheduled execution, answer generation and real-application evaluation are explicitly separate deliverables. See the journal for experimental results.
