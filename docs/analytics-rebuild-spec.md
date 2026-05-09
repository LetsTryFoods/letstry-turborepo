# Analytics Rebuild — Implementation Spec

> **Branch:** `seo/baseline-rebuild-may-2026` (originally `seo/analytics-rebuild-plan`)
> **Author:** SEO + Claude (Opus 4.7)
> **Date:** 2026-05-04 (original) · 2026-05-08 (updated post-baseline-rebuild)
> **Status:** Draft for tech-lead review
> **Audience:** Tech lead (technical sections), SEO owner (overview + verification sections)
> **Companion doc:** `docs/seo-baseline-2026-05.md` — rebuilt baseline that motivates the priority shift below

---

## 0. Update — May 2026 priority shift

After rebuilding the baseline from the correct GA4 property (see companion doc), several priorities have shifted and two new phases have been added. Original phase content (Sections 5–10) is unchanged; this section summarises what's different.

### Phase priority — revised

| Phase | Original priority | Updated priority | Reason for change |
|---|---|---|---|
| 1 — Purchase event (client) | High | **Critical** | Confirmed zero `purchase` data ever; key event configured but starved |
| 2 — List/discovery events | High | **High** | Needed to measure category-page work and `/about-us` CTR optimisation |
| 3 — Checkout step events | Medium | Medium | The 1,565 → 259 cart drop (83% abandonment) needs visibility |
| 4 — Search + promo | Medium | Low (but cheap) | Site search is 0.5% of traffic; tracking confirms whether to invest in it |
| 5 — Auth identity + first-party | High | **Critical** | `form_start` (1,358) vs `form_submit` (3) is meaningless — login completion is a 100% blind spot |
| 6 — Server-side purchase | Medium | High | India ad-blocker / tab-close rates make client-only unreliable |

### New phases added

- **Phase 0 (config-only, ~1 day, no code):** internal traffic filter, GA4 default date-range, GSC URL Removal request for `/search?*`, verify `purchase` is marked primary key event, `GA_HOME_VIEW` legacy event cleanup, document the misleading property name. See Section 4.5.
- **Phase 7 (separate from analytics, SEO hygiene):** verify and re-fix `/category/X → /X` 301 redirects, handle `%20`-encoded variants, resolve `/about` vs `/about-us` and the `lets-try` vs `let-s-try` typo duplicates. See Section 10.5.

### Open questions resolved by the baseline rebuild

- **Q:** Was the Q1 "95% branded traffic" figure real? **A:** Yes. Top 25 queries on this property are 100% branded, accounting for 85% of all clicks. Long-tail brand variants take it to ~95%+.
- **Q:** Is `/search` noindex shipped? **A:** Yes — confirmed at `apps/frontend/src/app/search/layout.tsx:5–8`. The 155 lingering sessions are Google-deindex-lag. Submit URL Removal in GSC.
- **Q:** Why is `/address` the #3 landing page? **A:** It's a regulatory FSSAI manufacturing-units page customers look up via batch codes printed on packaging. Post-purchase traffic, not a bug. Don't touch.
- **Q:** Is `form_start: 1,358 / form_submit: 3` a UX disaster? **A:** No — tracking artifact. GA4's auto-`form_submit` doesn't fire on JS forms with `preventDefault`. We have zero real login data. Phase 5 fixes this.

---

## 1. Overview

### 1.1 Why this exists

A diagnostic on 2026-05-04 surfaced two material problems with the website's analytics:

1. **The website's `purchase` event has never fired.** Every order placed on letstryfoods.com has been invisible in GA4 since launch. Three orders placed on 2026-05-03 highlighted the issue.
2. **The SEO owner has been looking at the wrong GA4 property.** A Firebase-auto-created GA4 property (`lets-try-app-22e0a`) was being treated as the source of truth, while the actual website data lives in a different property (`G-9EQ61GXMN3`) under a separate Google account ("lets Try Next").

In the course of investigating, we also uncovered that several standard GA4 ecommerce events are missing entirely (no `view_item_list`, `select_item`, `view_cart`, `add_shipping_info`, `add_payment_info`, `search`), no first-party data is being pushed (blocking future Google Ads "Enhanced Conversions"), and Firebase Analytics is firing duplicate login/logout events from the web frontend into the wrong property.

This spec scopes a comprehensive rebuild of the analytics stack, shipped in six phased PRs.

### 1.2 Goals

- All standard GA4 ecommerce funnel events firing correctly to the canonical GA4 property
- Server-side purchase tracking as a durability layer (immune to ad-blockers and tab-close losses)
- First-party data (hashed phone, user_id) attached to conversion events so Google Ads "Enhanced Conversions" activates with historical data when Ads is later enabled
- Site search and promotion-banner tracking for SEO and merchandising insight
- Single clean tracking pipeline (GTM → web property), no duplicate Firebase Analytics on web

### 1.3 Non-goals (out of scope)

See [Section 13](#13-out-of-scope-explicit) for the full list. Briefly: no Meta Pixel, no TikTok, no full server-side GTM, no BigQuery export, no cross-domain tracking work.

---

## 2. Decisions locked

| # | Decision | Choice |
|---|---|---|
| Q1 | GA4 property strategy | **Keep both properties separate.** Mobile (when added) → Firebase-auto. Web → `lets Try Next` (`G-9EQ61GXMN3`) |
| Q2 | Event coverage scope | **All three tiers** — full ecom funnel + first-party data/auth + search/promo |
| Q3 | Server-side purchase tracking | **Yes**, included in scope (Phase 6) |
| Q4 | Firebase Analytics web cleanup | **Included in this rebuild** (Phase 5) |
| Q5 | Phasing approach | **Many small PRs (6 phases)** with verification gates |
| Q6 | Phase order | **1 → 2 → 3 → 4 → 5 → 6** (risk-ascending, value-first) |
| Q7 | GTM-side change ownership | **SEO owner does Phases 1–4. Tech lead does Phase 5** (PII hashing) |
| Q8 | Spec location | **Markdown in repo, GitHub PR review** |
| Q9 | Defaults | Microsoft Clarity untouched · Conversion Linker added in Phase 5 · `ecommerce: null` reset added in Phase 1 · Past SEO baseline flagged as follow-up |

---

## 3. Current state baseline (2026-05-04)

### 3.1 GA4 properties

**`lets-try-app-22e0a`** (Property ID 487992388, in account "Default Account for Firebase")
- Auto-created by Firebase project setup
- Currently receives only Firebase Analytics login/logout events from the web frontend
- The `letstry-mobile` app does not yet integrate Firebase Analytics; `let-stry-app` is an empty placeholder folder
- After Phase 5 ships: this property goes effectively empty until/unless mobile apps add Firebase Analytics in future

**Property in account "lets Try Next"** with Measurement ID **`G-9EQ61GXMN3`**
- Canonical website property
- Currently receives: `page_view`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`
- Does not currently receive: `purchase` (the bug), `view_item_list`, `select_item`, `view_cart`, `add_shipping_info`, `add_payment_info`, `search`, `login`, `sign_up`, `view_promotion`, `select_promotion`
- This is the property the SEO owner should be using for all website analysis going forward

### 3.2 GTM container

| Tag | Type | Trigger | Purpose |
|---|---|---|---|
| Google Tag G-9EQ61GXMN3 | Google Tag | Initialization - All Pages | Base GA4 config |
| GA4 Event page view | GA4 Event | Page View | Manual page_view forwarding |
| GA4 Event - E-commerce Events | GA4 Event | E-commerce Events (custom) | Forwards ecommerce events |
| Microsoft Clarity - Official | Microsoft Clarity | All Pages | Heatmap/session replay |

Container last meaningfully edited ~Jan 2026. No active GTM owner before SEO owner gained access on 2026-05-04. **No Conversion Linker tag yet** — needs to be added in Phase 5 for future Enhanced Conversions support.

### 3.3 Code-side current state

**Working dataLayer pushes (already wired in `apps/frontend/src/hooks/use-analytics.ts` and called from components):**

| Event | Where it fires |
|---|---|
| `page_view` | `apps/frontend/src/components/analytics/page-view-tracker.tsx` (every route change) |
| `view_item` | `apps/frontend/src/components/product-page/ProductDetails.tsx` |
| `add_to_cart` | PDP `ActionButtons.tsx`, category `ProductCard.tsx`, `bestseller-card.tsx`, cart drawer `CartContainer.tsx` |
| `remove_from_cart` | `apps/frontend/src/components/cart-drawer/CartContainer.tsx` |
| `begin_checkout` | `apps/frontend/src/components/cart-drawer/CartContainer.tsx` (Proceed button) |

**Defined-but-never-called dead code in `use-analytics.ts`:** `trackViewItemList`, `trackSelectItem`, `setUser`. These will be repurposed/replaced through this rebuild.

**Parallel tracking pipeline to remove (Phase 5):** `apps/frontend/src/lib/firebase/auth-service.ts` calls `logEvent(analytics, 'login', ...)` and `logEvent(analytics, 'logout', ...)` — these go to the wrong (Firebase-auto) GA4 property.

---

## 4. Target end state

After Phase 6 ships, the analytics stack looks like this.

### 4.1 Event coverage matrix

| Event | Source | Phase added | Notes |
|---|---|---|---|
| `page_view` | client (existing) | — | Already firing |
| `view_item_list` | client | Phase 2 | Category, search results, no-palm-oil-snacks landing, bestseller carousel |
| `select_item` | client | Phase 2 | Product card click |
| `view_item` | client (existing) | — | Already firing |
| `add_to_cart` | client (existing) | — | Already firing |
| `view_cart` | client | Phase 2 | Cart drawer open |
| `remove_from_cart` | client (existing) | — | Already firing |
| `begin_checkout` | client (existing) | — | Already firing |
| `add_shipping_info` | client | Phase 3 | Address confirmation in cart drawer |
| `add_payment_info` | client | Phase 3 | Payment method selection |
| `purchase` (client) | client | Phase 1 | Order success page |
| `purchase` (server) | server | Phase 6 | Backend order-creation handler — dedupes with client by `transaction_id` |
| `search` | client | Phase 4 | Search bar submit |
| `view_promotion` | client | Phase 4 | Banner viewport entry |
| `select_promotion` | client | Phase 4 | Banner click |
| `login` | client | Phase 5 | Successful phone auth callback |
| `sign_up` | client | Phase 5 | First-time auth — requires backend `isNewUser` flag |

### 4.2 First-party data flow (after Phase 5)

When a user is authenticated, every `purchase`, `login`, and `sign_up` event carries:

```js
{
  event: 'purchase',  // or login, sign_up
  user_id: '<stable user id from backend>',
  user_data: {
    sha256_phone_number: '<sha256(E.164-normalized phone)>'
    // sha256_email_address: when email is collected later
  },
  ecommerce: { /* purchase only */ }
}
```

A separate session-scoped `user_data` push (no event name, just user properties) fires once per session for logged-in users so GA4 user-property-based segments work for non-conversion sessions too.

### 4.3 Server-side purchase reliability

Phase 6 adds a Measurement Protocol call from the backend's order-creation handler. Both client and server fire a `purchase` event with the same `transaction_id`. GA4 dedupes on `transaction_id`, so the count is correct. If the client-side fails (ad-blocker, abandoned tab), the server-side still records it.

### 4.4 Property strategy

- **Web property (`G-9EQ61GXMN3`)** — receives every event in the matrix above. Sole canonical source for website analysis.
- **Firebase-auto property (`lets-try-app-22e0a`)** — receives nothing from web after Phase 5. Reserved for future mobile-app analytics integration.

---

## 4.5 Phase 0 — GA4 / GTM config cleanup (no code)

### 4.5.1 Goal

Cheap, high-value config hygiene that does not need a code deploy. Should ship before Phase 1 begins so that Phase 1 verification happens against a clean property.

### 4.5.2 Tasks (all done in GA4 / GTM / GSC UIs)

| # | Task | Where | Owner | Effort |
|---|---|---|---|---|
| 1 | Add internal traffic filter (team IPs / dev devices) | GA4 → Admin → Data Streams → Web → Configure tag settings → Define internal traffic | Tech lead | 10 min |
| 2 | Set GA4 default date range to "Last 90 days" | GA4 → top-right date picker → set as default | SEO owner | 1 min |
| 3 | Submit GSC URL Removal request for `/search?*` | Search Console → Indexing → Removals → New request → URLs containing `/search?` | SEO owner | 5 min |
| 4 | Verify `purchase` is starred as a key event | GA4 → Admin → Events → Key events tab | SEO owner | 1 min |
| 5 | Disable / delete the `GA_HOME_VIEW` legacy event in GTM (5 users / 42 events — looks like dev-test pollution) | GTM → find tag firing `GA_HOME_VIEW` → pause or delete | Tech lead | 5 min |
| 6 | Star the `next-demo-property` property as default in GA4 | GA4 → property switcher → star icon | SEO owner | 1 min |
| 7 | Investigate which form `form_start` is firing on most often (likely OTP modal) and document for Phase 5 | GA4 → Events → `form_start` → check `form_id` parameter | SEO owner | 5 min |

### 4.5.3 Verification

- Internal traffic filter: GA4 → DebugView while connected from a known internal IP — events should be marked `internal traffic`.
- URL Removal: GSC shows the request as "Pending" or "Approved" within 24 hours.
- `GA_HOME_VIEW` count stops growing after the GTM change (verify 7 days after).

### 4.5.4 Why before Phase 1

Phase 1 verification involves placing a test order and watching for the `purchase` event in DebugView. If internal traffic isn't filtered, the test order's events will pollute aggregate reports. If `GA_HOME_VIEW` is still polluting, top-events tables remain misleading. Cheap to fix first.

---

## 5. Phase 1 — Purchase tracking + ecommerce reset

### 5.1 Goal

Re-add the client-side `purchase` event to fire on the order-success page. Also add the standard `ecommerce: null` reset pattern in the dataLayer push helper so item-level data doesn't carry over between events.

### 5.2 Code changes

**File: `apps/frontend/src/lib/queries/orders.ts`**
Add a new `GET_ORDER_BY_ID` GraphQL query selecting `_id`, `orderId`, `orderStatus`, `totalAmount`, `subtotal`, `discount`, `deliveryCharge`, `currency`, `createdAt`, `items { variantId, quantity, price, totalPrice, name, sku, variant }`, `payment { status, method, transactionId, amount }`.

**File: `apps/frontend/src/app/order-success/page.tsx`**
- Convert to use `useQuery` with `GET_ORDER_BY_ID`, keyed on `orderId` from URL params
- On query success, push a `purchase` event with the order's items, `totalAmount`, `deliveryCharge`, `transaction_id = orderId`
- Guard re-fires using `sessionStorage` key `ga4_purchase_fired:<orderId>` so a page reload doesn't double-fire (GA4 dedupes on transaction_id anyway, but this keeps the dataLayer clean)

**File: `apps/frontend/src/lib/analytics/data-layer.ts`**
- In `pushToDataLayer`, if the payload contains an `ecommerce` object, push `{ ecommerce: null }` immediately before the actual payload. This forces GTM's `ecommerce.items` variable to refresh between events.

### 5.3 DataLayer payload (purchase)

```js
{
  event: 'purchase',
  page_location: window.location.href,
  page_title: document.title,
  ecommerce: {
    transaction_id: '<orderId>',
    currency: 'INR',
    value: <totalAmount as number>,
    shipping: <deliveryCharge as number>,
    items: [
      {
        item_id: '<variantId or sku>',
        item_name: '<name>',
        price: <price as number>,
        item_variant: '<variant>',
        quantity: <quantity as number>
      }
    ]
  }
}
```

### 5.4 GTM-side changes (SEO owner does these)

**No new tags needed.** The existing "GA4 Event - E-commerce Events" tag should already match `purchase` if its trigger is configured to fire on standard GA4 ecommerce event names. **Verification step before merge:** SEO owner opens GTM, clicks the "E-commerce Events" trigger, confirms its conditions include `purchase` (either by listing it explicitly or via a wildcard like `Event matches RegEx: ^(view_item|add_to_cart|remove_from_cart|begin_checkout|purchase)$`).

If the trigger does NOT include `purchase`, SEO owner adds it (Triggers → click "E-commerce Events" → Edit → add `purchase` to the event list → Save → Submit → Publish). This is a 30-second change.

### 5.5 Verification checklist

1. Branch deployed to staging (or production if no staging)
2. Place a real or test order
3. Open GA4 (correct property, `G-9EQ61GXMN3`) → Reports → Realtime → Events
4. Within ~30 seconds, a `purchase` event should appear with the correct `transaction_id` and `value`
5. Open GA4 → Admin → DebugView (with [Tag Assistant Companion](https://chrome.google.com/webstore/detail/tag-assistant-companion/) running on the order success page) — verify the full `items` array is correctly populated
6. Reload the order success page — confirm the `purchase` does NOT fire a second time (sessionStorage guard works)

### 5.6 Phase-1-specific risks

| Risk | Mitigation |
|---|---|
| `getOrderById` requires authentication; guest users fail | Most users complete login in OTP flow before checkout; if guest checkout exists, verify backend resolver allows order owner OR session-bound retrieval |
| `parseFloat` on `totalAmount: "0"` returns 0, looks like free order | Add validation: skip event if `value < 1` and log a warning |
| `ecommerce: null` reset breaks an existing GTM tag relying on stale data | Verify in GTM Preview: existing `add_to_cart`, `view_item`, etc. still fire correctly after the change |

### 5.7 Rollback

Revert the PR. The order success page reverts to its current behavior (renders confirmation, no purchase event). Acceptable rollback state — this matches the current production state.

---

## 6. Phase 2 — List/discovery events

### 6.1 Goal

Track which product lists users see, which product cards they click, and when they open the cart. Closes the biggest reporting gap: today GA4 cannot answer "which categories drive sales."

### 6.2 Events added

- `view_item_list` — fires when a list of products enters the viewport
- `select_item` — fires when a product card is clicked, before navigation to PDP
- `view_cart` — fires when the cart drawer opens

### 6.3 Code changes

**File: `apps/frontend/src/hooks/use-analytics.ts`**
- The `trackViewItemList` and `trackSelectItem` functions already exist; verify their payload shapes match GA4 spec (item_list_id, item_list_name, items[]).
- Add new `trackViewCart` function (does not exist yet).

**File: `apps/frontend/src/components/category-page/ProductGrid.tsx`** (and equivalent landing-page grids)
- Wrap each product card in an `IntersectionObserver` to fire `view_item_list` once per (list, item) pair per page view
- Use `sessionStorage` key `vil_fired:<list_id>:<item_id>` to prevent re-firing on scroll-back-up

**File: `apps/frontend/src/components/category-page/ProductCard.tsx`** (and `bestseller-card.tsx`, `CategoryProductSection.tsx`)
- On click of the product link, call `trackSelectItem` *before* navigation. Use a microtask delay (`Promise.resolve().then(() => navigate)`) so the dataLayer push completes.

**File: `apps/frontend/src/components/cart-drawer/CartDrawer.tsx`**
- On `open` state transition (false → true), call `trackViewCart` with current cart contents.

### 6.4 List naming convention

Each list location must have a stable `item_list_id` and `item_list_name` so GA4 reports are interpretable:

| Location | item_list_id | item_list_name |
|---|---|---|
| Category page `/category/[slug]` | `category_<slug>` | `Category: <slug>` |
| Search results | `search_results` | `Search Results` |
| No-palm-oil landing `/no-palm-oil-snacks` | `landing_no_palm_oil` | `Landing: No Palm Oil Snacks` |
| Bestseller carousel (homepage) | `home_bestsellers` | `Homepage Bestsellers` |
| Related products on PDP | `pdp_related` | `PDP Related` |

### 6.5 GTM-side changes (SEO owner does these)

Confirm "GA4 Event - E-commerce Events" trigger picks up `view_item_list`, `select_item`, `view_cart`. Same trigger-extension procedure as Phase 1.

### 6.6 Verification checklist

1. Visit category page → wait for grid to render → in GA4 Realtime, see one `view_item_list` event with correct items
2. Scroll up to top of grid, scroll down again — `view_item_list` does NOT re-fire for items already counted
3. Click a product card → `select_item` fires before navigation → land on PDP → `view_item` fires
4. Open cart drawer → `view_cart` fires → close and reopen drawer → `view_cart` fires again (correct behavior)
5. Repeat across: search results, no-palm-oil-snacks landing, bestseller carousel

### 6.7 Phase-2-specific risks

| Risk | Mitigation |
|---|---|
| `view_item_list` fires hundreds of times on infinite scroll | IntersectionObserver + sessionStorage dedup per (list_id, item_id) |
| `select_item` push lost when navigation happens too fast | Microtask delay before `router.push`; alternatively use `sendBeacon` |
| Multiple lists on same page (e.g. PDP shows "Related" and "Bestsellers") | Each list has its own `item_list_id`; no conflict |

---

## 7. Phase 3 — Checkout step events

### 7.1 Goal

Add `add_shipping_info` and `add_payment_info` so GA4 can answer "where do users drop off in checkout."

### 7.2 Code changes

The checkout flow lives inside the cart drawer (no separate `/checkout` route).

**File: `apps/frontend/src/components/cart-drawer/AddressModal.tsx`** (or wherever the user confirms an address)
- On the explicit "Save / Confirm address" user action (not on auto-select on mount), call `trackAddShippingInfo` with the cart items + shipping value

**File: `apps/frontend/src/components/cart-drawer/PaymentModal.tsx`**
- On payment method selection (user clicks a payment option), call `trackAddPaymentInfo` with the cart items + payment_type

**File: `apps/frontend/src/hooks/use-analytics.ts`**
- Add `trackAddShippingInfo` and `trackAddPaymentInfo` functions following GA4 spec

### 7.3 DataLayer payloads

```js
{
  event: 'add_shipping_info',
  ecommerce: {
    currency: 'INR',
    value: <cart total>,
    shipping_tier: '<address city or "default">',
    items: [/* cart items */]
  }
}

{
  event: 'add_payment_info',
  ecommerce: {
    currency: 'INR',
    value: <cart total>,
    payment_type: '<UPI|Card|COD|...>',
    items: [/* cart items */]
  }
}
```

### 7.4 GTM-side changes (SEO owner)

Same trigger extension as Phases 1 and 2.

### 7.5 Verification checklist

1. Open cart drawer → Proceed → see `begin_checkout` (existing) → confirm address → `add_shipping_info` fires
2. Select payment method → `add_payment_info` fires
3. Refresh the cart drawer mid-flow — events do NOT re-fire on auto-restored address selection
4. GA4 → Reports → Engagement → Events: confirm both events appear in the funnel

### 7.6 Phase-3-specific risks

| Risk | Mitigation |
|---|---|
| Auto-selected address (default) fires `add_shipping_info` on mount | Only fire on explicit user-initiated confirm action, not on `useEffect` watching `selectedAddress` |
| Multiple payment-method clicks fire multiple `add_payment_info` events | Acceptable per GA4 spec (each is a real selection event); no dedup needed |

---

## 8. Phase 4 — Search + promotion tracking

### 8.1 Goal

Track site search queries (huge SEO insight value) and homepage promo banners.

### 8.2 Events added

- `search` — fires on search submit
- `view_promotion` — fires when a promo banner enters the viewport
- `select_promotion` — fires when a promo banner is clicked

### 8.3 Code changes

**File: `apps/frontend/src/components/navbar/components/search-bar.tsx`**
- On form submit (Enter key or icon click), call `trackEvent('search', { search_term: <value> })` *before* navigation to search results page
- Debounce/dedup: do not fire on every keystroke. Submit only.

**File(s): wherever promo banners render** (homepage hero, alert banners, etc. — needs identification by tech lead)
- On viewport entry, fire `view_promotion` with `promotion_id`, `promotion_name`, `creative_name`, `creative_slot`
- On click, fire `select_promotion` with the same fields

### 8.4 DataLayer payloads

```js
{ event: 'search', search_term: '<query>' }

{
  event: 'view_promotion',
  ecommerce: {
    items: [
      { promotion_id: 'home_hero_q2_2026', promotion_name: 'Q2 Hero', creative_name: 'no-palm-oil-cta', creative_slot: 'home_hero' }
    ]
  }
}

{
  event: 'select_promotion',
  ecommerce: { items: [/* same shape as view_promotion */] }
}
```

### 8.5 GTM-side changes (SEO owner)

Trigger extension as before. `search` is a standard GA4 event and forwards automatically.

### 8.6 Verification checklist

1. Type a query in search bar, press Enter → `search` event fires once with correct `search_term`
2. Type without submitting — no event fires
3. Scroll to homepage hero — `view_promotion` fires once
4. Click hero CTA — `select_promotion` fires
5. GA4 → Reports → Engagement → Events → check `search` events are appearing with `search_term` populated

### 8.7 Phase-4-specific risks

| Risk | Mitigation |
|---|---|
| `search` fires on every keystroke if attached to onChange | Bind to form `onSubmit`, not `onChange` |
| Promo viewport detection counts background banners | IntersectionObserver with `threshold: 0.5` (50% visible) |

---

## 9. Phase 5 — Auth identity + first-party data + Firebase web cleanup

### 9.1 Goal

Three logically connected pieces, all touching identity:

1. Add `login` and `sign_up` events to the canonical web property
2. Send `user_id` and `sha256_phone_number` (hashed) on conversion events for future Google Ads Enhanced Conversions
3. Remove the duplicate Firebase Analytics login/logout calls from `apps/frontend/src/lib/firebase/auth-service.ts`

This is the highest-risk phase. Run after Phases 1–4 are confirmed working in GA4.

### 9.2 Backend prerequisite (block if not satisfied)

The current login response from `auth-service.ts:160` does not distinguish first-time signup from subsequent logins. Backend must return an `isNewUser: boolean` field in the auth response so the frontend can fire `sign_up` vs `login` correctly.

**Action item for tech lead:** add `isNewUser` to the login mutation/REST response in `apps/backend/src/auth/`. Once this lands, Phase 5 frontend work can proceed.

### 9.3 Code changes

**File: `apps/frontend/src/lib/firebase/auth-service.ts`**
- After the backend authentication call succeeds (line ~160), instead of `logEvent(analytics, 'login', ...)`:
  - If `data.isNewUser === true`, push `sign_up` to dataLayer
  - Otherwise, push `login`
  - Also push the user_data identifiers (see 9.5 below)
- **Delete** the existing `logEvent(analytics, 'login', ...)` call
- **Delete** the existing `logEvent(analytics, 'logout', ...)` call in `signOut()`
- Keep `setUserId` in Firebase Analytics off — we don't want any data going to the Firebase-auto property from web

**File: `apps/frontend/src/lib/analytics/hashing.ts`** (new file)
- Implement `sha256Hash(input: string): Promise<string>` using browser-native `crypto.subtle.digest('SHA-256', ...)`
- Implement `normalizePhone(raw: string): string` — convert to E.164 (e.g. `+919999999999`) — strip whitespace, prefix `+91` if missing
- Implement `normalizeEmail(raw: string): string` — lowercase, trim
- All hashing happens client-side. Raw PII never enters the dataLayer.

**File: `apps/frontend/src/hooks/use-analytics.ts`**
- Replace the dead `setUser` function with `setUserData(userId, phoneE164)` that:
  - Hashes the phone (and email if available)
  - Pushes a `user_data` payload (no `event` field — pure user properties) once per session, guarded by `sessionStorage`
- Add `trackLogin({ method, isNewUser, userId, phoneE164 })` and `trackSignUp(...)` functions

**File: `apps/frontend/src/app/order-success/page.tsx`** (Phase 1 update)
- When firing `purchase`, also include `user_id` and `user_data: { sha256_phone_number }` in the payload (pulled from cookie/auth state)

### 9.4 DataLayer payloads

```js
// Once per session, after login (no `event` field)
{
  user_id: '<stable backend user id>',
  user_data: {
    sha256_phone_number: '<sha256 of E.164 phone>'
  }
}

// Login event
{
  event: 'login',
  method: 'phone',
  user_id: '<...>',
  user_data: { sha256_phone_number: '<...>' }
}

// Sign-up event
{
  event: 'sign_up',
  method: 'phone',
  user_id: '<...>',
  user_data: { sha256_phone_number: '<...>' }
}

// Purchase event (extended from Phase 1)
{
  event: 'purchase',
  user_id: '<...>',
  user_data: { sha256_phone_number: '<...>' },
  ecommerce: { /* as Phase 1 */ }
}
```

### 9.5 GTM-side changes (TECH LEAD does these — PII hashing setup)

This phase requires GTM container changes that go beyond simple click-and-save. Tech lead's territory.

1. **Conversion Linker tag** — add a Conversion Linker tag (Tag Type: Conversion Linker) firing on All Pages. Required for Enhanced Conversions when Ads is later enabled.
2. **User-Provided Data variable** — create a Variable of type "User-Provided Data" pointing at a dataLayer variable (`user_data`). Used by the Google Tag and GA4 events.
3. **Update Google Tag** — in the existing `Google Tag G-9EQ61GXMN3` config, set "User-provided data" to the new variable. Enable "Send user-provided data to Google".
4. **GA4 user_id config** — in the Google Tag's "Configuration parameters", add `user_id` referencing `{{DLV - user_id}}` (a new dataLayer variable to be created).
5. **Trigger updates** — extend "E-commerce Events" trigger to include `login`, `sign_up`, and any others not yet covered. Or create separate triggers if cleaner.
6. **Verify** — Tag Assistant + GA4 DebugView shows hashed phone in user_data field (under DebugView → click an event → check user_provided_data section).

### 9.6 Verification checklist

1. Phone-login → `login` event fires in DebugView with `method: phone`, `user_id` populated, `sha256_phone_number` populated and looks like a SHA-256 hash (64 hex chars), NOT a raw phone number
2. New phone signup → `sign_up` event fires (not `login`)
3. Logout works as before — no `logout` event in any GA4 property (intentionally removed; Firebase property no longer receives anything from web)
4. Purchase from a logged-in user → user_data present in DebugView's purchase event
5. GA4 → Admin → Property Settings → User-provided data: status shows "active"
6. Phone authentication itself still works end-to-end (regression check)

### 9.7 Phase-5-specific risks (highest of all phases)

| Risk | Mitigation |
|---|---|
| Bug in auth code change breaks login | Thorough staging env testing; manual regression check before deploy |
| Unhashed phone leaks into dataLayer | Unit test `sha256Hash` output is 64 hex chars; integration test that `user_data` contains only `sha256_*` keys |
| GA4 rejects events containing PII | Using `sha256_phone_number` as the field name — this is GA4's recognized hashed field; raw phone never enters dataLayer |
| `sign_up` event misfires as `login` (or vice versa) for existing users | Backend `isNewUser` flag must be reliable — tech lead reviews backend logic |
| Removing Firebase logEvent calls accidentally removes auth code | Code review focus: only `logEvent(analytics, ...)` calls are deleted; nothing else in auth-service.ts changes |
| User logs in on multiple devices — user_id stable? | Backend must use a persistent user-record ID (Mongo `_id` or similar), not session ID |

### 9.8 Rollback

Phase 5 is a single PR but logically two pieces. If a bug surfaces post-deploy:

- **Auth break:** revert PR immediately. Login returns to current behavior.
- **PII leak (unhashed phone reaches GA4):** revert PR; in parallel, contact GA4 support to request data deletion for the affected timeframe.
- **GTM container break:** GTM's built-in version history allows one-click rollback to the previous container version. SEO owner or tech lead can do this directly in GTM UI without a code change.

---

## 10. Phase 6 — Server-side purchase tracking

### 10.1 Goal

Make purchase tracking immune to ad-blockers, browser tab closures, and any other client-side interference. The backend itself fires a `purchase` event directly to GA4 via Measurement Protocol when an order is created.

### 10.2 Architecture

- Same `transaction_id` as the client-side Phase 1 event → GA4 dedupes; counts each purchase exactly once
- Server-side event includes the same items, value, currency
- If client-side fires (most users), server-side is redundant but harmless
- If client-side does NOT fire (ad-blocker, abandoned tab), server-side is the only record

### 10.3 Backend changes

**File: `apps/backend/src/order/services/order.command-service.ts`** (or equivalent — wherever `createOrder` lives)

- After successful order creation (post-payment-success), call a new `Ga4MeasurementProtocolService.trackPurchase(orderId, items, value, ...)` method
- Call is async-fire-and-forget — order creation response NOT blocked on Measurement Protocol latency
- Errors logged but not raised to user (order creation succeeded; analytics is non-critical)

**File: `apps/backend/src/analytics/ga4-measurement-protocol.service.ts`** (new)

- Implements `trackPurchase` calling `https://www.google-analytics.com/mp/collect?measurement_id=G-9EQ61GXMN3&api_secret=<env>`
- Payload follows GA4 Measurement Protocol spec
- `client_id` — passed from frontend via order-creation request (frontend reads `_ga` cookie value); falls back to a generated one if not available
- Hashed `user_id` and `user_data` (re-hash phone server-side) included for Enhanced Conversions parity with client-side

### 10.4 Frontend changes (small)

**File: `apps/frontend/src/lib/cart/cart-service.ts`** (or wherever the order-creation mutation is invoked)

- Read the `_ga` cookie (GTM's GA4 client_id) and include it in the order-creation GraphQL/REST input
- Allows backend to use the same client_id for proper user attribution

### 10.5 Environment

- New env var: `GA4_API_SECRET` — created in GA4 Admin → Data Streams → Web stream → Measurement Protocol API secrets → Create
- Stored in backend env (production + staging separately)
- Never logged, never returned in API responses

### 10.6 GTM-side changes

**None.** Server-side bypasses GTM entirely — sends directly to GA4.

### 10.7 Verification checklist

1. Place test order with **client-side blocked** (Chrome DevTools → Network → block requests to `googletagmanager.com`)
2. Confirm: in GA4 DebugView, no client-side `purchase` event
3. Within ~30 seconds, the server-side `purchase` event appears in DebugView (look for `app_browser` or unset to differentiate)
4. Place test order WITHOUT blocking — both client and server fire; GA4 Realtime shows ONE purchase (deduped)
5. Server-side error scenario: deliberately set wrong `GA4_API_SECRET` → backend logs error but order creation succeeds

### 10.8 Phase-6-specific risks

| Risk | Mitigation |
|---|---|
| Network call to GA4 blocks/slows order creation | Fire-and-forget pattern; bounded timeout; non-critical-path |
| `transaction_id` mismatch between client and server (e.g. one uses MongoDB `_id`, other uses `orderId`) | Both must use the same human-readable `orderId` field; document in spec; integration test |
| Missing `client_id` from frontend leads to attribution split | Backend falls back to a hashed user_id-derived client_id; consistent per user |
| API secret leaked in logs or error messages | Environment variable; explicit redaction in error handlers; .env in gitignore |

---

## 10.5 Phase 7 — Duplicate URL cleanup (SEO hygiene, not analytics)

### 10.5.1 Goal

Resolve the duplicate-URL pollution still active in Google's index. Each duplicate splits ranking authority between two URLs that point to the same content. The Sprint 1a redirect work was supposed to handle this; the May 2026 baseline rebuild surfaced that it didn't fully land.

This phase is **SEO hygiene, not analytics.** It can ship independently of Phases 1–6 and does not block them. Listed here for tracking continuity.

### 10.5.2 Duplicates active as of 2026-05-08 (90-day data)

| Clean URL (clicks) | Duplicate still indexed (clicks) | Likely root cause |
|---|---|---|
| `/healthy-snacks` (349) | `/category/Healthy%20Snacks` (85) | Sprint 1a redirect doesn't match `%20`-encoded variant |
| `/bhujia` (234) | `/category/Bhujia` (55) | Same as above |
| `/cookies` (195) | `/category/Cookies` (48) | Same as above |
| — | `/category/Purani%20Delhi` (48) | No clean URL exists; needs redirect target chosen |
| `/about-us` (514) | `/about` (132) | Two separate routes serving similar content |
| `/product/lets-try-purani-delhi-papdi` (46) | `/product/let-s-try-purani-delhi-papdi` (45) | Typo duplicate slug — likely two product records |

### 10.5.3 Investigation tasks (before any code change)

1. **Verify the redirect status code** for `/category/Healthy Snacks` and the `%20`-encoded variant. Run `curl -I "https://letstryfoods.com/category/Healthy%20Snacks"` and confirm whether the response is `301`, `302`, or `200`. A 302 doesn't pass authority; 200 means the redirect isn't firing at all.
2. **Locate the redirect logic.** Likely in `apps/frontend/middleware.ts` or `next.config.js`.
3. **Check if `/about` is a separate Next.js route** or a redirect target. If separate, decide on canonical and redirect the other.
4. **Investigate the `lets-try-purani-delhi-papdi` vs `let-s-try-purani-delhi-papdi` duplicate.** Likely two product records in the CMS with similar slugs. Confirm with a Mongo `db.products.find({ slug: /purani-delhi-papdi/ })`.

### 10.5.4 Code changes (after investigation)

Pending the investigation above. Most likely:

- Fix or add 301 redirects in `next.config.js` `redirects()` covering both raw and `%20`-encoded `/category/X` patterns.
- Pick canonical for `/about` vs `/about-us` (likely keep `/about-us`, redirect `/about`).
- Merge or hard-delete the typo-slug duplicate product record; redirect the dead slug.

### 10.5.5 Verification

- After deploy, every duplicate URL listed above should `curl -I` to a `301` pointing at the canonical.
- 4–8 weeks after deploy, GSC's Pages report should show the duplicates dropping out of "Crawled — currently not indexed" or "Duplicate" categories.
- Aggregate clicks for the canonical should rise approximately equal to the duplicate's prior click volume (not always, but directionally).

### 10.5.6 Risks

| Risk | Mitigation |
|---|---|
| 301 to a non-existent canonical (e.g. for `/category/Purani%20Delhi`) returns 404 chain | Pick a canonical first (probably `/purani-delhi`); confirm it exists before adding redirect |
| Merging typo product records destroys order history references | Don't delete; soft-redirect at the slug level only, keep both DB records |
| Redirect rule too greedy (e.g. catches `/category` itself or unrelated paths) | Use exact-match patterns, not wildcards; manually test each pattern |

---

## 11. Cross-phase risks and mitigations

These apply across multiple phases. Listed once here, referenced from individual phase risk tables.

| Risk | Mitigation |
|---|---|
| New events not forwarded by GTM container | SEO owner / tech lead extends "E-commerce Events" trigger or adds new triggers per phase. Verification gate at each phase confirms events appear in GA4 Realtime. |
| `user_id` mismatch between client and server | Always source from the same backend user record `_id`. Document field name in this spec. |
| Existing analytics break when adding `ecommerce: null` reset | Verify in GTM Preview during Phase 1 deploy that `view_item`, `add_to_cart`, etc. still fire and carry correct items |
| Microsoft Clarity tag conflicts with new tracking | Microsoft Clarity is independent of GA4 — no conflict possible at the tag level. Confirmed. |
| Two GA4 properties cause confusion in reporting | Documentation in this spec; SEO owner stars correct property as default; Firebase property goes empty after Phase 5 |
| Tech-lead review bandwidth strains rollout pace | Phases sized small intentionally; each PR independently reviewable in 30–60 min |

---

## 12. Open questions for tech lead

To be resolved before specific phases are coded:

1. **(Phase 1)** Does `getOrderById` resolver allow guest users (no auth) to fetch their own just-placed order? Or is auth required? If auth required, need to confirm guest checkout flow doesn't exist or has a different path.
2. **(Phase 5)** Backend mutation/REST that finalizes phone auth — what's the cleanest place to add an `isNewUser: boolean` field to the response?
3. **(Phase 5)** What is the canonical user identifier — MongoDB `_id`, Firebase UID, or another field? It must be stable across sessions and devices.
4. **(Phase 6)** Where exactly does order creation finalize? `apps/backend/src/order/services/order.command-service.ts` is the suspected file but tech lead should confirm.
5. **(Phase 6)** Staging GA4 property — should server-side Measurement Protocol use the same Measurement ID for staging, or should we create a separate staging GA4 property to avoid polluting production data with test orders?
6. **(General)** Deployment pipeline for `apps/frontend` — is there a staging environment for GA4 verification before production deploy? If not, suggest a "private preview" pattern or we accept production-as-staging.

---

## 13. Out of scope (explicit)

Documented so it's clear we considered and parked these:

- **Meta Pixel / Facebook Conversions API** — separate scope; can be added later as an additional GTM tag. No code change needed once GTM dataLayer is correct.
- **TikTok Pixel** — same as above.
- **Server-side GTM (sGTM)** — different architecture entirely. Phase 6's Measurement Protocol direct-to-GA4 approach gets us 90% of the reliability benefit at 5% of the complexity. sGTM can be considered later if the stack grows multi-vendor.
- **GA4 → BigQuery export** — a free GA4 feature, can be enabled later by tech lead in GA4 Admin without any code change.
- **Cross-domain tracking** — letstryfoods.com is single-domain; not currently relevant. Conversion Linker tag (Phase 5) provides a base if a second domain is added later.
- **Custom dimensions for niche cases** (e.g. cart abandonment recovery email IDs, A/B test variant IDs) — domain-specific, separate work when needed.
- **Mobile app analytics integration** — when `apps/letstry-mobile` adds Firebase Analytics, that's a separate task. Property strategy (Section 4.4) accommodates it.
- **GDPR / consent banner** — not currently in scope. Indian operations primary; if EU traffic grows, GA4 Consent Mode v2 is a separate work item.

---

## 14. Follow-up tasks (post-rebuild)

Items flagged during scoping but deferred:

1. **SEO baseline re-verification.** The Q1 2026 SEO baseline analysis (95% branded traffic, "no palm oil" cluster sizing, funnel data, multiple red flags noted in [memory: project_seo_baseline_q1_2026.md]) was likely produced from the Firebase-auto GA4 property — i.e., from incomplete/wrong data. Once the canonical web property has a few weeks of clean data post-Phase-1-and-2, redo the baseline numbers from `lets Try Next` property. May materially change strategic priorities.
2. **Mobile app analytics.** When `apps/letstry-mobile` is ready for analytics, integrate Firebase Analytics in the mobile app (it auto-forwards to the Firebase-auto GA4 property). Define event taxonomy at that time.
3. **Eventual property consolidation review.** After 6 months of clean dual-property usage, reassess whether keeping two GA4 properties is still worth it, or whether mobile + web should be merged into one. Default: keep separate.
4. **Microsoft Clarity audit.** Tag is installed but never reviewed. Worth a separate session reviewing heatmaps for UX/CRO insights — not analytics-rebuild scope.
5. **GA4 conversion event configuration.** Once events flow correctly, mark `purchase`, `sign_up`, `add_payment_info` as conversions in GA4 (Admin → Events). Five-minute task post-Phase-1.

---

## Appendix A — File reference summary

| File | Touched by phases | Purpose |
|---|---|---|
| `apps/frontend/src/lib/analytics/data-layer.ts` | 1 | DataLayer push helper; ecommerce reset added |
| `apps/frontend/src/lib/analytics/hashing.ts` | 5 (new) | SHA-256 hashing + phone/email normalization |
| `apps/frontend/src/hooks/use-analytics.ts` | 1, 2, 3, 4, 5 | Central tracking hook |
| `apps/frontend/src/lib/queries/orders.ts` | 1 | Add GET_ORDER_BY_ID |
| `apps/frontend/src/app/order-success/page.tsx` | 1, 5 | Fire purchase event with user_data |
| `apps/frontend/src/components/category-page/ProductGrid.tsx` | 2 | view_item_list |
| `apps/frontend/src/components/category-page/ProductCard.tsx` | 2 | select_item |
| `apps/frontend/src/components/bestseller/bestseller-card.tsx` | 2 | view_item_list, select_item |
| `apps/frontend/src/components/cart-drawer/CartDrawer.tsx` | 2 | view_cart |
| `apps/frontend/src/components/cart-drawer/AddressModal.tsx` | 3 | add_shipping_info |
| `apps/frontend/src/components/cart-drawer/PaymentModal.tsx` | 3 | add_payment_info |
| `apps/frontend/src/components/navbar/components/search-bar.tsx` | 4 | search |
| (Banner components — TBD by tech lead) | 4 | view_promotion, select_promotion |
| `apps/frontend/src/lib/firebase/auth-service.ts` | 5 | Login/sign_up dataLayer push; remove Firebase logEvent |
| `apps/backend/src/order/services/order.command-service.ts` | 6 | Trigger server-side GA4 event |
| `apps/backend/src/analytics/ga4-measurement-protocol.service.ts` | 6 (new) | Server-side GA4 sender |
| `apps/frontend/src/lib/cart/cart-service.ts` | 6 | Pass `_ga` cookie's client_id to backend |

---

## Appendix B — Glossary for non-technical readers

- **GA4** — Google Analytics 4, the reporting tool
- **GTM** — Google Tag Manager, the "switchboard" between website code and GA4
- **DataLayer** — a JavaScript variable on the website where events are pushed; GTM reads from it
- **Measurement Protocol** — a way for backends (not browsers) to send events directly to GA4
- **Enhanced Conversions** — Google Ads feature that uses hashed first-party data to improve attribution
- **SHA-256 hash** — a one-way scrambling function; same input always produces same output, but output cannot be reversed to reveal input
- **E.164 phone format** — the international phone number standard (e.g. `+919999999999`)
- **PII** — Personally Identifiable Information (raw email, phone, name, etc.)
- **client_id** — GA4's anonymous identifier for a browser, stored in the `_ga` cookie
- **user_id** — your application's stable identifier for an authenticated user

---

**End of spec. Awaiting tech-lead review.**
