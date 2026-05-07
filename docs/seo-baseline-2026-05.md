# SEO Baseline — Rebuilt May 2026

> **Author:** SEO + Claude (Opus 4.7)
> **Date:** 2026-05-08
> **Status:** Draft for tech-lead review
> **Replaces:** the Q1 2026 baseline (which was pulled from the wrong GA4 property)
> **Related:** `docs/analytics-rebuild-spec.md`

---

## 1. Why this document exists

The Q1 2026 SEO baseline was pulled from the Firebase-auto-created GA4 property (`lets-try-app-22e0a`) rather than the canonical web property. Total session/user numbers were therefore inflated ~3×, and several conclusions need re-verification.

This baseline is rebuilt from the correct property: **Measurement ID `G-9EQ61GXMN3`** in account "lets Try Next". Note that the property is misleadingly named `next-demo-property` despite being the production website property — confirmed via Measurement ID check on 2026-05-07.

The data window for this baseline is **last 90 days: Feb 7 – May 7, 2026**. Anything earlier is unreliable: GTM only began firing properly on this property in early February 2026, so months prior to that are essentially empty.

---

## 2. Real numbers (90 days)

| Metric | Value |
|---|---|
| Sessions | 30,903 |
| Active users | 22,986 |
| New users | 22,855 (**99.4%** of active) |
| Total events | 165,979 |
| Engagement rate | 90.64% |
| Avg engagement time per session | 47s |
| Total revenue (GA4) | **₹0.00** (purchase event has never fired) |
| Sessions with ≥1 key event | 0.38% |

The ₹0 revenue is not an error. The `purchase` event has never successfully fired on this property — every web order placed since launch is invisible to GA4. The event is configured as a key event ("No stream data detected") but no integration writes to it. Real revenue lives only in the backend Mongo orders collection.

---

## 3. Channel mix

| Channel | Sessions | % | Avg engagement |
|---|---|---|---|
| **Organic Search** | 21,438 | **77.05%** | 51s |
| Direct | 5,148 | 18.5% | 31s |
| Organic Social | 536 | 1.93% | 19s |
| Unassigned | 502 | 1.8% | 43s |
| Referral | 282 | 1.01% | **1m 57s** |
| Organic Shopping | 12 | 0.04% | 4m 40s |
| Paid / Email / Affiliate | **0** | — | — |

The site has effectively **one traffic source** (Google organic). Direct is overwhelmingly dark-social — WhatsApp shares, app referrals, untagged links — and carries no campaign attribution. Organic Social is negligible despite an Instagram presence (likely because Instagram links aren't UTM-tagged, so they collapse into Direct). Organic Shopping (Merchant Center feed) is effectively dead at 12 sessions in 90 days.

---

## 4. Branded vs non-brand search

GSC ↔ GA4 link is active on this property, so query/landing joins are now valid.

**Top 25 organic queries by clicks (90 days):**
- Every single query in the top 25 is a brand variant: `lets try`, `let's try`, `letstry`, `letstryfoods`, plus parent-company queries (`earth crust pvt ltd`, `earth crust private limited`).
- Top 25 alone account for **14,663 of 17,184 clicks (85%)**.
- Including the long-tail "lets try [category/product]" variants, branded share is **~95%+**.
- Notable branded subclusters: `lets try snacks` (2,193 clicks combined), `lets try namkeen` (746), `lets try chips` (365), `lets try foods` (395), `lets try shark tank` (225 — Shark Tank India recognition driver), `lets try sattu` (113 — only product-modifier brand query in top 25).
- Earth Crust (parent company) drives 224 clicks combined — meaningful brand recognition for the corporate identity.

**The Q1 baseline's claim of 95% branded dominance was correct.** The data was wrong; the conclusion was right.

---

## 5. Landing page distribution

90-day organic clicks by landing page (top of the long tail; full table has 404 rows):

| Landing | Sessions | Organic clicks | Organic impressions | CTR | Avg pos | Notes |
|---|---|---|---|---|---|---|
| `/` | 20,963 | 17,804 | 148,147 | 12.02% | 7.06 | 67–80% of all entries |
| `/about-us` | 539 | 514 | **34,377** | **1.5%** | 2.11 | **Largest CTR opportunity on site** |
| `/healthy-snacks` | 388 | 349 | **30,012** | **1.16%** | 1.95 | "No palm oil" cluster anchor |
| `/bhujia` | 308 | 234 | 1,872 | 12.5% | 3.43 | Healthy CTR |
| `/product/roasted-chana` | 260 | 228 | 10,978 | 2.08% | 7.46 | Rank-improvement play (page 2) |
| `/product/sattu` | 254 | 223 | 3,343 | **6.67%** | 4.68 | **Conversion outlier — 1.97% session key-event rate** |
| `/cookies` | 335 | 195 | 4,299 | 4.54% | 2.36 | OK |
| `/fasting-special` | 195 | 150 | **19,424** | **0.77%** | 1.69 | Massive impression base, almost no clicks |
| `/product/lets-try-pack-of-6-assorted` | 142 | 145 | **20,091** | **0.72%** | 1.88 | High-intent product, weak snippet |
| `/about` | — | 132 | 8,807 | 1.5% | 2.14 | Duplicate of /about-us — see §8 |
| `/product/kettle-cooked-pudina-potato-wafers` | 126 | 98 | 12,215 | **0.8%** | 2.01 | High-volume CTR target |
| `/bulk-corporate` | — | 61 | **11,460** | **0.53%** | 1.51 | Hidden B2B funnel — pos 1.51 with awful CTR |
| `/address` | 614 | — | — | — | — | **#3 landing page, but post-purchase traffic (FSSAI batch lookup)** |

### CTR sleeping giants (the meta-rewrite playbook)

These pages are ranking page-1 (positions 1.5–2.1) but their snippets convert impressions to clicks at sub-2% rates:

1. `/about-us` — 34,377 impressions at 1.5% CTR. Largest single CTR opportunity. Likely catching brand-research intent ("letstryfoods company", "lets try brand", "earth crust pvt ltd").
2. `/healthy-snacks` — 30,012 impressions at 1.16% CTR. The "no palm oil" cluster anchor — confirms that cluster is the biggest non-brand opportunity, just as the Q1 baseline argued.
3. `/fasting-special` — 19,424 impressions at 0.77% CTR.
4. `/product/lets-try-pack-of-6-assorted` — 20,091 impressions at 0.72% CTR.
5. `/product/kettle-cooked-pudina-potato-wafers` — 12,215 impressions at 0.8% CTR.
6. `/bulk-corporate` — 11,460 impressions at 0.53% CTR. B2B/corporate-gifting query intent that's currently leaking.

Doubling CTR on just these six pages is a ~+1,300 organic-click/quarter gain at zero ranking cost.

### Conversion outlier

`/product/sattu` deserves a separate look: 6.67% CTR (vs ~2% site average for product pages) and 1.97% session key-event rate (vs 0.38% site average — 5×). Whatever pattern this page hits — copy, pricing, page structure, or audience-fit — is worth diagnosing and replicating across other product pages.

---

## 6. Funnel

90 days, by users:

```
22,986 users
   ├─ 6,446 viewed a product (28%)
   ├─ 1,565 added to cart (6.8%)
   ├─ 259 began checkout (1.13%)
   └─ 0 purchased (event broken)
```

**The single worst step is cart → checkout: only 259 of 1,565 carts (16.5%) ever click "Proceed".** That's 83% cart abandonment *before* the checkout screen even loads. This is a UX/CRO problem at the cart drawer, independent of any analytics work, and it's currently the highest-leverage product-side fix on the site.

We cannot measure checkout → purchase conversion at all because the `purchase` event is broken.

---

## 7. Retention — partly an artifact

99.4% of 90-day users register as "new" (`first_visit`). Two effects combine:

1. **Genuine low repeat-web-visit rate.** Customers reorder via WhatsApp links and the mobile app pathway, not by returning to the website with their original cookie intact.
2. **Returning-customer traffic is misclassified as new.** The `/address` page (manufacturing units / FSSAI batch code lookup) is the **#3 landing page** with 614 sessions in 90 days. These are existing customers reading their packaging and looking up batch codes — explicitly post-purchase activity. They show up as "new users" because their original session cookie has expired by the time they revisit, often weeks or months later.

So the brand has *real* repeat customers, just nearly none of them re-enter through a continuous web session. Phase 5 of the analytics rebuild (stable `user_id`, hashed phone) will partially fix the visibility problem by stitching repeat visits to the same backend user record.

---

## 8. Duplicate URL pollution — still active

Sprint 1a's `/category/X → /X` redirect work was supposed to consolidate authority. Google's index still shows the old URLs *and* they are still receiving meaningful clicks:

| Clean URL (clicks) | Duplicate still indexed (clicks) |
|---|---|
| `/healthy-snacks` (349) | `/category/Healthy%20Snacks` (85) |
| `/bhujia` (234) | `/category/Bhujia` (55) |
| `/cookies` (195) | `/category/Cookies` (48) |
| — | `/category/Purani%20Delhi` (48) |
| `/about-us` (514) | `/about` (132) |
| `/product/lets-try-purani-delhi-papdi` (46) | `/product/let-s-try-purani-delhi-papdi` (45) ← typo duplicate |

Each duplicate is splitting Google's authority signal between two URLs. Likely cause: the redirect is a 302 (temporary) instead of 301 (permanent), and/or it doesn't match `%20`-encoded variants. Worth a 5-minute `curl -I` audit to confirm. Tracked as Phase 7 in the analytics-rebuild spec.

---

## 9. Configured key events

GA4 key events on this property:

| Event | Status |
|---|---|
| `add_to_cart` | Active — drives ~all of the 314 "key events" reported on landing pages |
| `generate_lead` | Configured, but only fires when GA4's auto `form_submit` detects a form submission. Because every login form on the site uses `e.preventDefault()` and submits via JS, auto-detection misses ~all real submits. Total lifetime volume: **3 events in 13 months.** Effectively dead. |
| `purchase` | Configured, marked "No stream data detected." Zero data ever — confirmed bug. |

**The 0.38% session key-event rate that GA4 currently reports = 0.38% of sessions added something to cart.** It is not a sales conversion rate. Anyone treating this number as "site converts at 0.38%" has been misled.

`form_start` (1,358 events in 13 months) and `form_submit` (3 events) are GA4 Enhanced Measurement auto-events. They fire when a user focuses a field and when the browser detects a native form submit, respectively. With JS-handled forms that `preventDefault`, the submit event almost never fires. **Login completion is currently a 100% blind spot** — we have no idea what fraction of OTP attempts succeed. Phase 5 of the rebuild plan addresses this directly with explicit `login`/`sign_up` dataLayer events.

---

## 10. What changed vs the Q1 baseline

### Confirmed correct
- 95%+ branded-search dominance
- Homepage dominance (~80% of organic clicks)
- "CTR opportunity, not rankings opportunity"
- "no palm oil / no maida" cluster as biggest non-brand opportunity (`/healthy-snacks` is the #2 highest-impression landing at 30K)
- Duplicate URL splitting authority (still unresolved)
- `purchase` event broken

### Corrected
- Total session/user volume was ~3× too high in the Q1 baseline (wrong-property error)
- True organic share is 77%, not 68%
- `/search` noindex listed as urgent — actually shipped in Sprint 1b; the lingering 155 sessions are Google-deindex-lag, not a code bug. Recommend submitting GSC URL Removal request to accelerate.

### Newly identified
- `/about-us` is the largest CTR optimisation target (34K imp, 1.5% CTR) — not surfaced in the Q1 baseline at all
- `/bulk-corporate` is a hidden B2B funnel (11K imp, 0.53% CTR) at pos 1.51
- `/product/sattu` is the conversion outlier worth diagnosing and replicating
- Earth Crust (parent company) drives 224 clicks — should be claimed as a brand alias in entity SEO
- `/address` (FSSAI manufacturing units page) is the #3 landing — post-purchase customer traffic, not new-visitor traffic. Partly explains the "no retention" illusion.
- The cart → checkout step (16.5%) is the worst single funnel leak. Independent of analytics.
- Login completion is a 100% blind spot until Phase 5 ships explicit `login`/`sign_up` events.
- The Sprint 1a duplicate-URL fix didn't fully land — `/category/X` and `%20`-encoded variants are still indexed and clicked.

---

## 11. Strategic implications

1. **Branded-SEO dependency is structural, not optional.** 95%+ of clicks come from people who already know the brand. Non-brand SEO will only ever be a small addition unless something material changes (press, virality, paid acquisition, content scaling).

2. **The fastest non-brand wins are CTR rewrites on six specific pages**, not new content. `/about-us`, `/healthy-snacks`, `/fasting-special`, `/product/lets-try-pack-of-6-assorted`, `/product/kettle-cooked-pudina-potato-wafers`, `/bulk-corporate`. Together they have ~107K impressions/quarter at <2% CTR. Even reaching 4% CTR is +2,000 clicks/quarter.

3. **The cart → checkout drop (83%) is the single biggest revenue lever** and is not an analytics problem — it's a UX problem in the cart drawer. Worth a separate diagnostic sprint regardless of analytics-rebuild progress.

4. **Repeat-customer visibility requires Phase 5 (`user_id` stitching).** Until then, every metric involving "returning users" is unreliable.

5. **The B2B/corporate-gifting traffic to `/bulk-corporate` is currently invisible in any conversion sense** because no event captures B2B intent. Worth understanding whether that page should have a separate conversion path (form submit, WhatsApp click, phone call) and tracking it.

---

## 12. Next steps

Tracked in `docs/analytics-rebuild-spec.md`. Headlines:

- **Phase 0 (config-only, 1 day):** internal traffic filter, GA4 default date-range, GSC URL Removal for `/search?*`, mark `purchase` as primary key event, document property naming.
- **Phase 1 (critical):** ship the missing client-side `purchase` event.
- **Phase 5 (critical):** explicit `login`/`sign_up` events + hashed user_data for future Enhanced Conversions + `user_id` stitching for retention visibility.
- **Phase 7 (new — separate from analytics):** verify and re-fix `/category/X → /X` 301 redirects + `%20`-encoded variants + `/about` vs `/about-us` + `lets-try` typo duplicate.

Outside of this spec but flagged for parallel work:

- **Mongo revenue baseline.** GA4 cannot tell us actual revenue. Need a tech-lead-run aggregation against the `orders` collection — total revenue, cancellations/refunds, top SKUs by units and revenue, new vs repeat customer revenue split. Spec to be drafted.
- **Cart-drawer UX diagnostic.** The 83% cart-to-checkout abandonment warrants a separate UX investigation. Independent of analytics.
- **CTR meta rewrites on the six sleeping-giant pages.** Content team work, not engineering. Hand-written meta titles and descriptions — highest-leverage non-brand SEO work available.
