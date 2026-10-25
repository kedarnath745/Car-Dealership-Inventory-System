# Project documentation

How this project was planned, researched, designed and built, in the order it happened.

| Document | What it contains |
|----------|------------------|
| [WORKFLOW.md](WORKFLOW.md) | The phase-by-phase plan with checkpoints, commit rules and skills used, kept up to date as work progresses |
| [REQUIREMENTS.md](REQUIREMENTS.md) | Traceability matrix (every line of the brief → implementation → test) and the decision log D1–D37 with reasoning |
| [DESIGN.md](DESIGN.md) | Architecture, data model, API contract, validation rules, testing strategy, deployment |
| [TEST_REPORT.md](TEST_REPORT.md) | Test results, coverage and every test name |
| [INTERVIEW_NOTES.md](INTERVIEW_NOTES.md) | Demo script, decisions worth explaining, likely questions and how AI was used |
| [research/](research/README.md) | **User-centric research pack**: users and market, UX patterns, design system, accessibility/security/performance, engineering evidence, and the build spec |

## Research pack

The frontend and several backend changes were driven by desk research done before any
screen was built. Every claim carries a citation to its source.

| File | Topic |
|------|-------|
| [research/README.md](research/README.md) | Method, source quality rules and limitations |
| [research/01-users-and-market.md](research/01-users-and-market.md) | Personas, jobs to be done, buyer and dealer surveys, Indian market specifics |
| [research/02-ux-patterns.md](research/02-ux-patterns.md) | Search, filters, sorting, product cards, purchase and admin flows (Baymard, NN/g) |
| [research/03-design-system.md](research/03-design-system.md) | Apple-HIG-inspired design tokens and components, licensing rules |
| [research/04-accessibility-security-performance.md](research/04-accessibility-security-performance.md) | WCAG 2.2 AA checklist, NIST SP 800-63B-4 gaps, Core Web Vitals targets |
| [research/05-engineering-evidence.md](research/05-engineering-evidence.md) | Evidence on TDD and AI-assisted development, with caveats |
| [research/06-recommendations.md](research/06-recommendations.md) | The build spec: user stories, Must/Should/Could, screen-by-screen spec, open questions |

Research findings that changed the product are recorded as decisions **D23–D33** in
[REQUIREMENTS.md](REQUIREMENTS.md#4-decision-log), for example the 15-character password
minimum and auth rate limiting (NIST), and the accessible colour tokens.
