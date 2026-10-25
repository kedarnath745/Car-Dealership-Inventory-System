# User research: desk research pack

Desk research for the Car Dealership Inventory System frontend and its polish. It was
written to inform the React + Tailwind build described in `../DESIGN.md` and to give
citable evidence for the README and interview. **Start with
[06-recommendations.md](06-recommendations.md)**, which is the build spec.

## Files

| File | What it answers |
|------|-----------------|
| [01-users-and-market.md](01-users-and-market.md) | Who uses the app (admin, shopper, reviewer), their jobs to be done, and buyer-journey and India market evidence |
| [02-ux-patterns.md](02-ux-patterns.md) | Evidence for search/filter, sort, product cards, purchase confirmation, admin CRUD, and empty/loading/error states |
| [03-design-system.md](03-design-system.md) | An Apple-HIG-inspired design system: tokens (type, spacing, radii, colour light/dark, materials, motion), components, Tailwind v4 code, licensing rules |
| [04-accessibility-security-performance.md](04-accessibility-security-performance.md) | WCAG 2.2 AA checklist per screen, NIST SP 800-63B-4 auth gaps, Core Web Vitals targets |
| [05-engineering-evidence.md](05-engineering-evidence.md) | TDD and AI-assisted development research, with honest caveats, for the README |
| [06-recommendations.md](06-recommendations.md) | **Build spec**: user stories + acceptance criteria, Must/Should/Could, API changes, screen-by-screen UI spec, open questions with recommended answers |

## Method

1. **Read the project first**: `REQUIREMENTS.md` (R/F/P items, decisions D1–D22) and `DESIGN.md` (API, planned frontend), plus the backend source to see what already exists (e.g. timing-safe login, no rate limiting, no sort).
2. **Find sources**: web search, then fetched each primary page directly and quoted from the fetched text. Priorities:
   - Standards and official guidelines: W3C WCAG 2.2 and WAI-ARIA APG, NIST SP 800-63B-4, OWASP, Apple HIG (read from Apple's own documentation data), MDN, web.dev.
   - Usability research firms: Baymard Institute (large-scale testing + benchmark), Nielsen Norman Group.
   - Industry surveys: Cox Automotive Car Buyer Journey, Deloitte Global Automotive Consumer Study (India), Google–Kantar (India), FADA, Lotlinx, StatCounter.
   - Peer-reviewed or preprint papers for engineering evidence (Nagappan 2008, Fucci 2017, Peng 2023, Paradis 2024, METR 2025), plus DORA reports.
3. **Judge sources**: preferred 2022–2026 and primary sources. Older items are kept only when they are still the standard reference (Nielsen 1993 response times, Nagappan 2008) and are marked as older. Vendor and company releases (Lotlinx, Spinny, GitHub, Google) are labelled as such.
4. **Verify numbers**: every statistic was copied from the fetched source text, not from search snippets. Where only a secondary source was reachable, it says so (e.g. Rafique & Mišić via Fucci et al.; Google–Kantar 2026 via Autocar Professional).
5. **Computed checks**: colour contrast ratios in 03 were calculated with the WCAG 2.x relative-luminance formula for every token pair, not estimated.
6. **Synthesis**: findings → personas and jobs → patterns → design tokens → prioritised spec sized to a 1–2 day deadline that keeps every brief requirement.

## Citation format

Inline `[Publisher Year](url)`. Apple HIG pages were accessed in October 2026 and change
over time; their change logs are on each page.

## Limitations

- **No primary research.** No interviews, surveys or usability tests with real dealership staff or Indian car buyers. Personas are evidence-informed archetypes; device and context lines marked *(assumption)* are unverified.
- **Geography.** The richest buyer-journey data (Cox) is US. India evidence is thinner: one Deloitte India study, Google–Kantar via press coverage, and company and industry-body releases.
- **Paywalls.** Baymard Premium guidelines, the full Google–Kantar report, and the IEEE papers (Rafique & Mišić 2013; Karac & Turhan 2018) were not read in full. Only their public summaries or abstracts are used.
- **Domain fit.** Baymard and NN/g research is mainly general e-commerce. A one-click car "purchase" is a kata simplification of a process that real buyers rarely complete online (Cox: 7% fully online).
- **Fast-moving topics.** AI-productivity results (05) and Apple's design language (Liquid Glass, 2025) change quickly. Re-check before quoting after 2026.
- **Not legal advice.** Licensing notes (SF Pro, SF Symbols, Lucide, Inter) summarise the licence texts read; they are not legal advice.
