# PR-A Setup Checklist — GA4 / GTM / GSC tasks

> **Companion to:** the PR-A code changes (Phases 1+2+3+4 from `docs/analytics-rebuild-spec.md`)
> **Owner:** SEO owner (you) for the GA4 / GTM / GSC tasks · tech lead for the deploy
> **Estimated time:** 25–40 minutes total
> **Reference property:** `next-demo-property` · Measurement ID `G-9EQ61GXMN3` · account "lets Try Next"

---

## What PR-A ships

PR-A adds these dataLayer events on the website:

| Event               | When it fires                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| `purchase`          | Order success page loads (with valid order data)                                                        |
| `view_item_list`    | A list of products enters the viewport (category page, no-palm-oil pillar, bestseller carousel, search) |
| `select_item`       | A product card is clicked — fires before navigation                                                     |
| `view_cart`         | Cart drawer opens with items in it                                                                      |
| `add_shipping_info` | User explicitly confirms a shipping address in cart drawer                                              |
| `add_payment_info`  | User clicks "Pay ₹X" — fires just before payment-gateway redirect                                       |
| `search`            | User completes a search query on `/search` (debounced 500 ms)                                           |
| `view_promotion`    | Hero carousel banner enters viewport (and on each slide change)                                         |
| `select_promotion`  | Hero carousel banner is clicked                                                                         |

All events also include the `ecommerce: null` reset pattern, so GTM's items variable doesn't carry stale data between events. This is a defensive fix for `view_item`, `add_to_cart`, `begin_checkout` (already firing) — they should still work, but verify in DebugView.

---

## Step 1 — Phase 0 cleanup (do first, before deploy)

This is the same Phase 0 list from the rebuild spec — short version, repeated here so PR-A is self-contained.

- [ ] **Star `next-demo-property` as default in GA4.** Property switcher → click star.
- [ ] **Set GA4 default date range to "Last 90 days"** (top-right date picker → Apply → option to set as default).
- [ ] **Verify `purchase` is starred as a key event** (Admin → Events → Key events tab). Should already be — just double-check.
- [ ] **Submit GSC URL Removal request for `/search?*`** (Search Console → Indexing → Removals → New request → "Temporarily remove URL" → `https://letstryfoods.com/search` → "Remove all URLs with this prefix").
- [ ] **Ask tech lead to set up an internal traffic filter** (GA4 → Admin → Data Streams → Web → Configure tag settings → Define internal traffic). They need office IP(s).
- [ ] **Ask tech lead to disable / delete the `GA_HOME_VIEW` tag in GTM.** Legacy event firing 8.4× per user from 5 internal users. Pure noise.

---

## Step 2 — GTM trigger update (CRITICAL — must happen at deploy time)

This is the single most important manual task. **If you skip this, every new event fires to dataLayer but never reaches GA4** — the website code will be working but the GA4 dashboard will stay empty.

### What to do

1. Open GTM → select the letstryfoods container.
2. In the left sidebar, click **Triggers**.
3. Find the trigger named **"E-commerce Events"** (or similar — it's the trigger powering the "GA4 Event - E-commerce Events" tag).
4. Click to edit it.
5. The trigger's "This trigger fires on" condition currently lists a few event names. **Extend the list** to include all of these (any not already present):

```
purchase
view_item_list
select_item
view_cart
add_shipping_info
add_payment_info
view_promotion
select_promotion
```

6. **Also confirm `search` is forwarded.** `search` is a standard GA4 event — it usually forwards automatically, but if the "GA4 Event - E-commerce Events" trigger has an "any event matching this regex" pattern, add `search` to it. If it has a separate "All Events" trigger forwarding everything, no change needed.
7. Click **Save**.
8. Click **Submit** (top-right of GTM).
9. Add a version name like "PR-A: extend triggers for 9 new events" and a description.
10. Click **Publish**.

### Easier alternative — single regex trigger

If you want to future-proof so we never have to extend this trigger again, you can replace the event-name list with a single regex condition:

- **Trigger Type:** Custom Event
- **Event name (use regex matching):** `^(view_item|view_item_list|select_item|view_cart|add_to_cart|remove_from_cart|begin_checkout|add_shipping_info|add_payment_info|purchase|search|view_promotion|select_promotion|login|sign_up)$`
- **Tick:** "Use regex matching"

This catches every standard GA4 ecommerce + auth event. Future PRs (Phase 5 will add `login`/`sign_up`) require no GTM-trigger change.

### Verify the trigger is right

Open GTM Preview mode (top-right "Preview" button), open letstryfoods.com in the new tab GTM opens, and:

- Click a product card on the homepage → in GTM Preview, you should see a `select_item` event in the timeline AND see the "GA4 Event - E-commerce Events" tag fire on it.
- If the event appears in the timeline but no tag fires on it, the trigger condition didn't catch it — go back and extend the trigger.

---

## Step 3 — Verification after deploy (the funnel walk-through)

Once tech lead deploys PR-A and you've published the GTM trigger update, walk through the funnel once and confirm every event reaches GA4 DebugView.

### Setup

1. Install [Tag Assistant Companion](https://chrome.google.com/webstore/detail/tag-assistant-companion/) Chrome extension if you don't have it.
2. Open GA4 → Admin → DebugView. Keep this tab open.
3. In a separate tab, open `https://letstryfoods.com` and start Tag Assistant on that tab.

### The walk-through

Place a real test order, watching DebugView between each step:

| Step | Action                          | Event you should see in DebugView                              |
| ---- | ------------------------------- | -------------------------------------------------------------- |
| 1    | Land on homepage                | `page_view` · `view_promotion` (for hero banner)               |
| 2    | Click a hero banner             | `select_promotion` then a `page_view` for the destination      |
| 3    | Scroll to bestseller carousel   | `view_item_list` with `item_list_name: "Homepage Bestsellers"` |
| 4    | Click a bestseller product      | `select_item` then `view_item` on the PDP                      |
| 5    | Add to cart on the PDP          | `add_to_cart`                                                  |
| 6    | Open cart drawer                | `view_cart`                                                    |
| 7    | Click "Continue to Payment"     | `begin_checkout`                                               |
| 8    | Pick or save a shipping address | `add_shipping_info`                                            |
| 9    | Click "Pay ₹X"                  | `add_payment_info` then redirect to gateway                    |
| 10   | Complete payment on gateway     | (returns to website)                                           |
| 11   | Land on `/order-success` page   | **`purchase`** ← the event we've been chasing                  |

Bonus check:

| Step | Action                                                           | Event                                                              |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| A    | Visit a category page like `/healthy-snacks`                     | `view_item_list` with `item_list_name: "Category: healthy-snacks"` |
| B    | Use the search bar to search "bhujia" (wait 500 ms after typing) | `search` with `search_term: "bhujia"`                              |

### What "right" looks like in DebugView

For each event, click into it in DebugView and verify:

- `page_location` and `page_title` are populated (not `(not set)`)
- For ecommerce events: the `items` array has correct `item_id`, `item_name`, `price`, `quantity`
- For `purchase`: `transaction_id` matches the orderId, `value` is the actual order total in INR
- For `view_promotion`/`select_promotion`: `promotion_id`, `promotion_name`, `creative_slot` populated

If anything is `(not set)` or empty, screenshot the event and ping the dev team — likely a payload-shape bug to fix in a follow-up.

### When the funnel walk-through passes

Mark `purchase`, `add_to_cart`, `begin_checkout` as **Key events** in GA4 (Admin → Events → click the star next to each). `purchase` should already be starred — verify. Marking these as key events makes them appear in the standard reports and conversion paths.

---

## Step 4 — What's NOT in PR-A (deferred to later PRs)

So you're not surprised when these don't appear:

- **`login` and `sign_up` events** — these need explicit dataLayer pushes from the auth code. Currently `form_start`/`form_submit` fire via GA4 Enhanced Measurement but don't represent real auth completion. Comes in **PR-B (Phase 5)**.
- **Hashed `user_data` for Enhanced Conversions** — also PR-B.
- **Server-side `purchase` via Measurement Protocol** — backend work, comes in **PR-C (Phase 6)**.
- **Duplicate URL redirects** (`/category/X`, `/about` vs `/about-us`, etc.) — separate concern, comes in **PR-D (Phase 7)**.

---

## Troubleshooting

**Event appears in GTM Preview but not in GA4 DebugView**
→ The trigger isn't extended for that event name (Step 2 above). Or the GTM container hasn't been published.

**Event appears in DebugView but `value` is 0 or items array is empty**
→ Payload-shape bug. Screenshot and report.

**`purchase` doesn't fire on order-success page**
→ Two known causes:

- (a) The `getOrderById` GraphQL call returns null/error. Check the browser network tab. Usually means the user is in guest mode (auth required). Phase 5 will add guest support; for now, authenticated orders will fire correctly.
- (b) `value < 1` — the order's `totalAmount` came back as 0 or invalid. Code intentionally skips the event in this case to avoid recording bogus revenue.

**Multiple `view_item_list` events for the same list on a single page view**
→ Shouldn't happen — `sessionStorage` guard prevents it. If it does, clear sessionStorage and retest. If still firing twice, the list_id is changing between renders.

**`add_shipping_info` fires twice when picking an existing address**
→ Shouldn't happen — only fires inside `handleSelectAddress` and `handleSaveAddressDetails`. If observed, screenshot and report.

---

## Done

When the funnel walk-through (Step 3) passes end-to-end, the PR-A rollout is complete. The GA4 dashboard should now populate with the full ecommerce funnel for the first time since the property was set up — and `purchase` should record real revenue going forward.

Next: PR-B (Phase 5 — auth/login events + first-party data).
