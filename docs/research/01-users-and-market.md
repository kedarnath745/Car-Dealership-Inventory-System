# 01 · Users and market

Who uses a dealership inventory system, what they are trying to get done, and what the
evidence says about car buyers in general and in India. Every figure is quoted as the
source states it, with the year. Sources are listed at the end.

> **Scope note.** In this kata a shopper "purchases" a car with one click. Real car
> purchases are rarely completed fully online (see F2 below), so the UI should treat
> Purchase as a deliberate, high-value action with an explicit confirmation step.

## 1. Key findings

| # | Finding | Source |
|---|---------|--------|
| F1 | 71% of US buyers started "with an open mind, unsure of what vehicle they would buy"; only 29% were certain of a vehicle (down from 37% in 2020). Browsing and filtering matter more than direct lookup. | [Cox Automotive 2026](https://www.coxautoinc.com/insights-hub/cox-automotive-car-buyer-journey-study-finds-efficiency-digital-tools-and-ai-drive-record-satisfaction/) (2025 study, n = 2,300) |
| F2 | 53% completed all steps at the dealership and only 7% bought completely online; 63% said an omnichannel approach would be ideal vs 28% "all online". | Cox Automotive 2026 |
| F3 | "Mostly digital buyers" (more than 50% of the process online) were the most satisfied buyers. Buyers want "efficiency, transparency and tools that actually help them". | Cox Automotive 2026 |
| F4 | 62% of buyers felt leasing or owning a car is too costly; 66% considered both new and used vehicles (up from 57%). Price is the dominant filter. | Cox Automotive 2026 |
| F5 | India: 93% of surveyed buyers used AI surfaces during active research; 87% used one or more Google platforms; buyers averaged 6.9 touchpoints (7.8 for AI users). Queries combine "vehicle type, price, location, driving conditions and mileage". | [Google–Kantar via Autocar Professional 2026](https://www.autocarpro.in/news/google-kantar-study-93-percent-of-car-buyers-use-ai-in-research-134885) (n = 1,022, metros and Tier 1, fieldwork May 2026) |
| F6 | India: the joint-top vehicle differentiators were "high safety ratings or advanced features" and "superior styling or modern features" at 41% each. Partners or spouses influenced the final decision for 53% of buyers; other family members for 64%. | Google–Kantar 2026 |
| F7 | India: 62% rank product quality, including safety, as their top priority; 72% are open to switching brands; 76% prefer buying directly from manufacturers. | [Deloitte India 2025](https://www.deloitte.com/in/en/about/press-room/consumers-weigh-ev-benefits-against-practical-challenges.html) (n = 1,000, fieldwork Oct–Dec 2024) |
| F8 | India: interest in hybrids is 21% and in battery EVs 8%; 36% prioritise fast charging. Supports keeping `ELECTRIC` as a visible category. | Deloitte India 2025 |
| F9 | India used cars (Spinny, one platform, company-reported): 76% of customers were first-time buyers; 75% of purchases were made digitally (up from 70%); 74% of deliveries were hub-based, "highlighting the importance of physical car inspections"; 56% used financing. | [Spinny 2024 report via Autocar Professional 2025](https://autocarpro.in/news/spinnys-2024-report-highlights-trends-first-time-buyers-compact-suvs-and-growing-shift-to-online-car-purchases-124272) |
| F10 | India: mobile accounted for 64.31%–82.35% of web page views each month from Sep 2025 to Sep 2026 (66.04% in Jul 2026). Design mobile-first. | [StatCounter 2026](https://gs.statcounter.com/platform-market-share/desktop-mobile-tablet/india) (monthly CSV) |
| F11 | Dealers (US): 67% named aging inventory their top day-to-day challenge; 66% margin erosion and markdown pressure; only 9% can identify a struggling vehicle within 15 days; nearly 87% report "platform fatigue" from disconnected systems. | [Lotlinx 2026](https://lotlinx.com/2026-inventory-health-survey/) (vendor survey sent to 2,000+ dealers, June 2026; treat as directional) |
| F12 | Dealers (India): passenger-vehicle inventory was 33–35 days at end of July 2026, "well above FADA's recommended 21-day benchmark"; about a quarter of PV dealers were "carrying over 25% aged stock". | [FADA 2026](https://www.fada.in/images/press-release/16a7445b80cd73FADA%20Releases%20July%202026%20Vehicle%20Retail%20Data.pdf) (press release, 6 Aug 2026) |

## 2. Personas

Personas are evidence-informed archetypes, not real people. Device and context lines
marked *(assumption)* are not backed by a cited source.

### P1 · Dealership Admin / Inventory Manager: "Ritu"

| | |
|---|---|
| Role | Runs stock for one showroom. Uses the seeded `ADMIN` account. |
| Goals | Know at a glance what is in stock, low, or sold out. Add new arrivals quickly. Fix a wrong price without touching stock. Restock after a delivery. Remove a discontinued model without losing sales history. |
| Pains (evidence) | Spots slow-moving or aging stock too late (F11, F12). Juggles disconnected tools (F11). Fears an accidental delete or a stock mistake. |
| Context | Desktop or laptop at the dealership, sometimes a tablet on the floor *(assumption)*. Repeats the same actions many times a day, so speed matters more than delight. |
| What the app must do | Dense, scannable grid with stock state in text plus colour; edit and restock reachable from each card; specific delete confirmation; clear success feedback; never let price edits change stock (D19). |

### P2 · Car Shopper / Buyer: "Arjun"

| | |
|---|---|
| Role | Registered `USER`, often a first-time buyer (F9), comparing options with family (F6). |
| Goals | Find cars within a budget, narrow by type (SUV, hatchback, EV), see the exact price and availability, buy without surprises, and see what was bought. |
| Pains (evidence) | Unsure what to buy at the start (F1); affordability pressure (F4); needs trust and transparency (F3, F7); researches across many touchpoints (F5). |
| Context | Mostly on a phone (F10), often in short sessions. Reads prices in Indian digit grouping (D17). |
| What the app must do | Budget-first filters (min/max ₹), category filter, result count, clear "Sold out" state, explicit purchase confirmation showing quantity and total, and a "My purchases" record. |

### P3 · Kata reviewer (secondary)

| | |
|---|---|
| Role | Interviewer assessing the submission. |
| Goals | Run it locally, exercise every brief requirement in a few minutes, read tests and README. |
| Context | Desktop browser, probably light mode, with limited time *(assumption)*. |
| What the app must do | Make every brief feature discoverable without instructions: visible admin tools for the admin account, a disabled Purchase at zero stock, working search, and clear empty and error states. |

## 3. Jobs to be done

| Persona | When… | I want to… | So I can… |
|---------|-------|------------|-----------|
| Shopper | I have a budget but no fixed model | filter by price range and category, sorted by price | see only cars I can afford (F1, F4) |
| Shopper | I am looking at a shortlist | compare make, model, year, colour and price consistently on each card | decide without opening each item ([Baymard 2023](https://baymard.com/blog/list-item-design-ecommerce)) |
| Shopper | I decide to buy | confirm quantity and total before committing | avoid a costly mistake |
| Shopper | I come back later | see what I bought, when, and at what price | keep a record (D6) |
| Admin | a delivery arrives | restock a model in a few clicks | keep stock accurate |
| Admin | a new model arrives | add it with price, year, colour and photo | make it sellable right away |
| Admin | I open the dashboard | see what is low or sold out | act before it becomes a problem (F11) |
| Admin | a model is discontinued | delete it while purchase history stays | keep sales records intact (D7) |

## 4. India specifics for this app

| Topic | Evidence | Implication |
|-------|----------|-------------|
| Currency format | `Intl.NumberFormat("en-IN")` formats 123456.789 as `1,23,456.789` ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)). | Use `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` for display (D17). |
| Price shorthand | Major Indian portals show prices as "Rs. 7.79 Lakh" with an "Ex-Showroom" or "On-Road" label ([CarWale](https://www.carwale.com/new-cars/), [CarDekho](https://www.cardekho.com/newcars), observed Oct 2026). | Keep the exact figure as the primary price; a "≈ 12.5 lakh" hint is optional (see 06, open question Q5). |
| Trust signals | Used-car listings lead with kms driven, owner count, inspection, warranty and money-back ([Spinny listing page](https://www.spinny.com/used-cars-in-bangalore/s/), observed Oct 2026); safety and quality rank first (F6, F7). | Our data model has none of these fields. Do not invent them. Show what we have (year, colour, category, exact price, live stock) clearly, and say so in the README. |
| Mobile share | F10 | Mobile-first layouts, bottom-sheet filters and purchase, 44 px targets. |
| Family decisions | F6 | The purchase confirmation should be easy to understand at a glance (screenshots get shared). |
| EV interest | F8 | Keep `ELECTRIC` as a first-class category in the filter. |

## 5. Limitations of this evidence

- The richest buyer-journey data (Cox) is from the **US**. The India studies are smaller, and the Google–Kantar figures come via press coverage, not the full report.
- The Spinny, Lotlinx and FADA figures are **company or industry-body releases**, not peer-reviewed.
- No source studies **dealership staff using inventory web apps** directly; P1's device context is an assumption.
- No primary research (interviews or usability tests) was done for this project.
