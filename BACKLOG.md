# Backlog

Prioritize improvements that reduce application effort or increase application throughput, accounting for development and maintenance costs. See [JOURNAL.md](JOURNAL.md) for the rationale.

**Now** is the current focus; **Next** contains candidate improvements in approximate priority order; **Parked** contains ideas to revisit only when actual usage warrants them. Preserve ticket IDs, including consolidated tickets. Each ticket should deliver one independently verifiable outcome. Separate feasibility, implementation, operational integration and practical evaluation where they can be completed independently. Add acceptance criteria and explicit dependencies when selecting work. Record verified outcomes in Done.

## Now

No active development ticket; select the next increment from Next.

## Next

Prioritize the following increments in approximate delivery order toward the [intended workflow](README.md#intended-workflow). Independent work can proceed while awaiting scheduled runs; do not make operational verification or practical evaluation a blanket blocker for unrelated work. Reuse existing functionality rather than adding infrastructure.

### 1. Finish and expose application preparation

Highest immediate return: make the implemented retrieval/drafting pipeline reliable in unattended operation and useful from the existing Listings view. Evaluate real applications before expanding prompt sophistication.

| ID | Improvement | Desired outcome / acceptance criteria | Dependencies |
|---|---|---|---|
| JH-037 | Confirm question retrieval trigger | Confirm or configure the time-driven Google Apps Script trigger for application question retrieval. | JH-004 |
| JH-038 | Verify unattended question retrieval | Inspect a successful time-driven execution. An empty-queue run is sufficient initially; confirm newly eligible listings are processed without duplicates during normal use. | JH-037 |
| JH-034 | Verify unattended AI drafting | Inspect a scheduled run for successful current prompt retrieval, matching file SHA and correct incremental processing. No manual initiation required. | JH-026 |
| JH-039 | Verify retrieval-to-drafting cadence | Confirm the scheduled retrieval and drafting tasks hand off outstanding work across runs without requiring strict ordering or losing delayed work. Adjust cadence only if needed. | JH-038, JH-034 |
| JH-035 | Verify fail-closed prompt retrieval | Use a controlled missing-file or failed-retrieval case to confirm the drafting task reports the failure and performs no writes. Avoid disrupting the live schedule or tracker. | JH-026 |
| JH-036 | Verify drafting prompt-injection resistance | Exercise representative untrusted application-field instructions using sanitized fixtures; confirm the task ignores malicious instructions, does not bypass human checks or disclose private data, and respects its write boundary. | JH-026 |
| JH-040 | Recover transient application form retrieval failures | Fix the observed defect in which any Application Forms record, including Failed, permanently excludes a URL from retrieval. Retry transient HTTP/network failures with a bounded attempt limit and spacing; retain terminal unsupported cases and report exhausted failures for manual review. Preserve existing question identities and drafts, and verify retry success, exhaustion and repeat execution using sanitized fixtures or controlled failures. | JH-004 |
| JH-027 | Evaluate application preparation | Use drafts in three to five real applications; record answer quality, time savings and remaining friction in the journal. No dedicated evaluation framework. | JH-026 |
| JH-033 | Refine application drafting prompts | After baseline validation, allow targeted retrieval of documented candidate evidence; keep the bootstrap limited to retrieval, private configuration and authorization. Simplify workflow instructions around outcomes and completion criteria; distinguish question-level blockers from systemic failures, continue useful work and avoid blocked listings monopolizing the budget. Preserve grounding, prompt-injection safeguards, identity checks, non-overwrite and read-back verification. Compare representative outputs before/after; add examples or persistent state only for observed failures. | JH-026 |

### 2. Automate known-employer discovery and availability

Next substantive implementation. Employer approval is a small prerequisite; shared board retrieval is the highest-leverage new deterministic capability. Use the same board data for discovery, closure detection and filtering, then hand off judgment to AI.

| ID | Improvement | Desired outcome / acceptance criteria | Dependencies |
|---|---|---|---|
| JH-012 | Formalize employer approval | Establish a single authoritative, revisable employer decision (approved, unreviewed, excluded; retain existing labels if equivalent). Retain the single Decision field (redundant Interest already removed), formalize explicit approval, preserve existing human decisions and history, and keep listing priority independent. Only approved employers enter deterministic board discovery; update affected consumers and verify exclusions. | — |
| JH-011 | Retrieve postings at approved employers | Google Apps Script retrieves published postings from known Ashby and Greenhouse boards daily, normalizes metadata and persists new postings using stable ATS identities without duplicates or overwriting manual decisions. Start with known board identifiers; keep newly discovered listings pending evaluation rather than prematurely eligible for preparation. Verify repeat execution and isolated board failures; defer additional ATS platforms until warranted. | JH-012 |
| JH-001 | Verify posting availability | Reuse successful board retrieval under JH-011 to verify unapplied listings daily without redundant requests. Record confirmed closures and their first observation date without losing application history. A failed or incomplete board response, failed form retrieval or uncertain availability is not proof of closure. Verify missing postings, partial failures and preservation of later application states. | JH-011 where supported |
| JH-030 | Filter obvious listing mismatches | Deterministic filtering excludes clear mismatches using reliable structured constraints; uncertain cases remain eligible for AI evaluation. Preserve manual overrides. | JH-011 |
| JH-029 | Integrate AI listing fit and priority evaluation | Narrow the existing AI discovery workflow to evaluate new, outstanding postings for technical fit, eligibility, compensation and priority. Explicitly gate form retrieval on suitability and employer eligibility, without requiring per-listing human approval; use explicit evaluation evidence rather than a legacy status or mere presence in Listings. Preserve manual decisions and verify incremental handoff to retrieval and drafting. Retire replaced discovery/maintenance responsibilities only once their deterministic replacements are validated. | JH-012, JH-030, JH-004; JH-001 for retiring availability checks |

### 3. Consolidate remaining AI responsibilities and legacy data

Narrow employer research and listing evaluation into distinct responsibilities. Retire superseded storage and centralize instructions only after their replacements are verified; avoid parallel mechanisms.

| ID | Improvement | Desired outcome / acceptance criteria | Dependencies |
|---|---|---|---|
| JH-028 | Discover new employers for approval | Separate employer research from listing evaluation. A scheduled ChatGPT task researches and deduplicates prospective employers two or three times weekly (e.g. M/W/Sat), plus ad hoc, and records candidates for human review without automatically approving them. Verify that existing employer decisions are preserved. | JH-012 |
| JH-042 | Version-control remaining AI workflow instructions | Extend the validated runtime prompt retrieval pattern to employer research and listing evaluation as their responsibilities stabilize. Keep private runtime configuration and authorization outside Git; verify exact revision reporting and fail-closed retrieval before retiring embedded instructions. Do not migrate the email prompt solely for consistency if Apps Script replacement is imminent. | JH-034–JH-036, JH-028, JH-029 |
| JH-016 | Improve candidate context and answer reuse | Retrieve relevant professional experience and previous answers without repeatedly researching or drafting from scratch. Keep private candidate information outside the public repository. | Reassess after JH-027 |

### 4. Migrate email reconciliation

Lower urgency: the existing AI confirmation workflow is useful and should remain active until a deterministic replacement is verified.

| ID | Improvement | Desired outcome / acceptance criteria | Dependencies |
|---|---|---|---|
| JH-031 | Migrate unambiguous email reconciliation | Google Apps Script checks relevant confirmations daily and updates only confidently matched existing listings; ambiguous cases remain for review. Validate row transfer and repeat execution across Listings, Applications and Job History, preservation of later statuses and existing dates, and recovery from partial transfers before disabling the replaced AI behavior. | JH-013 |

Human review, reprioritization, dismissal and application submission remain existing manual operations; no automation ticket is needed for them. Question retrieval and drafting are implemented under JH-004 and JH-026; remaining scheduled-operation checks are tracked separately.

Prefer shared ATS retrieval for discovery and availability verification. Verify access before migrating email reconciliation. Retire superseded scheduled-task responsibilities only after their replacements are validated. Reassess delivery order after JH-027; avoid speculative infrastructure.

## Consolidated / supporting work

These original tickets are retained for continuity but are not independent deliverables. Address their concerns within relevant features only when warranted.

| ID | Original concern | Treatment |
|---|---|---|
| JH-025 | Scheduled application question retrieval | Retrieval implementation is complete under JH-004; original scheduling scope is split into JH-037–JH-039. Operational verification remains outstanding. |
| JH-002 | Separate posting and application state | Schema migration complete: Listings implies unapplied intent, Applications holds ongoing submissions, Job History holds terminal records; Listings Status removed. Remaining operational transitions and employer/listing eligibility are tracked under JH-031, JH-012, JH-029 and JH-001. |
| JH-005 | Workflow coordination | Move deterministic operations into Google Apps Script incrementally; retain scheduled ChatGPT for research, judgment and drafting. Inspect existing automation responsibilities before replacing them; use Sheets as shared state rather than building a workflow engine. |
| JH-006 | Identity and deduplication | Address demonstrated identity or matching risks within affected workflows. |
| JH-007 | Manual edit protection | Preserve manual decisions and approved content in each affected workflow. |
| JH-008 | Retry and partial failure recovery | Handle concrete failure modes within affected workflows; the observed form retrieval retry defect is tracked independently under JH-040. Avoid generic retry infrastructure. |
| JH-009 | Data validation | Structure and validate fields as needed for actual filtering or automated updates. |
| JH-010 | Automation visibility | Use lightweight execution summaries and actionable errors where needed; preparation visibility is tracked under JH-041. |
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

### JH-013 — Validate email reconciliation (baseline)

**Completed:** 2026-11-24. Scheduled email sync reported one unambiguous confirmation matched and verified in the tracker; independent read-back confirmed the applied status and original application date. An ambiguous older confirmation was correctly left untouched. This validates the existing mailbox access and baseline matching behavior, not the subsequently introduced cross-tab row transfer. Verify that transition in normal use and under JH-031 before retiring AI reconciliation.

### JH-032 — Retire legacy listing-specific motivation storage

**Completed:** 2026-11-24 (schema migration and consumer updates). At the user's request, retired the obsolete column before the separate practical evaluation JH-027.

- [x] Preserve the three existing motivation drafts verbatim in Answers, with listing provenance and a historical-draft label; verify before deletion.
- [x] Remove the Jobs motivation column and update the versioned drafting prompt and all three scheduled job-search workflows.
- [x] Verify the existing 46 listings and their preparation and status values after the cleanup. Subsequent unattended execution remains unverified.


### JH-041 — Surface application readiness in Jobs (MVP)

**Completed:** 2026-11-24. Live tracker formula and classification migration verified; unattended processing of newly retrieved questions and newly added jobs remains to be observed in normal runs.

- [x] Add a filterable, formula-derived Preparation column to the existing Jobs table without replacing Status or Priority.
- [x] Distinguish Pending Retrieval, Pending Drafting, Ready, Needs Input and Manual Preparation using form retrieval status, field count, existing drafts and explicit question disposition.
- [x] Add minimal Draft Disposition to Application Questions: blank is pending unless a draft exists; Not Needed identifies routine fields; Needs Input identifies missing evidence or an applicant decision. A nonblank draft takes precedence.
- [x] Backfill existing questions without overwriting drafts; verify representative no-bespoke-question, complete-draft, partial-draft, blocked, failed and unsupported cases against the live formula results.
- [x] Update the versioned drafting prompt and its runtime authorization boundary; instruct the discovery task to copy the formula for new and manually added job rows.

The current Listings field is Automated Preparation: Complete, Partial or Pending. Complete means all bespoke questions have been addressed, not that the posting is open, the applicant is eligible, or routine form inputs have been filled. Pending takes precedence while further automated work remains; Partial includes failed/unsupported retrieval and unresolved questions requiring human input once automatic work is exhausted. Failure or inconsistent retrieval counts never imply readiness. Existing Apps Script writes remain compatible; no deployment required for this increment. See the journal for verification and remaining limitations.

### JH-026 — Integrate drafting with retrieved application questions (MVP / 26.1)

**Completed:** 2026-11-24. Manual integration and repeat-run validation passed. Remaining verification is tracked separately in JH-034–JH-036.

- [x] Adapt the existing ChatGPT task to consume retrieved questions for eligible listings and store instructions in `prompts/draft-answers.md`.
- [x] Verify current prompt retrieval and reported file SHA on manually initiated runs.
- [x] Validate substantive, grounded drafts and appropriate abstention on observed motivation and technical questions.
- [x] Verify persisted drafts on eligible question identities and preservation of earlier answers on repeat execution.
- [x] Verify queue progress: four then five new drafts across two runs, with zero reported write failures and no duplicate question identities.

Retain existing motivation answers as context; legacy column retirement is JH-032. No new schema or paid service. See the journal for results and verification limitations.

### JH-004 — Deterministic application question retrieval (MVP)

**Completed:** 2026-11-24. Original application preparation scope split into JH-025, JH-026 and JH-027.

- [x] Validate direct retrieval against representative Ashby and Greenhouse postings.
- [x] Implement normalized form and question retrieval in Google Apps Script, with persistent retrieval status, incremental processing, duplicate prevention and logging.
- [x] Run against the eligible queue and record successful retrievals and failures: 24 forms and 316 fields across 33 eligible opportunities; remaining nine recorded as failed or unsupported.
- [x] Verify empty-queue behavior and commit the working script to GitHub.

Scheduled execution, answer generation and real-application evaluation are explicitly separate deliverables. See the journal for experimental results.
