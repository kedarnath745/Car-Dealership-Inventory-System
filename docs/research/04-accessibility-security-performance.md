# 04 · Accessibility, auth security and performance

## 1. WCAG 2.2 AA checklist for this app

WCAG 2.2 became a W3C Recommendation on 5 October 2023 and adds 9 success criteria to 2.1
([W3C WAI](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)). Spec: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
**New in 2.2** is marked ★.

### 1.1 All screens

| SC | Level | Requirement | How we meet it | Test |
|----|-------|-------------|----------------|------|
| 1.4.3 Contrast (Minimum) | AA | Text ≥ 4.5:1 (large ≥ 3:1) | Tokens in 03 §5.2 were checked; `--label-3` is never used for essential text | axe in RTL tests + manual |
| 1.4.11 Non-text Contrast | AA | UI component boundaries and focus ≥ 3:1 | Input border `#8E8E93` 3.26:1 on white; focus ring 5.57:1 | Manual |
| 1.4.1 Use of Color | A | Colour is not the only signal | Stock badges have text and icon; errors have icon and text | Visual review |
| 2.4.7 Focus Visible | AA | Keyboard focus is visible | Global `:focus-visible` 2px ring + 2px offset | Tab through every screen |
| 2.4.11 Focus Not Obscured (Min) ★ | AA | Focused item not fully hidden by sticky UI | `scroll-padding-top: 72px` (nav) and `scroll-padding-bottom` (mobile tab bar) on `html` | Tab through the grid on mobile width |
| 2.5.8 Target Size (Min) ★ | AA | Targets ≥ 24×24 CSS px or enough spacing ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)) | We go further: 44px for primary controls (HIG default); chips/badges that are buttons ≥ 32px with spacing | Measure in devtools |
| 2.1.1 Keyboard | A | Everything works by keyboard | Native buttons/inputs/select/dialog; chip row is a radiogroup with arrow keys | Keyboard-only run |
| 2.4.3 Focus Order | A | Logical order | DOM order = visual order; no positive `tabindex` | Keyboard run |
| 1.3.1 Info and Relationships | A | Semantics in markup | `<header>`, `<nav>`, `<main>`, one `<h1>` per page, cards as `<article>` with `<h2>`, purchases as a `<table>` | axe |
| 2.4.2 Page Titled | A | Each route sets `document.title` | "Inventory · Showroom", "Sign in · Showroom" | Unit test |
| 1.4.4 Resize Text / 1.4.10 Reflow | AA | Usable at 200% zoom and 320px width | `rem` type scale; 1-column grid < 640px; no fixed heights on text | Zoom test |
| 2.3.3 (AAA, adopted) / HIG Reduce Motion | — | Respect reduced motion | `prefers-reduced-motion` rules in 03 §7 | Toggle OS setting |
| 3.2.6 Consistent Help ★ | A | Help in the same place on every page | Only applies if help exists; keep any "Need help?" link in the same footer slot | — |

### 1.2 Forms (login, register, add/edit vehicle, restock, filters)

| SC | Requirement | How |
|----|-------------|-----|
| 1.3.5 Identify Input Purpose (AA) | `autocomplete` tokens | `name` → `autocomplete="name"`, `email` → `email`, login password → `current-password`, register password → `new-password` |
| 3.3.2 Labels or Instructions (A) | Visible labels | `<label for>` on every field; requirements stated up front ("At least 8 characters") |
| 3.3.1 Error Identification (A) | Errors identified in text | Message under the field, `aria-invalid`, `aria-describedby` |
| 3.3.3 Error Suggestion (AA) | Say how to fix | "Enter a price above ₹0", not "Invalid price" ([NN/g 2023](https://www.nngroup.com/articles/error-message-guidelines/)) |
| 3.3.4 Error Prevention (Legal, Financial, Data) (AA) | Financial transactions are reversible, checked, or confirmed | **Purchase confirmation sheet** with quantity and total before submitting. Delete has a confirm dialog. |
| 3.3.7 Redundant Entry ★ (A) | Don't ask again for info already given | Register logs the user in (D16); the edit form is pre-filled |
| 3.3.8 Accessible Authentication (Min) ★ (AA) | No cognitive test to log in; password managers and paste must work ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)) | Never block paste; correct `autocomplete`; no CAPTCHA |
| On submit with errors | — | Move focus to the first invalid field (or to an error summary that links to the fields) |

### 1.3 Dynamic content

| Pattern | Requirement | How |
|---------|-------------|-----|
| Toasts | 4.1.3 Status Messages (AA): announce without moving focus ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)) | `role="status"` live region (sonner). Add an RTL test that the region exists. |
| Result count | 4.1.3 | "12 vehicles" in `aria-live="polite"`, updated after the debounce (not on every keystroke) |
| Loading | 4.1.3 | Grid container `aria-busy="true"` while loading; skeletons `aria-hidden="true"`; a visually hidden "Loading vehicles…" message |
| Modals and sheets | Keyboard pattern from [WAI-ARIA APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | Focus moves in on open; Tab/Shift+Tab trapped; Esc closes; focus returns to the trigger; `aria-labelledby` = sheet title; `aria-describedby` for the delete alert body |
| Disabled Purchase | Disabled controls are skipped by Tab, so the reason must be visible text | The card shows "Sold out" next to the button, and the button reads "Sold out" |
| Session expired | Explain it, don't just redirect | Login page banner: "Your session has ended. Sign in again to continue." (focusable, `role="alert"`) |

## 2. Authentication UX and security

### 2.1 NIST SP 800-63B-4 (final, 2025) password rules vs this app

Sources: [NIST SP 800-63B-4, "Password Verifiers"](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver) and ["AAL1 Reauthentication"](https://pages.nist.gov/800-63-4/sp800-63b.html#aal1reauth).

| NIST requirement (quoted) | This app today (D14, D15) | Gap / action |
|---------------------------|---------------------------|--------------|
| Single-factor passwords "SHALL require… a minimum of 15 characters"; 8 is only allowed when the password is "part of multi-factor authentication" | Min **8**, password-only login | **Gap.** Raise to 15 or document the deviation (06, Q1) |
| "SHOULD permit a maximum password length of at least 64 characters" | Max 72 (bcrypt limit) | OK |
| "SHALL NOT impose other composition rules (e.g., requiring mixtures of different character types)" | None | OK. Don't add any in the UI either |
| "SHALL NOT require subscribers to change passwords periodically" | No expiry | OK |
| "SHALL compare the prospective secret against a blocklist" of common or breached passwords | None | Gap. Could: a small top-N common-password list in the zod schema |
| "SHALL implement a rate-limiting mechanism" for failed attempts | None in `app.ts` | Gap. Should: `express-rate-limit` on `/api/auth/*` (06) |
| "SHALL allow the use of password managers and autofill"; "SHOULD permit… the 'paste' function" | Frontend not built | Use `autocomplete` and never block paste |
| "SHOULD offer an option to display the password… while it is entered" | Frontend not built | "Show" toggle button (below) |
| Verify the full password, no truncation | bcrypt truncates input beyond 72 bytes; validation caps at 72 characters | Multi-byte characters can still exceed 72 bytes. Low risk; note it in the README or cap by bytes |
| AAL1 overall reauthentication timeout "SHOULD be no more than 30 days" | JWT expires after 1 day | OK |

### 2.2 Login and register UX

| Topic | Guidance | Apply |
|-------|----------|-------|
| Login error | Respond with a generic message whether the user ID or the password was wrong; watch for timing differences ([OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)) | Backend already does this, including a dummy-hash compare (`auth.service.ts`). UI copy: "That email and password don't match. Check them and try again." Keep the email; clear only the password. |
| Registration enumeration | OWASP: the generic-message approach "can be applied" to registration too | `409 EMAIL_TAKEN` reveals that an account exists. A usability trade-off (06, Q10). Recommend keeping it, with rate limiting. |
| Show password | NIST SHOULD (above); NN/g has long argued masking costs usability ([NN/g 2009](https://www.nngroup.com/articles/stop-password-masking/), older opinion piece) | A `<button type="button" aria-pressed>` "Show"/"Hide" inside the field; resets to hidden on submit |
| Requirements up front | NN/g: don't validate before input is complete ([NN/g 2019](https://www.nngroup.com/articles/errors-forms-design-guidelines/)) | Helper "At least N characters" under the field; validate on blur and on submit |
| Paste and password managers | WCAG 3.3.8; NIST | Never `onPaste={e => e.preventDefault()}`; correct `autocomplete` |
| Submit state | Prevent double submit | Disable and show a spinner while pending; Enter submits once |
| After login | Return to the intended page | Store the attempted path; redirect there (default `/`) |
| Session expiry | Any `401` → clear token → `/login?reason=expired&next=/…` | Show the expiry banner (§1.3) instead of failing silently |
| Token storage | DESIGN §5 trade-off (localStorage vs httpOnly cookie) | Keep it as documented. Note that `helmet()` on the API does **not** protect the SPA: add a Content-Security-Policy header on the SPA host (e.g. `vercel.json` headers), never render untrusted HTML, and treat `imageUrl` only as an `<img src>` |

## 3. Performance and perceived performance

### 3.1 Targets: Core Web Vitals

"Good" thresholds, at the 75th percentile of page loads ([web.dev Web Vitals](https://web.dev/articles/vitals)):

| Metric | Good | How this app gets there |
|--------|------|-------------------------|
| LCP (Largest Contentful Paint) | ≤ 2.5 s | No web fonts (system stack); code-split admin sheets; first-row card images `loading="eager"` + `fetchpriority="high"`, the rest `loading="lazy"` ([web.dev lazy loading](https://web.dev/articles/browser-level-image-lazy-loading)) |
| INP (Interaction to Next Paint, stable Core Web Vital since 2024) | ≤ 200 ms | Debounce filters by 300 ms; memoise the card list; no heavy work in input handlers |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Fixed `aspect-ratio: 16/10` on card media; skeletons the same size as cards; reserve space for the result count and chip row ([web.dev Optimize CLS](https://web.dev/articles/optimize-cls)) |

Practical budget for a Vite SPA *(our targets, not from a source)*: initial JS ≤ 200 KB gzipped;
Lighthouse Performance ≥ 90 and Accessibility = 100 on the dashboard (desktop preset). Put the
scores in the README.

### 3.2 Perceived performance

| Technique | Evidence | Use |
|-----------|----------|-----|
| Skeleton on first load | Best for full-page loads under 10 s; not needed under 1 s ([NN/g 2023](https://www.nngroup.com/articles/skeleton-screens/), citing Mejtoft et al. 2018) | Grid skeleton, shown after a 300 ms delay |
| Spinner in a module | Spinners suit a single module ([NN/g 2023](https://www.nngroup.com/articles/skeleton-screens/)) | Inside buttons and sheets |
| Keep old data while refetching | 1 s flow limit ([Nielsen 1993](https://www.nngroup.com/articles/response-times-3-important-limits/)) | TanStack Query `placeholderData: keepPreviousData` for search |
| Optimistic UI | Supported with rollback ([TanStack docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)) | **Not used**: purchase, restock, edit and delete all change money or stock. Update the cache from the server response instead (the purchase response already returns `vehicle`). |
| Cold start on free hosting | Render free instances may sleep *(deployment note, not verified here)* | If deployed, show a friendly "Waking up the server…" after 3 s on first load |
