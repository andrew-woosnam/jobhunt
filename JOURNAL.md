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

## 2026-11-24 — Reassessing priorities

Development is beginning to compete with the project's primary purpose: submitting job applications. The existing system is reasonably functional, and many proposed improvements address technical shortcomings rather than practical obstacles.

### Observations

- Drafting responses to application questions is the largest recurring source of friction, requiring repeated interactions with AI.
- New openings at previously approved employers should not require redundant approval. Individual listings should still be ranked by suitability and dismissible independently.
- Discovering that a posting has closed is a minor inconvenience. Automatically recording closures and when they were first observed would be useful, but historical analysis is not a priority.
- Application tracking should eventually be handled automatically through employer confirmation emails.
- A standard resume is currently sufficient; automated tailoring offers little immediate value.

### Direction

Reprioritize the backlog according to demonstrated problems and anticipated time savings, accounting for development and maintenance costs.

First, experiment with retrieving questions from application forms and preparing tailored answers in advance. Evaluate feasibility and practical value through actual applications before investing in dedicated software or infrastructure.

## 2026-11-24 — JH-004: Application question retrieval

Investigated five listings across Ashby and Greenhouse. ChatGPT could retrieve the Greenhouse application questions but failed on all four Ashby forms due to client-side rendering.

Deterministic retrieval appears more promising: Greenhouse offers a documented public API, while Ashby appears to expose an undocumented frontend GraphQL endpoint. Neither mechanism has been tested directly.

Favor ATS-specific HTTP adapters for retrieving and normalizing questions. Reserve LLM usage for answer drafting and defer browser automation until necessary.

Next step: validate both endpoints against the five sample listings before implementing the retrieval layer.

### Experiment results

Direct retrieval succeeded for Figma (Greenhouse's documented Job Board API) and DuckDuckGo (Ashby's undocumented frontend GraphQL API). Both responses contain job metadata, question wording, field identifiers and types, required flags, and selection options. Some constraints, such as word limits, are expressed in prose.

This validates feasibility for one posting per ATS. The other three Ashby postings and cookie-free request replay remain untested.

Proceed with lightweight ATS-specific adapters. Accept the maintenance risk of Ashby's undocumented interface: retrieval failure should leave the opportunity available for manual application, not block the workflow or be mistaken for a form with no questions. Retain representative responses as test fixtures.

### Prompt injection

The DuckDuckGo application form contains an embedded instruction targeting AI-generated answers. This demonstrates a practical security risk when processing external content with LLMs.

Treat job descriptions, application questions, employer websites and correspondence as untrusted input. Prefer deterministic extraction, restrict model permissions and validate generated outputs before downstream use. Extraction reduces but does not eliminate prompt injection risk.

Investigate proportionate safeguards when implementing LLM-assisted application preparation. Retain this example as a regression test case.

### Validation completed

Cookie-free HTTP requests successfully retrieved application forms for all four Ashby postings using the same GraphQL query. Combined with the earlier Greenhouse test, deterministic retrieval succeeded for all five sample listings.

Eight substantive written questions were identified across three postings. The other two require no bespoke written answers, demonstrating an opportunity to avoid unnecessary LLM inference.

Retrieval feasibility is established. Accept the maintenance risk of Ashby's undocumented API and proceed with a minimal implementation that degrades gracefully.
