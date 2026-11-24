# Backlog

Prioritize improvements that reduce application effort or increase application throughput, accounting for development and maintenance costs. See [JOURNAL.md](JOURNAL.md) for the rationale.

**Now** is the current focus; **Next** contains candidate improvements in approximate priority order; **Parked** contains ideas to revisit only when actual usage warrants them. Preserve ticket IDs, including consolidated tickets. Each ticket should deliver one independently verifiable outcome. Separate feasibility, implementation, operational integration and practical evaluation where they can be completed independently. Add acceptance criteria and explicit dependencies when selecting work. Record verified outcomes in Done.

## Now

### JH-026 — Integrate drafting with retrieved application questions

**Status:** Configured; execution verification pending. Depends on JH-004 (complete); manual validation does not require JH-025.

- [x] Adapt the existing ChatGPT drafting task to consume retrieved questions for eligible listings and prioritize actionable opportunities; store its generic instructions in `prompts/draft-answers.md`.
- [ ] Verify that the scheduled task fetches the current prompt revision, reports its file SHA and stops without writes if retrieval fails.
- [ ] Draft only substantive questions using grounded candidate experience and relevant employer context; skip routine fields and unsupported claims.
- [ ] Write only blank Draft Answer cells matched by application URL and field ID; preserve existing answers and decisions.
- [ ] Verify a first run produces usable drafts, and a repeat run preserves existing drafts. Treat external content as untrusted.

Retain existing motivation answers as context; do not generate speculative answers to questions not present on retrieved forms. Use the existing schema for the first integration; legacy column retirement is JH-032. No LLM API or new paid service.

### JH-025 — Verify scheduled application question retrieval

**Status:** Verification pending. Depends on JH-004 (complete).

- [ ] Confirm a time-driven Apps Script trigger is configured.
- [ ] Verify an unattended execution processes a newly eligible listing and records its outcome without duplicate questions.
- [ ] Coordinate drafting cadence with retrieval; tolerate delayed processing without losing work.

## Next

Complete the application preparation increment first, then align the remaining work with the [intended workflow](README.md#intended-workflow). The table below follows workflow order, not a mandatory development sequence. Reuse existing functionality where possible.

| ID | Improvement | Desired outcome / acceptance criteria | Dependencies |
|---|---|---|---|
| JH-033 | Refine application drafting prompts | After baseline validation, allow targeted retrieval of documented candidate evidence; keep the bootstrap limited to retrieval, private configuration and authorization. Simplify workflow instructions around outcomes and completion criteria; distinguish question-level blockers from systemic failures, continue useful work and avoid blocked listings monopolizing the budget. Preserve grounding, prompt-injection safeguards, identity checks, non-overwrite and read-back verification. Compare representative outputs before/after; add examples or persistent state only for observed failures. | JH-026 |
| JH-027 | Evaluate application preparation | Use drafts in three to five real applications; record answer quality, time savings and remaining friction in the journal. No dedicated evaluation framework. | JH-026 |
| JH-028 | Discover new employers for approval | A scheduled ChatGPT task researches and deduplicates prospective employers two or three times weekly, plus ad hoc, and records candidates for human review without automatically approving them. | JH-012's approval semantics |
| JH-012 | Formalize employer approval | Establish unambiguous, revisable employer approval/exclusion in the existing tracker. Unreviewed employers do not enter deterministic board discovery. Preserve history when decisions change. | — |
| JH-011 | Retrieve postings at approved employers | Google Apps Script retrieves published postings from known supported ATS boards daily, normalizes metadata and persists new postings without duplicate identities or overwriting manual decisions. Start with known board identifiers; defer unsupported boards. | JH-012 |
| JH-030 | Filter obvious listing mismatches | Deterministic filtering excludes clear mismatches using reliable structured constraints; uncertain cases remain eligible for AI evaluation. Preserve manual overrides. | JH-011 |
| JH-029 | Integrate AI listing fit and priority evaluation | Adapt the existing AI discovery workflow to assess new, unevaluated listings for technical fit, eligibility, compensation and priority. Suitable listings proceed to form retrieval without mandatory per-listing approval; unsuitable listings do not. Verify the handoff and preservation of manual decisions. | JH-030, JH-004 |
| JH-001 | Verify posting availability | Google Apps Script verifies unapplied listings daily, preferably using the board retrieval already performed by JH-011. Record confirmed closures and their first observation date without losing application history. Failed form retrieval or uncertain availability is not proof of closure. | Reuse JH-011 where supported |
| JH-013 | Validate email reconciliation | Verify the existing confirmation-email workflow and mailbox access; identify reliably matchable confirmations and cases requiring judgment. Preserve the original application date and avoid ambiguous matches. | — |
| JH-031 | Migrate unambiguous email reconciliation | Google Apps Script checks relevant confirmations daily and updates only confidently matched existing listings; ambiguous cases remain for review. Validate repeat execution and preservation of later statuses and existing dates before disabling the replaced AI behavior. | JH-013 |
| JH-032 | Retire legacy listing-specific motivation storage | Preserve existing motivation answers, update remaining consumers and remove the superseded Jobs motivation column once drafting against actual questions is validated. | JH-026 |
| JH-016 | Improve candidate context and answer reuse | Retrieve relevant professional experience and previous answers without repeatedly researching or drafting from scratch. Keep private candidate information outside the public repository. | Reassess after JH-027 |

Human review, reprioritization, dismissal and application submission remain existing manual operations; no automation ticket is needed for them. Question retrieval and drafting are covered by JH-004, JH-025 and JH-026.

Prefer shared ATS retrieval for discovery and availability verification. Verify access before migrating email reconciliation. Retire superseded scheduled-task responsibilities only after their replacements are validated. Reassess delivery order after JH-027; avoid speculative infrastructure.

## Consolidated / supporting work

These original tickets are retained for continuity but are not independent deliverables. Address their concerns within relevant features only when warranted.

| ID | Original concern | Treatment |
|---|---|---|
| JH-002 | Separate posting and application state | Make only the schema adjustments needed by employer approval, listing evaluation and availability verification (JH-012, JH-029, JH-001); preserve existing application progress. |
| JH-005 | Workflow coordination | Move deterministic operations into Google Apps Script incrementally; retain scheduled ChatGPT for research, judgment and drafting. Inspect existing automation responsibilities before replacing them; use Sheets as shared state rather than building a workflow engine. |
| JH-006 | Identity and deduplication | Address demonstrated identity or matching risks within affected workflows. |
| JH-007 | Manual edit protection | Preserve manual decisions and approved content in each affected workflow. |
| JH-008 | Retry and partial failure recovery | Handle concrete failure modes within affected workflows; avoid generic retry infrastructure. |
| JH-009 | Data validation | Structure and validate fields as needed for actual filtering or automated updates. |
| JH-010 | Automation visibility | Use lightweight execution summaries and actionable errors where needed. |
| JH-014 | Incremental processing | Apply within each workflow to avoid redundant retrieval, research or inference; no separate framework. |
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
- [x] Implement normalized form and question retrieval in Google Apps Script, with persistent retrieval status, incremental processing, duplicate prevention and logging.
- [x] Run against the eligible queue and record successful retrievals and failures: 24 forms and 316 fields across 33 eligible opportunities; remaining nine recorded as failed or unsupported.
- [x] Verify empty-queue behavior and commit the working script to GitHub.

Scheduled execution, answer generation and real-application evaluation are explicitly separate deliverables. See the journal for experimental results.
