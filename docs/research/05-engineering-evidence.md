# 05 · Engineering evidence: TDD and AI-assisted development

For the README ("My AI Usage", process notes) and interview answers. The evidence is
**mixed**. The honest summary is better than cherry-picking, and reviewers notice either way.

## 1. Test-driven development

| Study | Design | Finding (as stated) | Caveats |
|-------|--------|---------------------|---------|
| [Nagappan, Maximilien, Bhat, Williams 2008](https://www.microsoft.com/en-us/research/wp-content/uploads/2009/10/Realizing-Quality-Improvement-Through-Test-Driven-Development-Results-and-Experiences-of-Four-Industrial-Teams-nagappan_tdd.pdf), *Empirical Software Engineering* 13:289–302 | Case studies: 3 Microsoft teams + 1 IBM team vs similar non-TDD projects | "pre-release defect density of the four products decreased between 40% and 90%"; teams "experienced a 15–35% increase in initial development time" (subjective estimate) | Observational, not randomised; only 4 teams; comparison projects were "similar", not identical. Old, but still the most-cited industrial result. |
| Rafique & Mišić 2013, *IEEE TSE* 39(6), [doi:10.1109/TSE.2012.28](https://doi.org/10.1109/TSE.2012.28) | Meta-analysis | As summarised by Fucci et al. 2017: TDD "improves external quality when compared to a waterfall approach. However, this improvement is not strong"; productivity results "are more inconclusive", with "a small productivity hit… with a larger hit for the industrial subgroup" | I could not access the full text or abstract. Findings are quoted from Fucci et al.'s peer-reviewed summary. |
| [Fucci, Erdogmus, Turhan, Oivo, Juristo 2017](https://arxiv.org/abs/1611.05994), *IEEE TSE*, [doi:10.1109/TSE.2016.2616877](https://doi.org/10.1109/TSE.2016.2616877) | 82 data points from 39 professionals; regression on process traits | Quality and productivity gains were associated with **granularity and uniformity** (small, steady steps). "Sequencing, the order in which test and production code are written, had no important influence." The claimed benefits "may not be due to its distinctive test-first dynamic". | Short tasks; functional correctness was the only quality measure. |
| Karac & Turhan 2018, "What Do We (Really) Know about Test-Driven Development?", *IEEE Software*, [doi:10.1109/MS.2018.2801554](https://doi.org/10.1109/MS.2018.2801554) | Review column | Abstract: "TDD involves more than just testing before coding. This article examines how (and whether) TDD has lived up to its promises." | Full text not accessed. Cite only as further reading. |

**What to say in the README or interview**

- The best industrial evidence links TDD with **substantially fewer pre-release defects at a
  modest upfront time cost** (Nagappan 2008). Controlled studies are mixed.
- Later research suggests the benefit comes from **small, steady cycles** more than from
  writing the test first (Fucci 2017). That is why this repo keeps commits small and separate:
  `test:` → `feat:` → `refactor:` (P1).
- Defect density and coverage were not measured against a non-TDD baseline here, so don't
  claim a quality improvement **for this project**. Report coverage and the visible
  Red → Green → Refactor history instead.

## 2. AI-assisted development

| Study | Design | Finding (as stated) | Caveats |
|-------|--------|---------------------|---------|
| [Peng, Kalliamvakou, Cihon, Demirer 2023](https://arxiv.org/abs/2302.06590) (arXiv); [GitHub blog 2022](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/) | RCT, 95 professional developers, implement an HTTP server in JavaScript | Copilot group "completed the task 55.8% faster"; the blog reports 1 h 11 min vs 2 h 41 min (P = .0017) and completion 78% vs 70% | One small greenfield task; vendor-affiliated authors. |
| [Paradis et al. 2024](https://arxiv.org/abs/2410.12944) (Google) | RCT, 96 Google engineers, one enterprise-grade task | Best estimate "about 21%" less time on task, "although our confidence interval is large" | Internal tools, summer 2024; the authors warn against generalising. |
| [METR, Becker et al. 2025](https://arxiv.org/abs/2507.09089); [blog](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | RCT, 16 experienced OSS developers, 246 real tasks in their own mature repos (Feb–Jun 2025 tools: mainly Cursor Pro, Claude 3.5/3.7 Sonnet) | AI allowed → tasks took **19% longer**. Developers forecast 24% faster and afterwards believed they had been 20% faster. | Small n; experts in familiar codebases. METR explicitly does **not** claim AI slows down most developers. |
| [METR 2026 update](https://metr.org/blog/2026-02-24-uplift-update/) | Follow-up from Aug 2025 (10 returning + 47 new developers) | Raw estimate −18% time for returning developers (CI −38% to +9%), −4% for new recruits (CI −15% to +9%). METR calls the data "an unreliable signal" because of selection effects: developers increasingly declined to work without AI. | Inconclusive by the authors' own account; METR believes speed-ups are "likely" higher in early 2026 but its data is "very weak evidence" for the size. |
| [DORA 2024 (Google Cloud)](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report) | Survey (39,000+ professionals, per [InfoQ](https://www.infoq.com/news/2024/11/2024-dora-report/)) | A 25% increase in AI adoption was associated with +7.5% documentation quality, +3.4% code quality and +3.1% code review speed, but "an estimated decrease in delivery throughput by 1.5%, and an estimated reduction in delivery stability by 7.2%". 39% reported little or no trust in AI-generated code (InfoQ). | Correlational survey data. |
| [DORA 2025 (Google Cloud)](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) | Survey, nearly 5,000 professionals + 100+ hours of qualitative data | "AI doesn't fix a team; it amplifies what's already there." Now a **positive** relationship with throughput and product performance, but AI adoption "continue[s] to have a negative relationship with software delivery stability". 90% use AI at work; 30% report little or no trust in its code. | Correlational; self-selected sample. |

**What to say in the README ("My AI Usage")**

- Controlled studies on **small, well-specified tasks** show large speed-ups (21–56%). The
  one RCT on **experienced developers in their own mature codebases** (METR 2025) found a
  slowdown, and developers misjudged their own speed. The evidence depends on the setting.
- DORA's consistent message: AI raises change volume, and **stability suffers without strong
  tests, small batches and fast feedback**. This kata's TDD discipline, small PRs and CI are
  exactly the "control systems" DORA names. That is the best argument for combining AI with TDD.
- Be specific about your own usage: what AI wrote, what you reviewed or changed, where it was
  wrong, and how the tests caught it. Don't claim a productivity percentage; you have no control group.
- Keep the AI co-author trailers (P5) and PROMPTS.md (P7) as the audit trail.

## 3. Limitations

- Paywalled papers (Rafique & Mišić, Karac & Turhan) were not read in full.
- AI-productivity research is moving fast. Results from 2023–2025 tools may not hold for 2026 agentic tools (METR 2026 says as much).
- Vendor-linked studies (GitHub, Google) are included because they are RCTs, but note the affiliation.
