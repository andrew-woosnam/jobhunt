# Agent Instructions

## Context

- [README.md](README.md): objectives and engineering philosophy.
- [BACKLOG.md](BACKLOG.md): authoritative backlog.
- [JOURNAL.md](JOURNAL.md): decisions and findings.

## Project constraints

- Prioritize application throughput and reduced manual effort over portfolio value.
- Retain Google Sheets, Drive and Gmail unless demonstrated limitations justify replacement.
- Use deterministic logic for orchestration, validation, deduplication and state management; use LLMs where judgment or language processing adds value.
- Prefer Google Apps Script for deterministic scheduled operations; retain existing ChatGPT tasks for judgment-intensive work. Do not introduce a paid LLM API without explicit authorization.
- Do not implement speculative requirements from unrelated or deferred backlog items.
- Keep application submissions, withdrawals and ambiguous status changes under human control.

## Safety

- This repository is public; the operational system is private.
- Never commit credentials, personal candidate profiles, resumes, private application answers, live tracker data or employer correspondence.
- Use synthetic or sanitized fixtures, logs and demonstration materials.
- Never silently overwrite manual decisions, edits or approved content during automated processing.
- Authorization to develop functionality does not imply authorization to execute it against live data, modify active automations or deploy infrastructure.
- Commit and push only within explicitly authorized scope.

## Project maintenance

- Before each commit, review README.md against the changes being committed. Update it in the same commit if the changes materially affect documented functionality, architecture, setup, usage or project status; otherwise leave it unchanged.
- Preserve backlog ticket IDs. Reference relevant IDs in implementation commits.
- Scope each ticket to one independently verifiable outcome. Split implementation, scheduling, consumer integration and practical evaluation when they can be completed independently; record dependencies rather than bundling dependent work.
- Update relevant ticket statuses as work progresses. Mark tickets complete only after verifying acceptance criteria; record any outstanding verification.
- Distinguish observed defects from suspected problems and proposed enhancements.
- Reserve journal entries for decisions that change project direction, non-obvious tradeoffs and empirical findings. Keep entries concise.
