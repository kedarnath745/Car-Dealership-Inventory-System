# 07 · Visual identity: from "AI-made" to crafted

The product owner says the app "is looking like AI made" and wants changes to fonts, icons,
spacing, borders and colours. Earlier they asked for Apple-engineer quality. This file
squares the two: keep the calm, accessible HIG discipline from [03](03-design-system.md),
but replace the defaults that make Showroom look like every generated SaaS app with
choices that come from **cars, showrooms and the Indian market**.

Research done 25 Oct 2026. Every web page was read on that date. Labels used below:
**[research]** = user research or measured data · **[docs]** = official design-system or
vendor documentation · **[practitioner]** = an essay by a named designer or studio (informed
opinion) · **[opinion]** = a blog or marketing post with no data · **[measured here]** = I
measured it in this session (npm API, font files, page HTML, WCAG formula).

> **This file overrides parts of 03 and 06.** It replaces the system font stack (03 §2,
> 06 decision 7), the `#0066CC` accent (03 §5, 06 decision 6), the radius scale (03 §4),
> capsule buttons and badges (03 §8) and the "In stock · N" label (06 decision 4).
> The accessibility rules in 03 still apply: contrast, 44px targets, reduced motion, no
> colour-only meaning.

---

## A. What reads as AI-generated

There is **no peer-reviewed study** of "AI-looking" UI. What exists is (1) Anthropic's own
account of why models converge on one look, (2) practitioner essays that list the same tells,
and (3) data on how common the defaults are. The list below is consistent across sources,
but treat it as informed opinion about taste, not measured user perception.

**Why it happens**
- **Distributional convergence.** Models without direction return the median of their
  training data. Anthropic lists "overused font families (Inter, Roboto, Arial, system
  fonts)", "clichéd color schemes (particularly purple gradients on white backgrounds)",
  "predictable layouts and component patterns" and "cookie-cutter design that lacks
  context-specific character" — [Anthropic, *Improving frontend design through Skills*, Nov 2025](https://claude.com/resources/articles/improving-frontend-design-through-skills) **[docs]**.
- **One component kit is copied verbatim everywhere.** shadcn/ui is copied into repos as
  source, and Bolt, Lovable and v0 all build on it; a developer calls it "the default UI lib
  of LLMs" — [Kate Holterhoff, RedMonk, Apr 2025](https://redmonk.com/kholterhoff/2025/04/22/ui-component-libraries-shadcn-ui-and-the-revenge-of-copypasta/) **[practitioner]**.
  Its default icon set is Lucide (`"iconLibrary": "lucide"` in `components.json`), per
  [shadcn/studio, 2025](https://shadcnstudio.com/blog/how-to-use-shadcn-icons/) **[opinion; matches public config files]**.
- **The Tailwind indigo story.** Adam Wathan's Aug 2025 post apologising for `bg-indigo-500`
  in Tailwind UI is reported by [prg.sh, Oct 2025](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) **[opinion; I could not read the original post]**.

**The tells** (✱ = Showroom has it today)
- ✱ **System font / Inter everywhere** — Anthropic (above) **[docs]**; [prg.sh 2025](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) **[opinion]**. Geist is now the next default: it is what `create-next-app`'s Tailwind template imports ([vercel/next.js template](https://github.com/vercel/next.js/blob/canary/packages/create-next-app/templates/app-tw/ts/app/layout.tsx), read Oct 2026) **[measured here]**.
- ✱ **The "SaaS-card kit"**: "content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration" — [Anthropic frontend-design skill, SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (updated Sep 2026 per [Capital & Compute, Sep 2026](https://capitalandcompute.net/blog/fix-ai-slop-design/)) **[docs]**. Showroom: 20px radius on cards, filter panel, empty state and skeletons, plus `--elev-card` under each.
- ✱ **Meta strings joined with middle dots ("A · B · C")** — same skill, "template chrome" list **[docs]**. Showroom: `2022 · Red · SUV` on every card and in the purchase sheet, `In stock · 8`.
- ✱ **Generic thin-line icon set** — "a set of thin, interchangeable line icons that could illustrate any product" ([925Studios, 2026](https://www.925studios.co/blog/ai-slop-design-tells)) **[opinion]**. Lucide had **70.6 M** npm downloads in the week to 25 Oct 2026, versus 3.4 M for Phosphor, 2.3 M for Tabler, 2.7 M for Heroicons and 0.1 M for Iconoir ([npm downloads API](https://api.npmjs.org/downloads/point/last-week/lucide-react)) **[measured here]**.
- ✱ **Decorative gradient washes and many competing accent colours.** "Treat color as a shared resource… Define which things get accent color and why" — [Jeff Humble, The Fountain Institute, Apr 2026](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui) **[practitioner]**. Showroom: eight pastel gradients (sky, emerald, amber, rose, orange, stone, violet, teal) on the car tiles.
- ✱ **Pills everywhere.** Pill badges in a centred hero are a first-wave tell ([Capital & Compute 2026](https://capitalandcompute.net/blog/fix-ai-slop-design/)) **[opinion]**. The Porsche Design System keeps full radius for "standalone indicators" only, such as tags and switches ([Porsche Design System v4, Border tokens](https://designsystem.porsche.com/v4/tokens/border/)) **[docs]**. Showroom: every button, chip, badge and nav link is a capsule.
- ✱ **Centred card login with an app-icon tile.** A centred hero and centred everything is a first-wave layout tell ([prg.sh 2025](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website); [925Studios 2026](https://www.925studios.co/blog/ai-slop-design-tells)) **[opinion]**.
- ✱ **Every block in a card** (cards nested in cards) — [Fountain Institute 2026](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui) **[practitioner]**. Showroom: the filter panel is a card around inputs that are themselves boxes.
- **Purple/indigo gradients, glass panels, glow on dark, emoji as icons, status dots that mean nothing** — Fountain Institute; Capital & Compute **[practitioner/opinion]**. Showroom mostly avoids these already.
- **Hover transitions on every card, fade-and-slide-up on every section** — Anthropic skill **[docs]**. Showroom has a card hover shadow lift.
- **The second wave.** Banning the first-wave look pushes models to the next most likely look: warm cream (≈`#F4F1EA`) with a terracotta accent (≈`#D97757`), near-black with one acid-green or vermilion accent, broadsheet layouts with hairline rules and zero radius, ALL-CAPS eyebrow labels, monospace data labels and `→` on buttons — Anthropic skill **[docs]**. **The proposal in §D deliberately avoids all of these.**
- **Vague, weightless copy** ("Build faster. Ship smarter.") — [925Studios 2026](https://www.925studios.co/blog/ai-slop-design-tells) **[opinion]**; "Errors don't apologize… An empty screen is an invitation to act" — Anthropic skill **[docs]**.

Two cautions. "A tell is evidence of a default nobody chose, never proof that a model made
the page" ([Capital & Compute 2026](https://capitalandcompute.net/blog/fix-ai-slop-design/), quoting the avoid-ai-design README).
And Anthropic's 2025 advice to use extreme weights (100/200 vs 800/900) and 3× size jumps
targets landing pages. It **conflicts with HIG** ("prefer Regular, Medium, Semibold, or Bold"),
so it is **not applied** to this data-heavy app.

## B. What reads as crafted

- **Looks affect trust and forgiveness, but only so far.** People see attractive products as more usable and forgive *minor* problems, not large ones. In one NN/g test, a participant who first praised large photos later found the low information density "annoying" — [Kate Moran, NN/g, *Aesthetic-Usability Effect*, last reviewed Sep 2026](https://www.nngroup.com/articles/aesthetic-usability-effect/) **[research]**. Lesson: polish matters, but not at the cost of density in an inventory list.
- **One typeface, used with discipline.** Polestar rejected Helvetica as "too generic", uses one typeface (Unica77) everywhere, and typically "only one size and one weight" — [Polestar, *Journal 1*, 2018](https://www.polestar.com/global/news/journal-1/) **[docs, brand]**. Typography "carries the personality"; use "one family or two" — Anthropic skill **[docs]**.
- **Chosen colour, used sparingly.** Polestar's palette is "very understated, not claiming a certain brand colour"; accents "stand out, but only when needed" — [Polestar 2018](https://www.polestar.com/global/news/journal-1/) **[docs]**. Linear made its themes "more neutral and timeless" by "limiting how much chrome (blue in our case)" goes into the colour system, built from three inputs: base, accent, contrast — [Linear, *How we redesigned the Linear UI (part II)*, Mar 2024](https://linear.app/now/how-we-redesigned-the-linear-ui) **[practitioner]**.
- **Neutrals with temperature.** Radix suggests a grey "saturated with the hue closest to your accent hue" for a "more colorful and harmonious vibe", and grey-scale text for "a more functional vibe" in apps — [Radix Colors (WorkOS), *Composing a palette*](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) **[docs]**.
- **Radius and elevation follow hierarchy.** Porsche varies radius by role: 8px for compact controls, 12px for controls, 16px for notifications, 24px for tiles and dialogs, full only for tags and switches ([Porsche v4 Border](https://designsystem.porsche.com/v4/tokens/border/)) **[docs]**. "Vary radius and elevation by hierarchy; use rows or tables where content is tabular" ([Capital & Compute 2026](https://capitalandcompute.net/blog/fix-ai-slop-design/)) **[opinion]**.
- **Alignment you feel, not see.** Linear spent effort "aligning labels, icons, and buttons… something that you'll feel after a few minutes of using the app" ([Linear 2024](https://linear.app/now/how-we-redesigned-the-linear-ui)) **[practitioner]**.
- **Tabular numerals for data.** `font-variant-numeric: tabular-nums` makes digits equal width so prices and counts line up ([MDN, font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric)) **[docs]**. Every candidate font in §D.1 has a `tnum` feature **[measured here]**.
- **Structure must carry information.** "Structural devices like outlines, borders, numbering… encode useful information about the content rather than decorate it" — Anthropic skill **[docs]**. Use cards only when an item is "independently actionable" ([Fountain Institute 2026](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui)) **[practitioner]**. A vehicle *is* actionable, so it keeps a card. The filter panel is not, so it loses one.
- **Real domain detail.** Distinctive choices come from "the subject's industry, subject matter, materials, and vernacular" — Anthropic skill **[docs]**. Our data has only make, model, year, colour, category, price and stock, so the craft has to come from those: the car's **real paint colour**, its **body shape**, **Indian price formats** and the **listing convention "2022 Hyundai Creta"**.
- **Empty states give status, teach, and offer a direct path** — [Kate Kaplan, NN/g, Sep 2021](https://www.nngroup.com/articles/empty-state-interface-design/) **[research]**.
- **Copy that is specific.** Use active verbs, keep the same name for an action through the flow ("Publish" → "Published"), use sentence case, and errors don't apologise — Anthropic skill, "More on writing in design" **[docs]**.

## C. Automotive references

The four Indian sites' HTML/CSS was fetched on 25 Oct 2026 and I counted declared fonts, hex
colours and `border-radius` values **[measured here]**. Counts come from server-rendered
HTML/CSS only, so treat them as indicative. Tesla and Carvana block scripted fetches, so I
make no claims about them.

| Product | What I observed | What to borrow |
|---|---|---|
| **Polestar** (brand + web) | One typeface (Unica77; the site declares `Polestar Unica`), monochrome black/white/grey, accent "only when needed" ([Journal 1](https://www.polestar.com/global/news/journal-1/)) | One family; monochrome base; one accent kept for meaning |
| **Porsche Design System v4** | Radii 2–32px by role, full radius only for indicators; near-black primary text `hsl(225 66.7% 1.2%)`; shadows only at 0.16 alpha in 3 steps ([Border](https://designsystem.porsche.com/v4/tokens/border/), [Color](https://designsystem.porsche.com/v4/tokens/color/), [Shadow](https://designsystem.porsche.com/v4/tokens/shadow/)) | A role-based radius scale; ink (near-black) as the primary action colour; few elevation levels |
| **Rivian** | Custom display sans "Adventure" plus serif "Canela", dark slate `#232C33` | A brand typeface is the strongest single signal |
| **Cars24** (IN) | Inter; orange `#EF6E0B` and blue `#0059A3`; radii mostly 8–12px | Local norm is small radii, not 20px cards |
| **Spinny** (IN) | Custom fonts (Gilroy, a Jost cut, Akshar); purple `#6300A3`/`#2E054E`; radii mostly 6px, 12px, 4px | Owns a hue (purple), so **avoid purple** for Showroom |
| **CarDekho** (IN) | Poppins + an icon font; orange-red `#F75D34`, ink `#24272C`; radii mostly 8px, 16px, 4px | Ink-dark text, warm accent; tight radii |
| **CarWale** (IN) | Lato; red `#E03012`, teal `#00857A`; radii mostly 4px, then 6px, 12px; few pills (9 × `9999px`) | Rect buttons; pills rare |

Patterns: Indian marketplaces use **small radii (4–12px)**, **rectangular buttons** and **one
warm brand hue** (orange/red) or purple. Premium brands use **one typeface**, **monochrome
plus a single accent**, and **black as the primary action**. Showroom should sit between the
two: premium monochrome, and a hue no local competitor owns (orange, red and purple are taken).

---

## D. Recommended visual identity for Showroom

**Concept: "Showroom floor".** Each car stands on a quiet studio plate, drawn in its own
paint colour. Type is an industrial grotesque that widens for names and prices, the way a
badge on a tailgate does. Everything around that is ink, graphite and hairlines. The boldness
goes into **one place**: the car plate plus the wide model/price type. The rest stays quiet.

### D.1 Font

| Candidate | Licence | @fontsource package | Axes | Woff2 a page loads (latin + latin-ext for ₹) | Notes |
|---|---|---|---|---|---|
| **Mona Sans** ✅ | SIL OFL 1.1, [github/mona-sans LICENSE](https://github.com/github/mona-sans/blob/main/LICENSE) | `@fontsource-variable/mona-sans` (5.3.0) | wght 200–900, **wdth 75–125** | `wdth.css`: 95 KB + 32 KB = **127 KB**; `wght.css` (no width axis): 38 + 15 = 53 KB | "Inspired by industrial-era grotesques", by GitHub with Degarism ([GitHub blog, Dec 2022](https://github.blog/news-insights/company-news/introducing-mona-sans-and-hubot-sans/)). 50 k weekly downloads vs 4.2 M for Inter and 2.3 M for Geist, so it is not a default |
| Archivo | SIL OFL 1.1, [Omnibus-Type/Archivo](https://github.com/Omnibus-Type/Archivo) | `@fontsource-variable/archivo` | wght 100–900, wdth 62–125 | `wdth.css`: 87 + 84 KB = 171 KB | Grotesque built for both display and text; heavier latin-ext file |
| Schibsted Grotesk | SIL OFL 1.1, [schibsted/schibsted-grotesk](https://github.com/schibsted/schibsted-grotesk) | `@fontsource-variable/schibsted-grotesk` | wght 400–900 | 45 + 20 = 65 KB | Newsroom grotesque with character; no width axis |

All sizes and glyph checks were measured on the fontsource 5.3.x woff2 files with fontTools
**[measured here]**:
- **₹ (U+20B9) is in all three, but only in the `latin-ext` subset.** Fontsource's latin-ext
  `unicode-range` includes `U+20AD-20C0`, so the browser downloads that file on any page that
  shows a price. Budget for it.
- **`≈` (U+2248) is in none of them**, nor in Inter or Geist. Today's "≈ ₹12.5 lakh" would
  render that one glyph in a fallback font. Drop the `≈` (see D.10).
- Excluded on purpose: Inter, Geist and system-ui are the defaults (§A). Space Grotesk is the
  model's next default, per Anthropic's cookbook prompt quoted by [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website). Instrument Sans,
  Hanken Grotesk and Onest **lack ₹** in their fontsource files **[measured here]**.

**Recommendation: Mona Sans Variable, width axis included.**
```bash
npm i @fontsource-variable/mona-sans@5.3.0
```
```ts
// main.tsx (first import)
import '@fontsource-variable/mona-sans/wdth.css'; // weight 200–900 + width 75–125, font-display: swap
```
```css
--font-sans: 'Mona Sans Variable', ui-sans-serif, system-ui, sans-serif;
```
- Performance: two files, about 127 KB, with `font-display: swap` (fontsource's default). The
  vietnamese subset is never fetched because of `unicode-range`. If LCP suffers, a
  self-built subset of the width file with only Basic Latin, Latin-1 and punctuation is
  **88 KB**, and a ₹-only subset is **1.5 KB** (pyftsubset, measured). That is a later
  optimisation, not a requirement.
- Don't `<link rel=preload>` the latin-ext file: "preload ignores unicode-range declarations"
  ([Katie Hempenius, web.dev, *Best practices for fonts*](https://web.dev/articles/font-best-practices)).
- If 127 KB is too much, use `wght.css` (53 KB) and drop the width effect. Everything else in
  this spec still works.

### D.2 Type scale (replaces the HIG iOS scale in 03 §2)

Web-native sizes. Body drops from 17px to 16px for density, but inputs stay at 16px, so iOS
does not zoom on focus. Weights are 400/500/600 only. "Wide" means `font-stretch: 112.5%`
(Tailwind v4: `font-stretch-semi-expanded`).

| Token | Size / line | Weight | Width | Use |
|---|---|---|---|---|
| `text-display` | 2rem / 2.25rem | 600 | wide, tracking −0.01em | Page titles ("Inventory") |
| `text-title` | 1.5rem / 1.875rem | 600 | wide | Sheet titles, empty-state title |
| `text-car` | 1.1875rem / 1.5rem | 600 | wide | Card title "2022 Hyundai Creta" |
| `text-price` | 1.375rem / 1.75rem | 600 | wide, `tabular-nums` | Card and sheet price |
| `text-body` | 1rem / 1.5rem | 400 | normal | Body, inputs, buttons (500) |
| `text-small` | 0.875rem / 1.25rem | 400–500 | normal | Secondary meta, field labels, chips |
| `text-micro` | 0.8125rem / 1.125rem | 500 | normal | Badges, helper and error text, table headers |

- No all-caps labels, no monospace labels (second-wave tells).
- The wordmark is the only text set at full width (`font-stretch: 125%`, 700).

### D.3 Colour tokens

One brand hue, **Petrol** (a deep blue-green, the colour of petrol-blue car paint). Primary
actions are **Ink**, as at Porsche and Polestar. Neutrals lean slightly towards Petrol, per
Radix's "natural pairing". The hue avoids Tailwind indigo, Apple blue `#0066CC`, SaaS emerald,
the competitors' orange/red/purple and the second-wave cream/terracotta/acid-green.

Contrast was computed with the WCAG 2.x relative-luminance formula
([W3C, WCAG 2.2 "contrast ratio"](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)) **[measured here]**.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#F4F5F4` | `#14191B` | Page |
| `--surface` | `#FFFFFF` | `#1B2124` | Cards, sheets, inputs |
| `--plate` | `#ECEEED` | `#232A2D` | Car "studio plate", skeleton, hover fill |
| `--line` | `#DCE0DE` | `#2E373A` | Hairlines, card borders (decorative) |
| `--line-strong` | `#7D898C` | `#768387` | Input/checkbox borders, card hover border |
| `--ink` | `#111A1C` | `#ECF0F0` | Text; **primary button fill** |
| `--on-ink` | `#FFFFFF` | `#14191B` | Text on primary button |
| `--ink-2` | `#4A575B` | `#A8B3B6` | Secondary text |
| `--ink-3` | `#5F6C70` | `#8E9A9D` | Placeholder, disabled-looking but still legible |
| `--accent` | `#0A5C6B` | `#5FB8C8` | Links, focus ring, selected chip fill |
| `--on-accent` | `#FFFFFF` | `#14191B` | Text on selected chip |
| `--accent-tint` | `#E3EFF1` | `#133038` | Selected row / info background |
| `--danger` | `#B42318` | `#FF8A7E` | Error text; destructive fill (light) |
| `--danger-tint` | `#FCEBE9` | `#3A1C19` | |
| `--success` | `#1D6B40` | `#62CF92` | In-stock dot/text |
| `--success-tint` | `#E6F2EA` | `#14301F` | |
| `--warning` | `#8A5300` | `#F0B54A` | Low-stock dot/text |
| `--warning-tint` | `#FBF0DC` | `#33270F` | |

Checked pairs (all text ≥ 4.5:1; UI boundaries ≥ 3:1):

| Pair | Light | Dark |
|---|---|---|
| ink on surface / bg / plate | 17.67 / 16.17 / 15.16 | 14.18 / 15.44 / 12.70 |
| ink-2 on surface / bg / plate / accent-tint | 7.49 / 6.85 / 6.42 / 6.37 | 7.59 / 8.26 / 6.79 / 6.49 |
| ink-3 on surface / bg / plate | 5.43 / 4.97 / 4.66 | 5.63 / 6.13 / — |
| on-ink on ink (primary button) | 17.67 | 15.44 |
| accent on surface / bg / plate / accent-tint | 7.62 / 6.97 / 6.54 / 6.49 | 7.12 / 7.75 / 6.37 / 6.09 |
| on-accent on accent (selected chip) | 7.62 | 7.75 |
| white on danger (destructive button, light) | 6.57 | — (dark uses danger *text* on danger-tint) |
| danger on surface / tint / bg | 6.57 / 5.70 / 6.02 | 7.13 / 6.76 / 7.76 |
| success on surface / tint / bg | 6.50 / 5.65 / 5.95 | 8.42 / 7.38 / 9.17 |
| warning on surface / tint / bg | 6.33 / 5.61 / 5.79 | 8.85 / 7.94 / 9.63 |
| line-strong vs surface / bg (input border, 1.4.11) | 3.60 / 3.30 | 4.16 / 4.53 |
| line-strong vs plate | 3.09 | — |
| focus ring (accent) vs surface / bg | 7.62 / 6.97 | 7.12 / 7.75 |

- `--line` (1.33:1) is decorative only: card edges and dividers. A card is not a control,
  so 1.4.11 does not apply. Anything you click that has a border uses `--line-strong`.
- In dark mode the selected chip fill must be `--accent` (`#5FB8C8`), not a deeper Petrol: a
  deep fill like `#0E6A7B` was only 2.61:1 against the surface, which fails 3:1 for a state indicator.
- A dark mode on `#14191B` is a tinted near-black, which the skill lists as a default. Here it
  is deliberate: it is Petrol-tinted to match the hue (Radix natural pairing), and lighter
  surfaces still carry the depth (HIG).

### D.4 Radii (4 tokens instead of 6, varied by role)

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Badges, category chips, menu items, segment thumb |
| `--radius-md` | 10px | Buttons, inputs, selects, stepper, nav links, small media in tables |
| `--radius-lg` | 14px | Vehicle cards, empty-state panel, popover menus |
| `--radius-xl` | 20px | Sheets and dialogs (top corners only on mobile) |
| `rounded-full` | — | **Only** the account avatar, the 8px stock dot and the skip link: indicators, not actions |

The card media is flush with the card, so it inherits `--radius-lg` on its top corners
through `overflow-hidden`. No inner radius to compute.

### D.5 Borders vs shadows

- **Content layer** (cards, tables, filter toolbar): 1px `--line` border, **no shadow**. On
  hover (pointer only) the border becomes `--line-strong`. No lift and no shadow growth.
- **Overlay layer** (sheets, menus, toasts): `--elev-overlay` shadow (`0 16px 48px rgb(0 0 0 / .18)`
  light; `0 16px 48px rgb(0 0 0 / .5)` dark) **plus** a 1px `--line` border in dark mode.
- **Nav bar**: keep the translucent material (HIG), with a 1px `--line` bottom border always shown.
- **Never nest bordered boxes.** Inputs sit on the page or in a sheet, never inside a card.

### D.6 Spacing and density

- 4px base unit. **Vary rhythm on purpose**: 4–8px inside a group (title ↔ meta), 16px
  between groups inside a card, 24px between page sections, 40px above page titles on desktop.
- Grid: 1 / 2 (≥640) / 3 (≥1024) / 4 (≥1280) columns, **16px gap at every size** (was 24px on desktop).
- Card body padding 16px. Card media 16:10.
- The filter area becomes a **toolbar on the page background**: inputs in a row, chips
  below, a 1px `--line` rule under it. No card around it.
- The page header puts the title on the left and a tabular count on the right ("48 cars").

### D.7 Buttons (one shape, four weights)

All buttons use `--radius-md` (10px), weight 500–600, and a 44px target (`sm` stays 36px
visually with an expanded hit area).

| Variant | Look | Where |
|---|---|---|
| `primary` | `--ink` fill, `--on-ink` text | Sheet confirm ("Buy for ₹X"), Sign in, Save. **At most one per view.** |
| `secondary` | `--surface` fill, 1px `--line-strong` border, `--ink` text; hover `--plate` | Card "Purchase", Restock, Load more |
| `quiet` | No fill, `--accent` text; hover `--plate` | Cancel, Clear filters, Edit/Delete in admin rows |
| `destructive` | `--danger` fill, white text (light); `--danger-tint` fill + `--danger` text (dark) | Final "Delete vehicle" only |

The card's "Purchase" becomes **secondary**, not filled. A grid of 12–24 filled buttons is
the loudest thing on the page, and the decision happens in the sheet anyway, where the one
ink button lives. Map the old names `filled→primary`, `tinted→secondary`, `plain→quiet`.

### D.8 Badges and stock status

- **Stock is a line of text with a dot, not a capsule:** an 8px `rounded-full` dot in
  `--success` / `--warning` / `--ink-3`, plus text in the same colour (e.g. `--warning` on
  `--surface` is 6.33:1). Labels: **"8 in stock"**, **"Only 2 left"**, **"Sold out"**. Text
  plus dot means colour never carries meaning alone (WCAG 1.4.1).
- Place it in the card's price row, not over the image. That removes the floating `shadow-sm`
  pill.
- Generic `Badge` (admin tables, "You" etc.): 22px tall, `--radius-sm`, tint fill, `text-micro` 500.

### D.9 Card anatomy

```
┌──────────────────────────────────────┐  1px --line, radius 14, no shadow
│ [ studio plate 16:10: car in its     │  --plate, flush top
│   paint colour, horizon, shadow ]    │
├──────────────────────────────────────┤
│ 2022 Hyundai Creta                   │  h2, text-car, wide, ink (one style, no accent word)
│ Pearl White SUV                      │  text-small, ink-2: "{color} {category}"
│                                      │  16px
│ ₹12,50,000              ● 8 in stock │  text-price tabular · stock line right-aligned
│ 12.5 lakh                            │  text-small, ink-2
│ ┌──────────────────────────────────┐ │  16px
│ │            Purchase              │ │  secondary button, full width
│ └──────────────────────────────────┘ │
│ Edit   Restock   Delete              │  admin only: quiet buttons, left-aligned
└──────────────────────────────────────┘
```
- The title follows the listing convention used by Indian used-car sites: **year make model**.
  Tests find cards with `getByRole('article', { name: 'Hyundai Creta' })`, so update them
  (e.g. `name: /Hyundai Creta/`).
- The meta line reads as a phrase, "Pearl White SUV", not `2022 · Pearl White · SUV`.
- Sold out: plate at 60% opacity, button replaced by `Sold out` text in `--ink-2`, with "Back after restock" under it.

### D.10 Category tile replacement: the "studio plate"

Replaces the eight pastel gradient tiles and the centred Lucide icon in `CategoryArt.tsx`.

- **Backdrop**: `--plate` fill. A "floor" band covers the bottom 30%, about 4% darker
  (`color-mix(in oklab, var(--plate), var(--ink) 4%)`), with a hard edge for the horizon.
  This is a solid tone step, not a gradient wash.
- **Car**: an original **side-profile silhouette per body style**, drawn by us (no third-party
  assets). Body fill = the **vehicle's paint colour** mapped from `vehicle.color`; 1.5px
  `--ink` outline (`vector-effect: non-scaling-stroke`); glass `--ink` at 72% opacity; tyres
  `--ink` with a grey hub; a 3px-tall contact-shadow ellipse at 12% ink.
- **No caption.** Body style and colour are in the card text right below, so the plate stays
  `aria-hidden`.
- **Paint map** (case-insensitive keyword match on `vehicle.color`, first hit wins):
  white/pearl `#F2F2EF` · black `#1D1F21` · silver `#B9BEC2` · grey/gray `#7D858A` · red `#B3261E` ·
  maroon/wine `#6D1F2A` · blue `#2B4C7E` · green `#2F5D46` · brown `#6B4A35` · beige/gold `#CDBB9B` ·
  yellow `#E0B53A` · orange `#D2691E` · fallback `#9AA3A7`. In dark mode, white/silver keep
  their paint, so the outline switches to `--bg` for contrast. The silhouette is decorative,
  so 1.4.11 does not apply.
- **Paths** (viewBox `0 0 240 100`, front of car facing left, ground ≈ y 84). I drafted these
  and rendered a contact sheet to check them. Treat them as a starting point to refine by eye:

```ts
// features/inventory/carProfiles.ts — original artwork for this project
export const PROFILES = {
  SEDAN: { body: 'M14 70 L14 61 Q14 54 22 53 L64 49 Q74 47 84 40 L100 30 Q106 27 114 27 L150 27 Q158 27 164 31 L182 43 Q186 46 194 46 L218 47 Q226 48 226 56 L226 70 L197 70 A17 17 0 0 0 163 70 L77 70 A17 17 0 0 0 43 70 L14 70 Z', glass: 'M90 44 L104 33 Q108 31 113 31 L148 31 Q154 31 158 34 L170 44 Z', wheels: [60, 180], r: 13, cy: 71 },
  HATCHBACK: { body: 'M24 70 L24 61 Q24 55 31 54 L66 50 Q76 47 86 40 L102 30 Q108 27 116 27 L168 28 Q176 29 182 36 L198 51 Q206 54 208 60 L208 70 L191 70 A17 17 0 0 0 157 70 L81 70 A17 17 0 0 0 47 70 L24 70 Z', glass: 'M92 44 L106 33 Q110 31 115 31 L166 32 Q172 33 176 38 L182 44 Z', wheels: [64, 174], r: 13, cy: 71 },
  SUV: { body: 'M14 67 L14 53 Q14 45 24 44 L62 41 Q70 39 78 31 L92 21 Q96 18 102 18 L198 18 Q206 18 209 25 L216 41 Q223 43 224 50 L224 67 L201 67 A19 19 0 0 0 163 67 L77 67 A19 19 0 0 0 39 67 L14 67 Z', glass: 'M84 38 L96 25 Q99 22 104 22 L194 22 Q200 22 202 27 L206 38 Z', wheels: [58, 182], r: 15, cy: 69 },
  COUPE: { body: 'M12 70 L12 62 Q12 57 20 56 L72 51 Q82 49 94 41 L112 33 Q118 31 126 31 L144 32 Q158 34 174 42 L210 50 Q224 52 226 58 L226 70 L199 70 A17 17 0 0 0 165 70 L75 70 A17 17 0 0 0 41 70 L12 70 Z', glass: 'M100 44 L114 36 Q119 34 126 34 L142 35 Q152 37 162 44 Z', wheels: [58, 182], r: 13, cy: 71 },
  CONVERTIBLE: { body: 'M12 70 L12 62 Q12 57 20 56 L84 51 L100 37 L103 38 L94 50 L150 50 Q156 44 168 44 Q178 44 182 50 L212 51 Q225 52 226 58 L226 70 L199 70 A17 17 0 0 0 165 70 L75 70 A17 17 0 0 0 41 70 L12 70 Z', glass: null, wheels: [58, 182], r: 13, cy: 71 },
  TRUCK: { body: 'M10 67 L10 51 Q10 44 18 43 L56 41 Q62 39 68 31 L80 19 Q83 16 88 16 L124 16 Q130 16 131 22 L132 40 L226 40 Q230 40 230 44 L230 67 L209 67 A19 19 0 0 0 171 67 L75 67 A19 19 0 0 0 37 67 L10 67 Z', glass: 'M74 36 L84 22 Q86 20 90 20 L122 20 Q126 20 127 24 L127 36 Z', wheels: [56, 190], r: 15, cy: 69 },
  VAN: { body: 'M12 68 L12 51 Q12 43 21 41 L38 37 Q44 35 50 25 L58 15 Q61 12 66 12 L214 12 Q225 12 226 21 L227 68 L210 68 A18 18 0 0 0 174 68 L70 68 A18 18 0 0 0 34 68 L12 68 Z', glass: 'M54 34 L62 20 Q64 17 68 17 L118 17 L118 34 Z', wheels: [52, 192], r: 14, cy: 70 },
  // "Electric" is a powertrain, not a body: a smooth one-arc crossover with no grille.
  ELECTRIC: { body: 'M14 69 L14 59 Q14 51 24 50 L60 47 Q74 44 88 34 L100 26 Q106 23 114 23 L156 24 Q176 26 196 38 L214 46 Q224 48 225 56 L225 69 L200 69 A18 18 0 0 0 164 69 L78 69 A18 18 0 0 0 42 69 L14 69 Z', glass: 'M94 41 L106 30 Q110 27 116 27 L154 28 Q168 30 182 40 Z', wheels: [60, 182], r: 14, cy: 70 },
} as const;
```
Render: `<svg viewBox="0 0 240 100">` → shadow `<ellipse cx=120 cy={cy+r+1} rx=104 ry=3>`, `<path d={body} fill={paint}>`,
`<path d={glass}>`, then for each wheel `<circle r={r}>` plus a hub `<circle r={r*0.45}>`.
Centre it at about 80% of the plate width. `compact` mode (purchase table thumbnails) uses
the same SVG without the floor band. Effort: about 1.5 h including the paint map.

### D.11 Icons

| Set | Licence | Weekly npm (25 Oct 2026) | Trade-off |
|---|---|---|---|
| Lucide (current) | ISC | 70.6 M | The shadcn default, so it is everywhere; stroke tunable |
| **Phosphor** ✅ | MIT | 3.4 M | 6 weights (thin → fill, duotone); has `CarProfile`, `Jeep`, `Van`, `Truck`, `SteeringWheel`, `Gauge`, `FunnelX`; filled paths, so no `strokeWidth` (you pick a weight instead) |
| Tabler | MIT | 2.3 M | Huge set (car variants too); 2px default stroke reads "admin template" |
| Heroicons | MIT | 2.7 M | Tailwind Labs' own set; small and strongly tied to the Tailwind UI look |
| Iconoir | MIT | 0.1 M | Distinctive but smaller; fewer automotive glyphs |

**Recommendation: `@phosphor-icons/react` (2.1.10), `weight="regular"` at 20px for UI and
16px inline; `weight="fill"` only for selected/active states.** Its slightly rounded, softer
drawing differs visibly from Lucide's, and the car glyphs fit the domain. Use the `*Icon`
export names (e.g. `CarProfileIcon`) that 2.1.x provides. Mapping:
`Search→MagnifyingGlass`, `X→X`, `ChevronDown→CaretDown`, `CircleAlert→WarningCircle`,
`Info→Info`, `CircleCheck→CheckCircle`, `CircleX→XCircle`, `TriangleAlert→Warning`,
`LogOut→SignOut`, `Minus/Plus→Minus/Plus`, `RotateCw→ArrowClockwise`, `SearchX→FunnelX`,
`CarFront` (wordmark) → removed. Icons get `--ink-2` by default; never colour an icon
without text beside it. (Cheaper fallback, if time runs out: keep Lucide at
`strokeWidth={1.5}`, size 18. It is less different, though.)

### D.12 Wordmark and sign-in

- **Wordmark**: no blue app-icon tile. Set "Showroom" in Mona Sans 700 at `font-stretch: 125%`,
  `--ink`, tracking −0.01em. The mark is the type itself.
- **Sign-in / register**: on ≥1024px use a two-column split. Left: a full-height `--plate`
  panel with a large SUV silhouette (from D.10) in ink outline on the floor band, plus one
  line in `text-title`: "Cars in stock today, priced in rupees." Right: the form,
  **left-aligned**, max-width 400px, with no card around it. On mobile: wordmark top-left,
  form directly on `--bg`.

### D.13 Microcopy rules

1. Sentence case everywhere. No ALL-CAPS labels, no `→` on buttons, no emoji, no exclamation marks.
2. Say **car** to shoppers ("48 cars"); "vehicle" only in admin forms where it is a record.
3. Write facts as phrases, not middle-dot strings: "Pearl White SUV", "3 purchases, ₹38,40,000 in total".
4. Numbers are numerals with Indian grouping and tabular figures. Lakh/crore hint without `≈`: "12.5 lakh". This needs a change to `formatPriceHint` and its tests.
5. A button says what happens, and the toast repeats the verb: "Buy for ₹12,50,000" → "Bought 2022 Hyundai Creta".
6. Errors: what happened + how to fix it, no apology: "Only 1 left. Lower the quantity to 1."
7. Empty states: status + a way out. Filtered: "No cars match these filters" + [Clear filters]. Admin empty inventory: "No cars in stock yet" + [Add car].
8. Stock: "8 in stock", "Only 2 left", "Sold out", "Back after restock".

---

## E. Prioritised change list (about 2.5–3 h)

Effort: **S** < 20 min · **M** 20–60 min. Do them in this order; each step leaves the app working.

| # | Change | Files | Effort |
|---|---|---|---|
| 1 | **Tokens**: replace colour vars (D.3, light + dark), radii (D.4), elevation (D.5), type scale (D.2), `--font-sans`; drop `--elev-card*`; sheet radius 20; skeleton uses `--plate` | `frontend/src/index.css` | M |
| 2 | **Font**: `npm i @fontsource-variable/mona-sans@5.3.0`; import `wdth.css` first in `main.tsx` | `frontend/package.json`, `frontend/src/main.tsx` | S |
| 3 | **Studio plate**: new `carProfiles.ts` + paint map; rewrite `CategoryArt` (remove `TINTS`, Lucide icons); make `VehicleMedia` flush | `features/inventory/CategoryArt.tsx`, new `features/inventory/carProfiles.ts`, `features/inventory/VehicleMedia.tsx` | M |
| 4 | **Buttons**: `rounded-[10px]`; variants primary/secondary/quiet/destructive (D.7); update call sites (`variant="tinted"` → `secondary`, etc.) | `components/ui/Button.tsx` (+ grep `variant=`) | M |
| 5 | **Vehicle card**: border not shadow, anatomy D.9 (title "year make model", "{color} {category}", price row with stock line, secondary Purchase) | `features/inventory/VehicleCard.tsx`, `VehicleGridSkeleton.tsx`, tests in `InventoryPage.test.tsx`, `AdminTools.test.tsx` | M |
| 6 | **Stock status** as dot + text; labels "8 in stock"; `Badge` to 6px rect | `features/inventory/StockBadge.tsx`, `components/ui/Badge.tsx`, `lib/stock.ts`, `lib/stock.test.ts` | S |
| 7 | **Filter toolbar**: remove card wrapper; chips → 6px rect, selected = `--accent` fill + `--on-accent` | `features/inventory/FilterBar.tsx`, `ResultsBar.tsx` (and the mobile filter sheet in `InventoryPage.tsx`) | S |
| 8 | **Icons → Phosphor** (mapping D.11), remove `lucide-react` | 13 files importing `lucide-react` (`grep -rl lucide-react src`) | M |
| 9 | **Wordmark + auth layout** (D.12) | `components/Wordmark.tsx`, `features/auth/AuthLayout.tsx` | S–M |
| 10 | **Shell**: nav links 10px rect, `--plate` active fill; hairline always on; avatar stays round | `components/layout/AppShell.tsx`, `AccountMenu.tsx` | S |
| 11 | **Empty state**: left-aligned on the page (no card, no grey icon circle), copy per D.13 | `components/ui/EmptyState.tsx`, its call sites in `InventoryPage.tsx`, `PurchasesPage.tsx` | S |
| 12 | **Copy pass**: remove `≈` and middle-dot strings; update matching tests | `lib/format.ts` (+ `format.test.ts`), `PurchaseSheet.tsx`, `features/purchases/PurchasesPage.tsx`, `admin/VehicleFormSheet.tsx` | S |

After step 12, run `npm run verify`, then check both colour schemes at 320px and 1280px.
Check that ₹ renders in Mona Sans: DevTools → Computed → Rendered fonts on a price.

## Sources

- Anthropic (Nov 2025). *Improving frontend design through Skills.* claude.com. https://claude.com/resources/articles/improving-frontend-design-through-skills
- Anthropic (2026). *frontend-design* SKILL.md. GitHub anthropics/skills. https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- Capital & Compute (Sep 2026). *How to Fix AI Slop in Web Design, Tell by Tell.* https://capitalandcompute.net/blog/fix-ai-slop-design/
- Humble, J. (Apr 2026). *7 Signs a UI Has Been Vibe Coded.* The Fountain Institute. https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui
- prg.sh (Oct 2025). *Why Your AI Keeps Building the Same Purple Gradient Website.* https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- 925Studios (2026). *AI Slop Fonts and Gradients: The Tells That Give Away AI Design.* https://www.925studios.co/blog/ai-slop-design-tells
- Holterhoff, K. (Apr 2025). *UI component libraries: shadcn/ui and the revenge of copypasta.* RedMonk. https://redmonk.com/kholterhoff/2025/04/22/ui-component-libraries-shadcn-ui-and-the-revenge-of-copypasta/
- shadcn/studio (2025). *How to use shadcn icons.* https://shadcnstudio.com/blog/how-to-use-shadcn-icons/
- Vercel. `create-next-app` Tailwind template `layout.tsx` (read Oct 2026). https://github.com/vercel/next.js/blob/canary/packages/create-next-app/templates/app-tw/ts/app/layout.tsx
- npm, Inc. Downloads API, week to 25 Oct 2026. https://api.npmjs.org/downloads/point/last-week/lucide-react (same endpoint per package)
- Moran, K. *The Aesthetic-Usability Effect.* Nielsen Norman Group, last reviewed Sep 2026. https://www.nngroup.com/articles/aesthetic-usability-effect/
- Kaplan, K. (Sep 2021). *Designing Empty States in Complex Applications: 3 Guidelines.* NN/g. https://www.nngroup.com/articles/empty-state-interface-design/
- Linear (Mar 2024). *How we redesigned the Linear UI (part II).* https://linear.app/now/how-we-redesigned-the-linear-ui
- Radix Colors, WorkOS. *Composing a palette* (read Oct 2026). https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette
- Porsche AG. *Porsche Design System v4: Border, Color, Shadow tokens* (2026). https://designsystem.porsche.com/v4/tokens/border/
- Polestar (2018). *Journal 1* (brand identity). https://www.polestar.com/global/news/journal-1/
- Ahlin, T. (Dec 2022). *Introducing Mona Sans and Hubot Sans.* GitHub Blog. https://github.blog/news-insights/company-news/introducing-mona-sans-and-hubot-sans/
- Fontsource. *Mona Sans* package page. https://fontsource.org/fonts/mona-sans
- Hempenius, K. *Best practices for fonts.* web.dev. https://web.dev/articles/font-best-practices
- MDN. *font-variant-numeric.* https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric
- W3C (2023). *WCAG 2.2*, definitions of contrast ratio and relative luminance. https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
- Observed HTML/CSS, 25 Oct 2026: cars24.com, spinny.com, cardekho.com, carwale.com, rivian.com, polestar.com.
