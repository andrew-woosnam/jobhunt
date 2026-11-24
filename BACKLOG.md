# Backlog

Prioritize improvements that reduce application effort or increase application throughput, accounting for development and maintenance costs. See [JOURNAL.md](JOURNAL.md) for the rationale.

**Now** is the current focus; **Next** contains candidate improvements in approximate priority order; **Parked** contains ideas to revisit only when actual usage warrants them. Preserve ticket IDs, including consolidated tickets. Add acceptance criteria when selecting work for implementation. Record verified outcomes in Done.

## Now

### JH-004 — Prepare application answers in advance

**Status:** Ready for experiment

Repeated AI interactions to draft application answers are the largest recurring source of friction. Determine whether application questions can be retrieved and answered ahead of time using existing tools.

**Experiment:**

- [ ] Select three to five actionable opportunities.
- [ ] Retrieve their actual application questions where accessible; identify any inaccessible forms.
- [ ] Prepare grounded, tailored drafts using existing candidate information and previous answers.
- [ ] Store drafts somewhere convenient for application submission.
- [ ] Apply to the selected opportunities and assess time savings, answer quality and remaining friction.

Record findings in the journal. Do not build generalized extraction or processing infrastructure until the experiment demonstrates a need.

## Next

| ID | Improvement | Desired outcome |
|---|---|---|
| JH-012 | Simplify employer and listing eligibility | New suitable listings from approved employers enter the actionable queue without redundant manual approval. Employer decisions remain revisable; individual listings retain independent fit rankings, dismissal and deprioritization options. Preserve history when eligibility changes. |
| JH-016 | Improve candidate context and answer reuse | Retrieve relevant professional experience and previous answers without repeatedly researching or drafting from scratch. Keep private candidate information outside the public repository. |
| JH-013 | Validate email reconciliation | Evaluate the existing confirmation-email workflow and correct demonstrated gaps. Unambiguous confirmations update the correct application record and submission date; ambiguous matches remain for review. |
| JH-001 | Automatically identify closed postings | Use existing automation where adequate to verify actionable postings and remove confirmed closures from the active queue without deleting records or losing application history. Record the date closure was first observed, not an assumed actual closure date. Verification failures must not be treated as closures. |

Reassess this order after the application preparation experiment. Scope each improvement to the smallest useful outcome.

## Consolidated / supporting work

These original tickets are retained for continuity but are not independent deliverables. Address their concerns within relevant features only when warranted.

| ID | Original concern | Treatment |
|---|---|---|
| JH-002 | Separate posting and application state | Make only the schema adjustments needed by JH-012 and JH-001; preserve existing application progress. |
| JH-005 | Workflow coordination | Inspect relevant existing automations before changing their responsibilities or introducing additional writers. |
| JH-006 | Identity and deduplication | Address demonstrated identity or matching risks within affected workflows. |
| JH-007 | Manual edit protection | Preserve manual decisions and approved content in each affected workflow. |
| JH-008 | Retry and partial failure recovery | Handle concrete failure modes within affected workflows; avoid generic retry infrastructure. |
| JH-009 | Data validation | Structure and validate fields as needed for actual filtering or automated updates. |
| JH-010 | Automation visibility | Use lightweight execution summaries and actionable errors where needed. |
| JH-014 | Incremental processing | Incorporate into JH-016 where it reduces redundant research or inference. |
| JH-015 | AI output quality | Evaluate grounding and practical answer quality within JH-004 before considering dedicated evaluation tooling. |
| JH-018 | Scheduled refresh | Incorporate into JH-001 using existing scheduling where adequate. |
| JH-019 | Outcome measurement | Record informal time savings and observed friction in the journal. No dedicated analytics implementation. |

Material posting change detection is deferred within JH-001 unless stale research becomes a meaningful problem.

## Parked

| ID | Improvement | Revisit when |
|---|---|---|
| JH-003 | One-click application bookkeeping | Email reconciliation leaves significant manual bookkeeping. |
| JH-011 | Systematic employer discovery | The existing discovery workflow fails to supply enough suitable opportunities. |
| JH-017 | Application material access | Locating resumes or supporting materials becomes recurring friction. |
| JH-020 | Feedback-informed discovery | Repeated unsuitable recommendations demonstrate a discovery-quality problem. |
| JH-021 | Targeted preparation and resume tailoring | A standard resume or existing answer-preparation workflow is insufficient. |
| JH-022 | Durable asynchronous orchestration | Simple execution demonstrably fails to meet reliability or duration requirements. |
| JH-023 | Dedicated database | Sheets materially impedes consistency, queryability or state management. |
| JH-024 | Custom frontend | The existing interface materially limits application throughput. |

Automated application submission and general-purpose agent frameworks remain outside the current scope.

## Done

None.
