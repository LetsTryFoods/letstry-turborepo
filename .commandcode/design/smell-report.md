# Smell Report — Let's Try Foods (frontend)

**Mode:** `/design smell`
**Scope:** Homepage landing surface, `apps/frontend/src`
**Date:** 2026-08-14
**Score:** 3/10 — STRONG

---

## Verdict

The homepage shows **cluster-level smell, not cleanup-level**. Four to five generic tells are visible at the same time, and they share one root: the page was assembled from reflexes instead of composed from the brief. The strongest visual ideas on the page — the gold "Bestseller" rope-and-ornament display and the gradient-backed hero — are **inherited generic energy**, not decisions owned by this specific brand. The rest of the page defaults to equal cards, centered headings, and grey borders.

The design has not committed to a lane. Fixing it means a **redesign of the homepage direction**, not spot repairs. Recommended first moves: `redesign` (composition + color), then `recolor` + `typeset` to land the new lane.

---

## Heuristic Scores

| # | Heuristic | Score | Key finding |
|---|---|---|---|
| 1 | Tech gradient | 0 | Two orange `#FF5400` shine-animation gradients on one section, side by side |
| 2 | Generic tech hue | 0 | The only brand color is `#0C5273` — navy blue on a snack brand |
| 3 | Feature tile grid | 0 | Uniform testimonial card grid, every card equal, no priority |
| 4 | Accent rail | 1 | No colored rail; placeholder is used instead of structure |
| 5 | Unearned blur | 0 | `backdropFilter: blur(2px)` on the bestseller frame with no depth system |
| 6 | Stat monument | 1 | No stat cluster; real text used instead |
| 7 | Icon topper | 0 | Brand icon avatar circle on every testimonial card |
| 8 | Bounce everywhere | 0 | Confetti, swaying ornaments, shine animation, spark on add-to-cart — toy energy |
| 9 | Default type | 0 | Heading font sizes and colors vary section to section with no system |
| 10 | Center stack | 0 | Centered headline + carousel + equal cards, no composition tension |

---

## The Odors I Found

### 1. The gold "Bestseller" display — a recycled Diwali template (P0)

The strongest visual on the page is the bestseller section: a gradient gold title, rope SVG, hanging ornaments, a double gold inset frame, a dark green glass panel, and confetti that fires on scroll. This is **inherited festive decoration**, not this brand's identity. The same composition appears on every festive snack site during the season. It's the moment a stranger looks at the page and says "that's a template." It also forces every product card inside into a candy-box pastel (`#FCEFC0`) that has no relationship to the rest of the page.

**Fix:** `redesign` — remove the ornament frame, gold gradient title, and confetti. Let the bestseller section earn attention through the food, not through decorations.

### 2. The "Healthy Snacking" gradient + shine animation (P0)

`healthy-snacking.tsx` puts a 3-color gradient behind the section (`#FAEFEB`, `#FFF0EA`) and then runs a `background-position` shine animation across the orange gradient heading. Two moving gradients on one screen. The first viewport also uses a `#F5F6F5 → #FCF3E3 → #C3E0C5` gradient that does the same work.

**Fix:** `recolor` — one quiet surface color per section, zero animated gradients.

### 3. Blue as the only brand color (P0)

`#0C5273` (a desaturated navy) is the entire color identity on a brand selling warm, crunchy, roast-y snacks. It's used for the CTA, borders, the cart stepper, the login button, and even the text color of testimonial titles. The brand has no color strategy — it has one hue.

**Fix:** `recolor` — build a palette that tastes like the food (warm browns, turmeric, chilli reds) with one accent hue, and keep `#0C5273` only where it genuinely earns the spot.

### 4. Centered everything, no composition (P1)

`category-grid`, `healthy-snacking`, `customer-testimonials`, and the hero all use centered headlines with equal cards and horizontal scrollers. The page reads as a stack of identical sections rather than a directed sequence. The section titles are also copy-pasted with the same `font-bold` + `text-gray-900` — no type hierarchy across sections.

**Fix:** `relayout` — alternate composition: one left-aligned, one right-aligned, one editorial, one comparison.

### 5. Type with no system (P1)

Section titles jump between `text-xl`, `text-2xl`, `text-3xl`, `text-4xl` and inline `clamp()` values with no shared scale. A single page shows `text-[48px]` gold bestseller title next to `text-lg` grey headings next to `clamp(22px, 3.5vw, 34px)` sale headings. There is no type system, just per-section choices.

**Fix:** `typeset` — one scale, one measure, one rhythm.

### 6. Eyebrow/sale pills and emoji everywhere (P1)

The sale strip and sale section both use `🔥` in the heading and eyebrow pill ("Sale Live Now", "Limited Time"), plus gradient-red buttons with `→`. The same emoji-and-gradient energy that marks a template. `SaleStrip` and `sale-section` are two different sale treatments on one page.

**Fix:** `writing` + `recolor` — one sale voice, one sale surface, no emoji.

### 7. Toy motion and celebration energy (P1)

Confetti fires when the bestseller section scrolls into view. The hero, bestseller, and healthy sections all autoplay carousels. Every add-to-cart button fires a spark burst. Swaying ornaments animate continuously. The page is telling you to celebrate at every moment, which makes the moments where the product matters feel flat.

**Fix:** `motion` — one entrance system, restrained; no autoplay on three carousels at once, no confetti, no spark on every add.

### 8. Equal testimonial cards, no priority (P2)

`customer-testimonials` renders a grid of equal bordered cards with an icon avatar circle, title, text, and name — the generic testimonial reflex. Nothing ranks, nothing shows the strongest praise first, no star treatment, no verified badge.

**Fix:** `relayout` — lead with one strong testimonial, let the rest follow.

---

## What's Working

- **The food carries the page.** The hero, category grid, bestseller, and sale sections all show real product photography — the brand's actual assets. The evidence bar is met: a stranger could see this is a snack brand from the images alone.
- **Real products and real states.** Out-of-stock, cart quantity, empty states, and discount badges exist and are wired to real data.
- **A real difference engine exists.** `WhyChooseUs` shows a comparison table image (no palm oil, no maida, wide range) — the strongest differentiator on the page, currently buried as a single centered image.
- **Mobile responsiveness is present.** The hero swaps mobile/desktop carousels, sections restack, and safe-area handling exists.
- **Accessible basics hold.** Alt text, aria labels on carousel buttons, and disabled states are implemented.

---

## Cognitive Load / Risk

- **PASS** — Real food photography everywhere; the product is the proof.
- **WATCH** — Three autoplaying carousels on one page compete for attention.
- **FAIL** — Generic festive decoration (gold + ornaments) reads as template, not identity.
- **FAIL** — One hue (`#0C5273`) does all the branding work; no palette.
- **FAIL** — Type sizes and colors are chosen per-section, not per-system.

---

## Next Modes

`/design redesign` → `/design recolor` → `/design typeset` → `/design motion`
