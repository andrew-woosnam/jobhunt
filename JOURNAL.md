# Engineering Journal

A concise record of observations, decisions, experiments, tradeoffs and outcomes.

## 2026-11-24 — Establishing a baseline

### Status quo

The existing system consists of several loosely coordinated components:

| Component | Responsibility |
|---|---|
| Google Sheets | Opportunity tracking, employer registry, reusable answers |
| Google Drive | Professional experience, resumes, application materials |
| Gmail | Employer correspondence |
| Scheduled ChatGPT tasks | Discovery, evaluation, answer drafting, correspondence reconciliation |
| Interactive ChatGPT sessions | Targeted research and application preparation |

Sheets serves as both the operational data store and the user interface. Three independently scheduled AI workflows perform much of the routine maintenance.

![Existing job application tracker with representative records](docs/images/baseline-jobs.png)

*Existing Google Sheets interface, with synthetic data substituted for private application records.*

This arrangement is useful, inexpensive and flexible, but far from hands-off.

### Product shortcomings

- Postings can become stale or close before I review them.
- Opportunities aren't consistently application-ready.
- Application decisions still require manual bookkeeping.
- Discovery coverage is difficult to assess.
- Workflows require more supervision than intended.

Ideally, I should be able to sit down with a current, prioritized, application-ready queue and spend my time applying rather than maintaining it.

### Technical shortcomings

- Posting availability and application status are conflated.
- Workflow coordination relies largely on scheduling and prompt instructions.
- LLMs are responsible for some inherently deterministic operations.
- Structured data is inconsistently represented.
- Processing failures and incomplete work are difficult to diagnose.

Idempotency, failure recovery, redundant inference and protection of manual edits warrant further investigation.

### Initial findings

A snapshot of the tracker contained 46 opportunities, 34 of which were awaiting review or application. All 34 lacked preliminary motivation answers. At least one potentially closed posting remained marked for application.

The system is generating useful opportunities, but not consistently maintaining an application-ready queue.

### Direction

Retain the components that work well. Establish and triage a backlog of product and technical shortcomings before committing to architectural changes.

An initial candidate for improvement is one-click tracker refresh: verify posting availability, detect material changes and accurately update relevant state and timestamps.

Select infrastructure based on concrete requirements rather than anticipated complexity.
