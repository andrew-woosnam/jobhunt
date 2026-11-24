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
- **Resource efficiency:** Avoid redundant computation, unnecessary inference and idle infrastructure.
- **Human agency:** Automate repetitive work rather than consequential decisions.

## Project status

Early-stage planning and incremental development.

The existing system uses Google Sheets, Drive, Gmail and scheduled ChatGPT workflows. Development will focus on addressing observed limitations rather than replacing functional components wholesale.

See the [engineering journal](JOURNAL.md) for design decisions, experiments, tradeoffs and results.
