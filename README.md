# jobhunt

AI-assisted job discovery and application management, emphasizing reliability, simplicity and resource efficiency.

## Background

Job searching involves a considerable amount of repetitive work: finding relevant openings, researching employers, evaluating fit, tailoring application materials, answering variations of the same questions and tracking correspondence.

Tired of repeating these steps manually, I began automating portions of the process. This gradually evolved into a functional but cobbled-together collection of spreadsheets, documents, scripts, integrations and scheduled AI workflows.

It's considerably better than the manual alternative, but still requires more supervision, coordination and correction than I'd like. I suspect most of this work can be made effectively hands-off, leaving me to focus on reviewing opportunities, making decisions and submitting applications.

This project aims to evolve that existing system into something cohesive, reliable and maintainable. It also serves as a practical exploration of AI-assisted system design.

## Objectives

- Increase application throughput without sacrificing quality.
- Minimize repetitive work and unnecessary human intervention.
- Combine deterministic software with AI where each is most effective.
- Keep operational costs, resource consumption and maintenance overhead low.

This is first and foremost a tool to support my own job search. Its effectiveness matters more than its architectural sophistication.

## Engineering philosophy

- **Pragmatism:** Preserve existing components that work well. Introduce complexity only when justified.
- **Appropriate use of AI:** Use LLMs for research, interpretation, judgment and writing. Use deterministic software for orchestration, validation and state management.
- **Reliability:** Favor incremental, idempotent, testable and recoverable workflows.
- **AI quality:** Ground generated content in verified information, validate structured outputs and empirically evaluate model behavior.
- **Security:** Treat external content as untrusted data. Maintain separation between instructions and retrieved content, minimize agent permissions, and account for prompt injection when designing and testing AI-assisted workflows.
- **Resource efficiency:** Avoid redundant computation, unnecessary inference and idle infrastructure.
- **Human agency:** Automate repetitive work rather than consequential decisions.

## Current architecture

- **Google Sheets:** Operational data store and user interface.
- **Google Drive and Gmail:** Candidate materials and employer correspondence.
- **Scheduled ChatGPT workflows:** Discovery, evaluation, answer drafting and correspondence reconciliation.
- **Google Apps Script:** Deterministic application form retrieval for Ashby and Greenhouse, with incremental processing, persistent retrieval status and execution logging.
- **GitHub:** Authoritative source for code and project documentation.

## Development and deployment

Apps Script source and its manifest live in [`apps-script/`](apps-script/). Google hosts and executes the script; the repository is the source of truth. Use Google's [clasp CLI](https://developers.google.com/apps-script/guides/clasp) to synchronize local source with an existing Apps Script project.

One-time setup: install `@google/clasp`, enable the Apps Script API, authenticate with `clasp login`, and configure a local `.clasp.json` for the target project. Keep project-specific configuration and credentials out of Git.

After reviewing and committing changes, deploy from the repository root:

```sh
git pull --ff-only && (cd apps-script && clasp push)
```

Manage scheduled triggers, authorization and execution history in Apps Script. Avoid editing source in the hosted editor because subsequent pushes replace the remote source. Automated deployment is deferred.

## Project status

Application question retrieval is implemented and manually validated for both supported ATS platforms. Scheduled execution and integration with automated answer drafting remain to be verified. Development focuses on observed limitations rather than wholesale replacement of functional components.

See the [engineering journal](JOURNAL.md) for design decisions and results, and the [backlog](BACKLOG.md) for current priorities.
