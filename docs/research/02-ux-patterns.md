# 02 · UX patterns: evidence

Research-backed patterns for the screens in this app. Each row gives the guideline, the
evidence, and what it means here. Baymard figures are benchmark percentages of
e-commerce sites; NN/g items are expert guidelines from usability research.

## 1. Search and filtering

| Guideline | Evidence | Apply here |
|-----------|----------|------------|
| Show which filters are applied, as removable chips near the results. | 28% of sites don't display applied filters on PLPs ([Baymard 2026a](https://baymard.com/blog/product-listing-page-plp-ux)); 20% fail to keep applied filters visible ([Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). | Chip row above the grid: "SUV ×", "₹5,00,000–₹15,00,000 ×", plus "Clear all". |
| Offer "Clear all" and per-filter reset. | [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui) | Chips remove one filter; one "Clear all" link. |
| Persist filter state in the URL so Back and reload keep it. | "ensure filter state is reflected in the URL (query parameters) so it survives navigation" ([Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). | Already planned in DESIGN §5. Keep it. |
| Desktop: apply filters in real time. Mobile: a sheet with a deliberate "Show N results" button. | Baymard recommends real-time filtering on desktop and a sticky apply button with a live count on mobile ([Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). NN/g recommends batch filtering with an Apply button on mobile ([NN/g 2016](https://www.nngroup.com/articles/applying-filters/)) and a tray overlay ([NN/g 2015](https://www.nngroup.com/articles/mobile-faceted-search/)). | Desktop (≥ 768 px): inline filter bar, 300 ms debounce. Mobile: "Filters" button opens a bottom sheet with "Show 12 vehicles". |
| Price range: two inputs (min and max); sliders are optional. | Baymard: a dual slider "works best when paired with a text input so users can type exact values" ([Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). | Two numeric inputs with a ₹ prefix and en-IN formatting on blur. Skip the slider (cost vs value). |
| Show result counts. Counts per filter option are "one of the single highest-impact improvements". | [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui), [Baymard 2026a](https://baymard.com/blog/product-listing-page-plp-ux) | Must: total count ("12 vehicles"). Could: per-category counts (see 06 API table). |
| Allow multiple values within one filter type. | 14% of sites don't ([Baymard 2025](https://baymard.com/blog/current-state-product-list-and-filtering)). | The API takes one `category`. Single-select for now; multi-select is a Could (06, Q11). |
| Don't overload with filters; prioritise 5–10. | [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui) | We have exactly 4 (make/model text, category, price). Good. |
| Plain, consistent naming. | [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui) | Use "Sedan", "SUV", "Hatchback", not the enum `HATCHBACK`. |
| "In stock" toggles are useful special-purpose filters. | [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui) | Could: client-side "Hide sold out" toggle. |

## 2. Sorting

| Guideline | Evidence | Apply here |
|-----------|----------|------------|
| Offer price sorting; it is the sort users reach for most. | Price is one of 4 essential sort types and "all sites offer it"; 64% of desktop sites don't offer all four ([Baymard 2021](https://baymard.com/research-articles/essential-sort-types)); 69% don't in the 2025 benchmark ([Baymard 2025](https://baymard.com/blog/current-state-product-list-and-filtering)). | Sort menu: Newest (default, matches API), Price: low to high, Price: high to low, Year: newest. "Best-selling" and "Rating" don't apply (no data). |
| Filters remove; sorting prioritises. | "Filtering is great at removing all the irrelevant options. Sorting is great at prioritizing…" (Christian Holst, [Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). | Sort is separate from filters and also lives in the URL (`?sort=price_asc`). |

## 3. Product cards (list items)

| Guideline | Evidence | Apply here |
|-----------|----------|------------|
| Show the same attributes on every card, each visually distinct. | 64% of sites fail at list-item information ([Baymard 2023](https://baymard.com/blog/list-item-design-ecommerce)). | Fixed order: image → make + model (title) → year · colour · category (meta row) → price → stock badge → actions. |
| Give every item a thumbnail. | "Provide thumbnails for every item" ([Baymard 2026a](https://baymard.com/blog/product-listing-page-plp-ux)). | `imageUrl` is optional, so fall back to a category illustration (Lucide icon on a tinted tile). Fixed 16:10 aspect ratio prevents layout shift ([web.dev](https://web.dev/articles/optimize-cls)). |
| Return users to the same scroll place after Back. | [Baymard 2026a](https://baymard.com/blog/product-listing-page-plp-ux) | No detail page is planned, so this mostly comes free. Sheets keep the grid mounted. |
| Use "Load more" over infinite scroll when lists grow. | [Baymard 2026a](https://baymard.com/blog/product-listing-page-plp-ux); [Baymard 2020](https://baymard.com/research-articles/number-of-items-loaded-by-default) | Not needed at kata scale. Could, later. |
| Cards group related content in one container. | [NN/g 2016](https://www.nngroup.com/articles/cards-component/) | One card per vehicle; avoid nested cards. |
| Out-of-stock: a bare "sold out" is a dead end. | Told an item is out of stock, "30% are likely to simply abandon" ([Baymard 2017](https://baymard.com/blog/handling-out-of-stock-products), older but still cited). | Keep sold-out cards visible (D3), label them "Sold out", disable Purchase, and add a helpful hint ("Check back after restock"). For admins, show a "Restock" button on the card instead. |

## 4. Empty, loading and error states

| State | Evidence | Apply here |
|-------|----------|------------|
| No results | Nearly 50% of sites fail to provide recovery paths; search tips alone rarely help ([Baymard 2025](https://baymard.com/research-articles/no-results-page)). Don't silently return zero ([Baymard 2026b](https://baymard.com/blog/ecommerce-filter-ui)). | "No vehicles match these filters." List the active filters as chips and show a primary "Clear filters" button. If a price filter is set, offer "Remove price range". |
| Empty inventory | Empty states should communicate status, teach, and give a direct path to the key task ([NN/g 2021](https://www.nngroup.com/articles/empty-state-interface-design/)). | Admin: "No vehicles yet" + "Add vehicle". User: "No vehicles in stock yet. Check back soon." |
| Loading the grid | Skeletons suit full-page loads under 10 s; spinners suit single modules; under 1 s show nothing ([NN/g 2023](https://www.nngroup.com/articles/skeleton-screens/)). | 6–8 skeleton cards on first load only. Refetches keep showing the old data (TanStack `placeholderData`) plus a subtle inline indicator. Delay showing the skeleton by about 300 ms to avoid a flash. |
| Response time | 0.1 s feels instant; 1 s keeps flow; 10 s keeps attention ([Nielsen 1993](https://www.nngroup.com/articles/response-times-3-important-limits/), still the standard). | Buttons show a pressed state at once and a spinner inside the button after about 300 ms. |
| Errors | Put messages next to the source; use human language; say how to recover; don't blame; never colour alone ([NN/g 2023](https://www.nngroup.com/articles/error-message-guidelines/)). Inline validation; don't validate before input is complete ([NN/g 2019](https://www.nngroup.com/articles/errors-forms-design-guidelines/)). | Field errors below the field after blur or submit. Page errors in an inline panel with "Try again". A toast is never the only place an error appears. |

## 5. Purchase flow (high-value action)

| Guideline | Evidence | Apply here |
|-----------|----------|------------|
| Confirm actions with serious consequences, such as "costing large amounts of money". | [NN/g 2018](https://www.nngroup.com/articles/confirmation-dialog/) | Purchase opens a sheet; nothing is bought until the user presses the confirm button. |
| Make the confirmation specific; label buttons with the outcome, not Yes/No. | [NN/g 2018](https://www.nngroup.com/articles/confirmation-dialog/); HIG alerts: avoid "OK", use verbs ([Apple HIG Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)). | Sheet shows image, "2024 Hyundai Creta · White", unit price, quantity stepper, total. Button: "Buy for ₹12,50,000". Secondary: "Cancel". |
| Don't pre-select the dangerous answer. | "Avoid giving confirmation dialogs a default Yes answer" ([NN/g 2018](https://www.nngroup.com/articles/confirmation-dialog/)). | Initial focus goes to the quantity stepper, not the Buy button. Enter does not auto-submit. |
| Prevent double submits. | No single study; follows from response-time limits ([Nielsen 1993](https://www.nngroup.com/articles/response-times-3-important-limits/)) and HIG's "always include a press state" ([Apple HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)). Server-side idempotency keys are an IETF draft ([IETF 2025](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html)). | Disable the confirm button and show "Buying…" while the mutation is pending. The backend's atomic decrement (D5) already stops overselling. An idempotency key is a Could. |
| Explain errors and offer a next step. | NN/g's out-of-stock example says to offer remedies ([NN/g 2023](https://www.nngroup.com/articles/error-message-guidelines/)). | `409`: "Only 1 left. Someone bought one just now." Clamp the quantity to the new stock and keep the sheet open. `404`: "This vehicle was removed." then close and refetch. |
| Don't optimistically update money or stock actions. | TanStack supports optimistic updates with rollback ([TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)). Reverting a "purchase" undermines trust (reasoned, not studied). | Pessimistic purchase: wait for `201`, then write the returned `vehicle` into the cache. No optimistic updates anywhere in this app: every mutation changes stock or money. |
| Confirm success briefly, nonmodally. | Toasts suit passive confirmations, not errors ([NN/g 2024](https://www.nngroup.com/articles/indicators-validations-notifications/)). | Toast: "Purchased 1 × Hyundai Creta" with a "View purchases" action. |

## 6. Admin CRUD

| Action | Evidence | Apply here |
|--------|----------|------------|
| Add / edit | Sheets are for brief, focused tasks; pair Done with Cancel; one sheet at a time ([Apple HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)). | One form in a sheet (create and edit), Cancel + Save. Edit form has no quantity field (D19) and points to Restock instead. |
| Delete | Confirm destructive, non-undoable actions; be specific; label buttons "Delete …"/"Keep …" ([NN/g 2018](https://www.nngroup.com/articles/confirmation-dialog/)). Destructive buttons use system red ([Apple HIG Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)). Type-to-confirm is for "the most dangerous and rare actions" only. | Alert dialog: title "Delete 2024 Hyundai Creta?", body "It will be removed from inventory. Past purchases stay in history.", buttons "Cancel" and red "Delete vehicle". No type-to-confirm. |
| Restock | Same sheet pattern. | Small sheet: current stock, "Add units" stepper (1–10,000), resulting stock preview "12 → 17". |
| Unsaved changes | HIG: confirm before dismissing a sheet with unsaved changes ([Apple HIG Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)). | If the form is dirty, Esc or Cancel asks "Discard changes?". Should, if time allows. |

## 7. Toasts and notifications

| Guideline | Evidence | Apply here |
|-----------|----------|------------|
| Toasts are for passive, low-stakes messages. | A toast "would be a bad way to implement an error message" ([NN/g 2024](https://www.nngroup.com/articles/indicators-validations-notifications/)). | Success only (purchased, saved, restocked, deleted). Errors are shown inline. |
| Announce status to assistive tech without moving focus. | WCAG 2.2 SC 4.1.3 Status Messages, AA ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)). | Toast region `role="status"` / `aria-live="polite"`. Verify that sonner's region announces, in a test. |
| Give people time. | sonner's default duration is 4000 ms ([sonner docs](https://sonner.emilkowal.ski/toaster)). | Use 5000 ms; pause on hover and focus; include a close button. |

## 8. Sources

- Baymard Institute: [PLP UX 2026a](https://baymard.com/blog/product-listing-page-plp-ux) · [Filter UI 2026b](https://baymard.com/blog/ecommerce-filter-ui) · [Product List UX 2025](https://baymard.com/blog/current-state-product-list-and-filtering) · [Sort types 2021](https://baymard.com/research-articles/essential-sort-types) · [No results 2025](https://baymard.com/research-articles/no-results-page) · [List item info 2023](https://baymard.com/blog/list-item-design-ecommerce) · [Items loaded 2020](https://baymard.com/research-articles/number-of-items-loaded-by-default) · [Out of stock 2017](https://baymard.com/blog/handling-out-of-stock-products)
- Nielsen Norman Group: [Applying filters 2016](https://www.nngroup.com/articles/applying-filters/) · [Mobile facets tray 2015](https://www.nngroup.com/articles/mobile-faceted-search/) · [Filters vs facets 2014](https://www.nngroup.com/articles/filters-vs-facets/) · [Skeleton screens 2023](https://www.nngroup.com/articles/skeleton-screens/) · [Confirmation dialogs 2018](https://www.nngroup.com/articles/confirmation-dialog/) · [Error messages 2023](https://www.nngroup.com/articles/error-message-guidelines/) · [Form errors 2019](https://www.nngroup.com/articles/errors-forms-design-guidelines/) · [Indicators/notifications 2024](https://www.nngroup.com/articles/indicators-validations-notifications/) · [Empty states 2021](https://www.nngroup.com/articles/empty-state-interface-design/) · [Cards 2016](https://www.nngroup.com/articles/cards-component/) · [Response times 1993](https://www.nngroup.com/articles/response-times-3-important-limits/)
- Apple HIG (accessed Oct 2026): [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) · [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) · [Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)
- Other: [web.dev Optimize CLS](https://web.dev/articles/optimize-cls) · [TanStack Query optimistic updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) · [sonner Toaster API](https://sonner.emilkowal.ski/toaster) · [IETF Idempotency-Key draft-07, 2025](https://www.ietf.org/archive/id/draft-ietf-httpapi-idempotency-key-header-07.html) · [W3C SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
