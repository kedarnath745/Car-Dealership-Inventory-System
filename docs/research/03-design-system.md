# 03 · Design system: an HIG-inspired web system

A small design system for this React + Tailwind app that follows Apple Human Interface
Guidelines (HIG) quality: clear hierarchy, quiet surfaces, purposeful motion, and
accessibility by default. It is **inspired by** the HIG. It does not copy Apple assets,
fonts, icons or trademarks (§9).

HIG pages were read in Oct 2026 via `developer.apple.com/design/human-interface-guidelines/<topic>`.

## 1. Principles

| Principle | Source | Rule for this app |
|-----------|--------|-------------------|
| Hierarchy | WWDC25 framed the current design language around hierarchy, harmony and consistency ([Apple WWDC25 #356](https://developer.apple.com/videos/play/wwdc2025/356/)). | Content (the cars) is the hero. Controls sit in a separate, quieter layer: a translucent nav bar and sheets. |
| Content first | "Help people concentrate on primary tasks and content by limiting the number of onscreen controls" ([HIG Designing for iOS](https://developer.apple.com/design/human-interface-guidelines/designing-for-ios)). | One primary action per card (Purchase). Admin actions are secondary or in an overflow menu. |
| Harmony (concentric shapes) | "Concentric shapes calculate their radius by subtracting padding from the parent's" ([WWDC25 #356](https://developer.apple.com/videos/play/wwdc2025/356/)). | Inner radius = outer radius − padding (§4). Capsule buttons and chips. |
| Consistency | Use standard components and patterns ([WWDC25 #356](https://developer.apple.com/videos/play/wwdc2025/356/)). | Native `<select>`, `<dialog>` and inputs where possible; one button component with variants. |
| Accessible by default | HIG Accessibility: WCAG AA contrast, 44×44 pt default control size, Reduce Motion ([HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)). | Tokens below are contrast-checked. |

> The often-quoted trio "clarity, deference, depth" comes from older (iOS 7-era) HIG
> editions. It is still a useful lens, but it is not how the current HIG is organised.
> I did not verify it against an archived copy, so don't quote it as current Apple guidance.

## 2. Typography

### Font stack (no web font download)

```css
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
```

- On Apple devices `system-ui` / `-apple-system` renders the OS system font (San Francisco)
  **from the user's own OS**. Nothing is shipped or embedded. On Windows it gives Segoe UI,
  on Android Roboto ([MDN font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family)).
- MDN warns that `system-ui` is meant for UI, not long paragraphs. Fine here: the app is all UI text.
- **Do not** ship SF Pro files (§9). Inter (SIL OFL 1.1, [license](https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt)) is the open alternative if one font is required everywhere. It costs a download (LCP) for little gain, so it is **not recommended** now.
- Use `font-variant-numeric: tabular-nums` for prices, stock counts and the purchases table.
- Avoid Ultralight, Thin and Light weights: "prefer Regular, Medium, Semibold, or Bold" ([HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)).

### Type scale

Based on HIG iOS "Large (default)" text styles (size/leading in pt) ([HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)),
mapped 1 pt → 1 CSS px and expressed in `rem` so browser text-size settings still scale it (WCAG 1.4.4).

| Token | HIG style | Size / line-height | Weight | Use |
|-------|-----------|--------------------|--------|-----|
| `text-large-title` | Large Title 34/41 | 2.125rem / 2.5625rem | 700 | Page title ("Inventory"), desktop |
| `text-title1` | Title 1 28/34 | 1.75rem / 2.125rem | 700 | Page title, mobile; sheet titles on desktop |
| `text-title2` | Title 2 22/28 | 1.375rem / 1.75rem | 700 | Sheet titles, empty-state headings |
| `text-title3` | Title 3 20/25 | 1.25rem / 1.5625rem | 600 | Card title (make + model), price |
| `text-headline` | Headline 17/22 | 1.0625rem / 1.375rem | 600 | Buttons, table headers |
| `text-body` | Body 17/22 | 1.0625rem / 1.375rem | 400 | Default text, inputs |
| `text-callout` | Callout 16/21 | 1rem / 1.3125rem | 400 | Helper text, chips |
| `text-subhead` | Subhead 15/20 | 0.9375rem / 1.25rem | 400 | Card meta row (year · colour · category) |
| `text-footnote` | Footnote 13/18 | 0.8125rem / 1.125rem | 400–600 | Badges, field errors, timestamps |
| `text-caption` | Caption 1 12/16 | 0.75rem / 1rem | 500 | Smallest allowed text; non-essential only |

- Letter-spacing: `-0.01em` on Title 3 and larger; `normal` elsewhere. (HIG publishes
  per-size tracking tables for SF, e.g. 17 pt = −0.43 pt, but those are SF-specific and the
  OS applies them automatically to the system font.)
- Text inputs must be **at least 16px**. Smaller inputs make iOS Safari zoom on focus
  *(widely observed browser behaviour, not from a cited source)*. `text-body` (17px) avoids it.

## 3. Spacing and layout

| Token | Value | Notes |
|-------|-------|-------|
| Base unit | 4px (Tailwind `--spacing: 0.25rem`, the default) | Use 4/8/12/16/20/24/32/40/48/64 |
| Page gutter | 16px (< 640), 24px (≥ 640), 32px (≥ 1024) | Respect `env(safe-area-inset-*)` on mobile ([HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)) |
| Max content width | 1280px, centred | |
| Grid | 1 col < 640 · 2 cols ≥ 640 · 3 cols ≥ 1024 · 4 cols ≥ 1280; gap 16px mobile / 24px desktop | Card min width ≈ 280px |
| Card padding | 16px (inner content), image flush with an 8px inset | |
| Form field spacing | 16px between fields; 6px label → input; 6px input → error | "Stack multiple text fields vertically… consistent widths" ([HIG Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)) |
| Sticky nav height | 56px (+ safe area) | |

## 4. Shape (radii)

Concentric rule: **inner radius = outer radius − padding** ([WWDC25 #356](https://developer.apple.com/videos/play/wwdc2025/356/)).

| Token | Value | Use |
|-------|-------|-----|
| `--radius-card` | 20px | Vehicle card |
| `--radius-card-media` | 12px | Card image inset by 8px (20 − 8) |
| `--radius-sheet` | 28px (top corners on mobile; all corners on desktop) | Sheets/dialogs |
| `--radius-field` | 12px | Inputs, selects, segmented track |
| `--radius-segment` | 9px | Segment thumb (12 − 3 padding) |
| `--radius-full` | 9999px | Buttons, chips, badges (capsules) |

## 5. Colour

### 5.1 Approach

- **Semantic tokens** (label, secondary label, background, separator, accent, destructive),
  as HIG does with dynamic system colours ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)), switched for dark mode.
- **Don't use colour alone**: every status has text and/or an icon too ([HIG Color, "Inclusive color"](https://developer.apple.com/design/human-interface-guidelines/color); WCAG 1.4.1).
- **Contrast was verified** with the WCAG 2.x relative-luminance formula (script in the
  research notes). Two findings matter:
  1. Apple's default blues **fail AA as button fills with white text**. White on `#0088FF`
     (HIG 2025 light blue) is **3.52:1**, white on `#007AFF` is **4.02:1**, and white on
     `#0091FF` (dark) is **3.23:1**. HIG's own accessible blue `#1E6EF4` reaches **4.57:1**,
     only just over 4.5. **Use `#0066CC` (5.57:1) for filled buttons.**
  2. iOS `secondaryLabel` (rgba(60,60,67,0.6)) on white is only **3.44:1**. Use `#6C6C70`
     (HIG's accessible systemGray, **5.23:1** on white, 4.69:1 on `#F2F2F7`).

### 5.2 Tokens

| Token | Light | Dark | Checked contrast |
|-------|-------|------|------------------|
| `--bg` (page, grouped) | `#F2F2F7` | `#000000` | — |
| `--surface` (cards, sheets) | `#FFFFFF` | `#1C1C1E` | — |
| `--surface-2` (inputs, hover, skeleton) | `#F2F2F7` | `#2C2C2E` | — |
| `--surface-3` (pressed, segment track) | `#E5E5EA` | `#3A3A3C` | — |
| `--label` | `#1C1C1E` | `#FFFFFF` | 17.0:1 on surface (both) |
| `--label-2` (secondary) | `#6C6C70` | `#AEAEB2` | 5.23 / 7.69 on surface; 4.69 / 6.30 on surface-2 |
| `--label-3` (placeholder, disabled) | `#8E8E93` | `#8E8E93` | 3.26 / 5.22. **Never for essential text.** |
| `--separator` (decorative hairlines) | `rgb(60 60 67 / 0.18)` | `rgb(84 84 88 / 0.6)` | decorative only |
| `--border-control` (input/checkbox outline) | `#8E8E93` | `#8E8E93` | 3.26 / 5.22: meets 3:1 non-text (1.4.11) |
| `--accent` (filled button bg, focus ring light) | `#0066CC` | `#0A72E8` | white text 5.57 / 4.58 |
| `--accent-text` (links, tinted text) | `#0066CC` | `#5CB8FF` | 5.57 on white, 4.99 on `#F2F2F7` / 7.90 on `#1C1C1E` |
| `--accent-tint` (tinted button/badge bg) | `#E8F1FC` | `#10253D` | accent-text on it: 4.88 / 7.20 |
| `--focus-ring` | `#0066CC` | `#5CB8FF` | 5.57 vs white / 7.90 vs `#1C1C1E` |
| `--danger` (filled destructive bg) | `#D70015` | `#D70015` | white text 5.38 |
| `--danger-text` | `#D70015` | `#FF6165` | 5.38 on white / 5.79 on `#1C1C1E` |
| `--danger-tint` | `#FDECEE` | `#3A1517` | danger-text on it: 4.72 / 5.50 |
| `--success-text` | `#007A2E` | `#4AD968` | 5.49 / 9.25 |
| `--success-tint` | `#E8F5EC` | `#0F2A17` | 4.89 / 8.37 |
| `--warning-text` | `#B45309` | `#FFA056` | 5.02 / 8.44 |
| `--warning-tint` | `#FDF3E7` | `#33210F` | 4.58 / 7.63 |
| `--scrim` (behind sheets) | `rgb(0 0 0 / 0.40)` | `rgb(0 0 0 / 0.60)` | — |

Dark-mode values for the semantic accents come from the HIG "accessible" (Increase
Contrast) variants: `#5CB8FF`, `#FF6165`, `#4AD968`, `#FFA056` ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color), values updated June 2025).

### 5.3 Dark mode

- Follow the OS setting with `prefers-color-scheme`. **No in-app toggle**: HIG says "Avoid
  offering an app-specific appearance setting" ([HIG Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)).
- Depth in dark mode comes from **lighter elevated surfaces**, not shadows (HIG's base vs
  elevated backgrounds). Sheets use `--surface` (`#1C1C1E`) over a `#000` page.
- HIG: aim for at least 4.5:1, ideally 7:1 for small custom text in dark mode ([HIG Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)).
- Dim user-supplied car photos slightly in dark mode (`filter: brightness(.92)`), because
  HIG advises softening white backgrounds in images.

## 6. Elevation and materials

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--shadow-card` | `0 1px 2px rgb(0 0 0 / .04), 0 4px 16px rgb(0 0 0 / .06)` | `none` (use surface colour) | Cards at rest |
| `--shadow-card-hover` | `0 2px 4px rgb(0 0 0 / .06), 0 12px 32px rgb(0 0 0 / .10)` | `0 0 0 1px rgb(255 255 255 / .08)` | Card hover (pointer devices only) |
| `--shadow-overlay` | `0 24px 64px rgb(0 0 0 / .20)` | `0 24px 64px rgb(0 0 0 / .60)` | Sheets, menus, toasts |
| `--material-bar` | `rgb(255 255 255 / .72)` + `backdrop-filter: saturate(180%) blur(20px)` | `rgb(28 28 30 / .72)` + same | Sticky nav bar and mobile tab bar **only** |

- HIG: translucent material belongs to the **controls/navigation layer, not the content
  layer**, and should be used sparingly ([HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)). Don't make cards glassy.
- Legibility check: `--label` on the light bar over pure black content is **8.58:1**; white
  label on the dark bar over white content is **6.68:1**.
- `backdrop-filter` is Baseline 2024 ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)). Wrap it in
  `@supports (backdrop-filter: blur(1px))` with an opaque fallback.
- Honour `prefers-reduced-transparency: reduce` (make bars opaque). It is experimental and
  not Baseline ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)), so treat it as progressive enhancement.

## 7. Motion

| Token | Value | Use |
|-------|-------|-----|
| `--duration-instant` | 100ms | Press/highlight feedback |
| `--duration-fast` | 200ms | Hover, fades, chip add/remove |
| `--duration-base` | 300ms | Sheet/dialog enter |
| `--duration-exit` | 200ms | Sheet/dialog exit (exits faster than entries) |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `--ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheet slide-up (springy feel) |

These easing values are **our choices** to approximate iOS feel. They are not Apple-published values.

Rules ([HIG Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)):
- "Add motion purposefully". No motion on frequent interactions beyond press feedback.
- "Let people cancel motion": never block input while an animation runs.
- **Reduced motion**: under `@media (prefers-reduced-motion: reduce)` ([MDN, Baseline widely available](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)),
  replace slides and scales with a 150ms opacity fade and stop the skeleton shimmer
  (NN/g notes animated skeletons can cause accessibility problems: [NN/g 2023](https://www.nngroup.com/articles/skeleton-screens/)).
- Card press: `transform: scale(.98)` for 100ms (pointer and touch); none under reduced motion.

## 8. Components

### 8.1 Buttons

| Variant | Look | Use |
|---------|------|-----|
| `filled` (primary) | `--accent` bg, white text, capsule | One per view or card: Purchase, Save, Sign in |
| `tinted` (secondary) | `--accent-tint` bg, `--accent-text` text | Restock, Add vehicle (toolbar), Load more |
| `plain` | No bg, `--accent-text` text; `--surface-2` on hover/press | Cancel, Clear all, text links |
| `destructive` | `--danger` bg, white text | Only the final "Delete vehicle" in the confirm dialog |
| `destructive-plain` | `--danger-text` text, no bg | "Delete" entry in the card overflow menu |

| Size | Height | Padding x | Text |
|------|--------|-----------|------|
| `lg` | 50px | 20px | Headline 17/600 (sheet primary, full width on mobile) |
| `md` | 44px | 16px | Headline 17/600 (default) |
| `sm` | 32px visual, **≥ 44px hit area on touch** via padding or `::before` | 12px | Subhead 15/600 (chips, card secondary actions) |

- Targets: HIG default 44×44 pt, minimum 28×28 pt ([HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)); WCAG 2.5.8 minimum 24×24 CSS px ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- "Always include a press state" ([HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)): pressed = 8% darker fill (or `opacity: .85`).
- Labels start with a verb, in title case for buttons: "Add Vehicle", "Buy for ₹12,50,000" (HIG Buttons).
- Disabled: 40% opacity plus `aria-disabled`/`disabled`. A disabled Purchase must also say why ("Sold out").
- Loading: keep the width, swap the label for a spinner plus "Buying…", set `aria-busy="true"`, and ignore repeat clicks.
- Primary on the trailing side of a row, Cancel on the leading side ([HIG Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)). On mobile sheets, stack them with the primary on top.

### 8.2 Text input

- Height 44px, `--radius-field`, `--surface` bg, 1px `--border-control`, 12px padding, `text-body`.
- **Visible label above** the field. A placeholder may hint but never replaces the label ([HIG Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields): placeholder "disappears when people start typing").
- Focus: 2px `--focus-ring` outline with 2px offset (`:focus-visible`).
- Error: border `--danger-text` + icon + message below in `text-footnote` `--danger-text`, linked with `aria-describedby`; `aria-invalid="true"`.
- Price inputs: leading "₹" adornment, `inputMode="numeric"`, en-IN grouping applied on blur.
- Clear button (×) inside search fields ([HIG Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)).
- Password: secure field plus a "Show" toggle button (see 04).

### 8.3 Select (pop-up button)

- Use a native `<select>` styled like an input with a chevron. Mobile OSes give their native picker for free.
- HIG pop-up button: "a flat list of mutually exclusive options" ([HIG Pop-up buttons](https://developer.apple.com/design/human-interface-guidelines/pop-up-buttons)). Use it for **Category** in forms and for **Sort**.

### 8.4 Segmented control

- HIG: "no more than about five segments on iPhone", "five to seven" on wide screens ([HIG Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)).
- Category has 9 options (All + 8), **too many** for a segmented control. Use a horizontally
  scrollable **chip row** (single-select, `role="radiogroup"`) on the dashboard and a `<select>` in forms.
- Use a segmented control for the admin stock view: **All · Low stock · Sold out** (Could).
- Markup: `role="radiogroup"` with `role="radio"` items, arrow-key navigation; thumb is `--surface` with `--shadow-card` on a `--surface-3` track.

### 8.5 Card (vehicle)

```
┌───────────────────────────────┐  radius 20, surface, shadow-card, padding 8
│ ┌───────────────────────────┐ │
│ │ image 16:10, radius 12    │ │  imageUrl or category placeholder tile
│ │                [Low · 2]  │ │  stock badge, top-right of the image
│ └───────────────────────────┘ │
│  Hyundai Creta                │  title3 600, label (padding 8 → 16 text inset)
│  2024 · White · SUV           │  subhead, label-2
│  ₹12,50,000                   │  title3 600, tabular-nums
│  [ − 1 + ]  [  Purchase   ]   │  quantity stepper + filled md button
│  (admin) Edit · Restock · ⋯   │  plain sm buttons; Delete inside ⋯ menu
└───────────────────────────────┘
```

- The whole card is **not** a link: there is no detail page, and nested interactive elements inside a link are invalid.
- Sold out: image `opacity: .6`, badge "Sold out", Purchase replaced by a disabled "Sold out" button; admin sees "Restock" as the primary action instead.

### 8.6 Badge

| Badge | Style | Text |
|-------|-------|------|
| In stock | `--success-tint` / `--success-text` + `check-circle` icon | "In stock · 12" |
| Low stock (1–3, see Q4) | `--warning-tint` / `--warning-text` + `alert-triangle` | "Only 2 left" |
| Sold out | `--surface-3` / `--label-2` + `x-circle` | "Sold out" |
| Role | `--accent-tint` / `--accent-text` | "Admin" |
| Category | `--surface-2` / `--label-2` | "SUV" |

Capsule, `text-footnote` 600, height 24px, padding 0 8px.

### 8.7 Sheet / modal

- Use native `<dialog>` with `showModal()`: top layer, inert background and Esc-to-close are built in ([MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)). Alternatively Radix Dialog.
- **Mobile (< 640px)**: bottom sheet, full width, top radius 28, `max-height: 90dvh`, decorative grabber, internal scroll, sticky footer with actions, `padding-bottom: env(safe-area-inset-bottom)`.
- **Desktop**: centred, width 520px (forms) / 400px (alerts), radius 28.
- Header: title (`text-title2`), Cancel on the leading side. Footer: primary on the trailing side.
- Keyboard ([WAI-ARIA APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)): focus moves inside on open, Tab is trapped, Esc closes, and focus **returns to the trigger** on close.
- HIG: one sheet at a time; keep sheet tasks brief ([HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)).
- Alert (delete confirm) = small dialog with `role="alertdialog"`, title + one sentence + two buttons.

### 8.8 Toast

- sonner, bottom-centre on mobile (above the tab bar), bottom-right on desktop; `--surface` bg with `--shadow-overlay`; `text-callout`.
- Success only; 5000ms; close button; pauses on hover. Errors go inline (02 §7).

### 8.9 Navigation bar (and tab bar)

- **Top bar** (all sizes): sticky, `--material-bar`, 56px, bottom hairline `--separator` that appears only after scroll. Left: app wordmark (our own name, e.g. "Showroom"). Right (desktop): "Inventory", "My Purchases", account menu with "Admin" badge and Sign out.
- **Mobile tab bar** (Should): HIG uses tab bars for top-level sections ([HIG Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)). Three tabs: Inventory, Purchases, Account. 49px plus safe area; icon (24px) + label (`text-caption` 500). Active tab in `--accent-text` plus `aria-current="page"`.
- Large title ("Inventory", `text-large-title`) at the top of the page content, not inside the bar.

### 8.10 Iconography

- **Lucide** (`lucide-react`, ISC license: "Permission to use, copy, modify, and/or distribute this software for any purpose…", [Lucide license](https://lucide.dev/license)). Stroke width 1.75, size 20px (inline) / 24px (tab bar).
- Icon-only buttons need `aria-label` and a ≥ 44px hit area.
- Check exact icon names at lucide.dev before use (e.g. car, truck, zap, plus, pencil, trash, package-plus, search, sliders-horizontal, x, check-circle, alert-triangle).

## 9. Licensing and trademark rules (do not skip)

| Asset | Rule | Source |
|-------|------|--------|
| SF Pro / San Francisco fonts | **Do not download, embed, self-host or `@font-face` them.** The licence allows use "solely for creating mock-ups of user interfaces to be used in software products running on Apple's iOS, OS X or tvOS", forbids use for UIs on "any non-Apple operating system", and says "You may not embed the Apple Font in any software programs or other products." | [Apple Fonts licence](https://developer.apple.com/fonts/) |
| System font via CSS | Allowed: `system-ui` / `-apple-system` asks the visitor's OS for its own font. Nothing is distributed. | [MDN font-family](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family) |
| SF Symbols | **Do not use.** HIG: understand the SF Symbols terms, "including the prohibition against using symbols, or images that are confusingly similar, in app icons, logos, or any other trademarked use". Use Lucide. | [HIG SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) |
| Apple logo, product names, "Liquid Glass", Apple imagery | Don't use. Say "inspired by Apple's Human Interface Guidelines" in the README; never "Apple design" or Apple branding in the UI. | Trademark caution (general) |
| Car photos (`imageUrl`) | Seed data should use images you are allowed to use (your own, or explicitly free-licensed such as Unsplash/Pexels, with attribution if required), or fall back to category icons. | General copyright caution |

## 10. Implementation: CSS variables + Tailwind v4 theme

```css
/* src/index.css */
@import "tailwindcss";

:root {
  color-scheme: light dark;
  --bg: #F2F2F7; --surface: #FFFFFF; --surface-2: #F2F2F7; --surface-3: #E5E5EA;
  --label: #1C1C1E; --label-2: #6C6C70; --label-3: #8E8E93;
  --separator: rgb(60 60 67 / .18); --border-control: #8E8E93;
  --accent: #0066CC; --accent-text: #0066CC; --accent-tint: #E8F1FC; --focus-ring: #0066CC;
  --danger: #D70015; --danger-text: #D70015; --danger-tint: #FDECEE;
  --success-text: #007A2E; --success-tint: #E8F5EC;
  --warning-text: #B45309; --warning-tint: #FDF3E7;
  --scrim: rgb(0 0 0 / .40);
  --material-bar: rgb(255 255 255 / .72);
  --elev-card: 0 1px 2px rgb(0 0 0 / .04), 0 4px 16px rgb(0 0 0 / .06);
  --elev-overlay: 0 24px 64px rgb(0 0 0 / .20);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000; --surface: #1C1C1E; --surface-2: #2C2C2E; --surface-3: #3A3A3C;
    --label: #FFFFFF; --label-2: #AEAEB2; --label-3: #8E8E93;
    --separator: rgb(84 84 88 / .6); --border-control: #8E8E93;
    --accent: #0A72E8; --accent-text: #5CB8FF; --accent-tint: #10253D; --focus-ring: #5CB8FF;
    --danger: #D70015; --danger-text: #FF6165; --danger-tint: #3A1517;
    --success-text: #4AD968; --success-tint: #0F2A17;
    --warning-text: #FFA056; --warning-tint: #33210F;
    --scrim: rgb(0 0 0 / .60);
    --material-bar: rgb(28 28 30 / .72);
    --elev-card: none;
    --elev-overlay: 0 24px 64px rgb(0 0 0 / .60);
  }
}

@theme inline {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  --color-bg: var(--bg); --color-surface: var(--surface);
  --color-surface-2: var(--surface-2); --color-surface-3: var(--surface-3);
  --color-label: var(--label); --color-label-2: var(--label-2); --color-label-3: var(--label-3);
  --color-separator: var(--separator); --color-border-control: var(--border-control);
  --color-accent: var(--accent); --color-accent-text: var(--accent-text);
  --color-accent-tint: var(--accent-tint); --color-focus: var(--focus-ring);
  --color-danger: var(--danger); --color-danger-text: var(--danger-text); --color-danger-tint: var(--danger-tint);
  --color-success: var(--success-text); --color-success-tint: var(--success-tint);
  --color-warning: var(--warning-text); --color-warning-tint: var(--warning-tint);
  --shadow-card: var(--elev-card); --shadow-overlay: var(--elev-overlay);
}

@theme {
  --text-large-title: 2.125rem; --text-large-title--line-height: 2.5625rem;
  --text-title1: 1.75rem;       --text-title1--line-height: 2.125rem;
  --text-title2: 1.375rem;      --text-title2--line-height: 1.75rem;
  --text-title3: 1.25rem;       --text-title3--line-height: 1.5625rem;
  --text-headline: 1.0625rem;   --text-headline--line-height: 1.375rem;
  --text-body: 1.0625rem;       --text-body--line-height: 1.375rem;
  --text-callout: 1rem;         --text-callout--line-height: 1.3125rem;
  --text-subhead: 0.9375rem;    --text-subhead--line-height: 1.25rem;
  --text-footnote: 0.8125rem;   --text-footnote--line-height: 1.125rem;
  --text-caption: 0.75rem;      --text-caption--line-height: 1rem;
  --radius-card: 20px; --radius-card-media: 12px; --radius-sheet: 28px;
  --radius-field: 12px; --radius-segment: 9px;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-sheet: cubic-bezier(0.32, 0.72, 0, 1);
}

body { @apply bg-bg text-label font-sans text-body antialiased; }
:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.material-bar { background: var(--surface); }
@supports (backdrop-filter: blur(1px)) {
  .material-bar { background: var(--material-bar); backdrop-filter: saturate(180%) blur(20px); }
}
@media (prefers-reduced-transparency: reduce) { .material-bar { background: var(--surface); backdrop-filter: none; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; scroll-behavior: auto !important; }
}
```

Raw values live in `:root` under names (`--bg`, `--elev-card`) that differ from the Tailwind theme names (`--color-bg`, `--shadow-card`), so no variable refers to itself.

Usage: `bg-surface rounded-card shadow-card`, `text-title3 font-semibold`, `text-label-2`,
`bg-accent text-white rounded-full h-11 px-4`, `ease-standard duration-200`.

> On Tailwind v3, put the same values in `tailwind.config.ts` `theme.extend`
> (`colors: { surface: 'var(--surface)', … }`, `fontSize`, `borderRadius`, `boxShadow`).
> The CSS variables block is the same.
