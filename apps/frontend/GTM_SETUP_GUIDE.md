# Google Tag Manager & Google Analytics 4 Setup Guide

## Step-by-Step Setup Instructions

### Part 1: Configure Google Analytics 4 in GTM Dashboard

#### 1.1 Login to GTM
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container: **GTM-TLQQ296R**

#### 1.2 Create GA4 Configuration Tag
1. Click **"Tags"** in left menu → **"New"**
2. Click on tag configuration area
3. Select **"Google Analytics: GA4 Configuration"**
4. Enter Measurement ID: **G-9EQ61GXMN3**
5. Name the tag: **"GA4 Configuration"**
6. Under **"Triggering"**, select **"All Pages"**
7. Click **"Save"**

#### 1.3 Create GA4 Event Tag
1. Click **"Tags"** → **"New"**
2. Select **"Google Analytics: GA4 Event"**
3. Configuration:
   - **Configuration Tag**: Select "GA4 Configuration" (from step 1.2)
   - **Event Name**: `{{Event}}` (use the built-in Event variable)
4. Name the tag: **"GA4 Event - All Events"**
5. Under **"Triggering"**, click trigger area
6. Click **"+"** to create new trigger
7. Choose **"Custom Event"**
8. Event name: `.*` (this regex matches all events)
9. Check **"Use regex matching"**
10. Name trigger: **"All Custom Events"**
11. Click **"Save"** on trigger
12. Click **"Save"** on tag

#### 1.4 Enable Built-in Variables
1. Click **"Variables"** in left menu
2. Under **"Built-In Variables"**, click **"Configure"**
3. Enable these variables:
   - ✅ Event
   - ✅ Page URL
   - ✅ Page Path
   - ✅ Page Hostname
   - ✅ Referrer
   - ✅ Click Element
   - ✅ Click Classes
   - ✅ Click ID
   - ✅ Click Text

#### 1.5 Submit Changes
1. Click **"Submit"** button (top right)
2. Add Version Name: "GA4 Setup with E-commerce Events"
3. Add Description: "Added GA4 configuration and event tracking"
4. Click **"Publish"**

---

### Part 2: Test Your Setup

#### 2.1 Test with GTM Preview Mode
1. In GTM, click **"Preview"** button (top right)
2. Enter your website URL: `https://frontend.krsna.site/`
3. Click **"Connect"**
4. A new window will open with **Tag Assistant** connected

#### 2.2 What to Check in Preview Mode
- **Summary Tab**: Should show your tags firing
- **Tags Fired**: Should see "GA4 Configuration" and "GA4 Event - All Events"
- **Data Layer**: Click any event to see the data being sent

#### 2.3 Test with Google Analytics DebugView
1. Open [Google Analytics](https://analytics.google.com/)
2. Select your property: **G-9EQ61GXMN3**
3. Click **"Configure"** → **"DebugView"** (left menu)
4. Keep this window open while testing your site
5. You should see real-time events appearing

---

### Part 3: Test Each Event

#### Event 1: Page View
**How to trigger:**
1. Visit any page on your site
2. Navigate to another page

**Where to check:**
- GTM Preview: Look for `page_view` event in Summary
- GA4 DebugView: Should show `page_view` event with page_path parameter

**Already Implemented:** ✅ Yes
**File:** `/src/components/analytics/page-view-tracker.tsx`

---

#### Event 2: View Item (Product Page)
**How to trigger:**
1. Click on any product from homepage or category page
2. Product detail page loads

**Where to check:**
- GTM Preview: Look for `view_item` event
- GA4 DebugView: Should show `view_item` with product details:
  - item_id
  - item_name
  - price
  - currency: INR

**Already Implemented:** ✅ Yes
**File:** `/src/components/product-page/ProductDetails.tsx`

---

#### Event 3: Add to Cart
**How to trigger:**
1. On product page, click **"Add to Cart"** button
2. Or click **"+"** button to increase quantity

**Where to check:**
- GTM Preview: Look for `add_to_cart` event
- GA4 DebugView: Should show items array with:
  - item_id
  - item_name
  - price
  - quantity
  - value (price × quantity)

**Already Implemented:** ✅ Yes
**File:** `/src/components/product-page/ActionButtons.tsx`

---

#### Event 4: Remove from Cart
**How to trigger:**
1. Open cart drawer (click cart icon)
2. Click **"-"** to decrease quantity
3. Or remove item from cart

**Where to check:**
- GTM Preview: Look for `remove_from_cart` event
- GA4 DebugView: Should show removed item details

**Already Implemented:** ✅ Yes
**File:** `/src/components/cart-drawer/CartContainer.tsx`

---

#### Event 5: Begin Checkout (Need to Implement)
**How to trigger:**
1. Add items to cart
2. Click **"Checkout"** or **"Proceed to Checkout"** button

**Where to check:**
- GTM Preview: Look for `begin_checkout` event
- GA4 DebugView: Should show all cart items with total value

**Status:** ⚠️ Hook ready, need to add to checkout button
**Action Required:** Add tracking to checkout button click

---

#### Event 6: Purchase (Need to Implement)
**How to trigger:**
1. Complete an order
2. Reach order confirmation/success page

**Where to check:**
- GTM Preview: Look for `purchase` event
- GA4 DebugView: Should show:
  - transaction_id
  - value (total order amount)
  - tax
  - shipping
  - items array

**Status:** ⚠️ Hook ready, need to add to order success page
**Action Required:** Add tracking to order confirmation

---

### Part 4: Advanced Events to Add

#### Event 7: View Item List (Product Listings)
**When:** User views category page or search results
**Hook:** `trackViewItemList(items, listName)`

#### Event 8: Select Item (Click Product)
**When:** User clicks product card to view details
**Hook:** `trackSelectItem(product)`

#### Event 9: Search
**When:** User performs search
**Custom implementation needed**

#### Event 10: Add Shipping Info
**When:** User enters shipping information
**Custom implementation needed**

#### Event 11: Add Payment Info
**When:** User selects payment method
**Custom implementation needed**

---

### Part 5: Common Issues & Solutions

#### Issue 1: GTM Container Not Loading
**Solution:**
- Check `.env` file has: `NEXT_PUBLIC_GTM_ID=GTM-TLQQ296R`
- Rebuild project: `pnpm dev`
- Clear browser cache
- Check browser console for errors

#### Issue 2: Events Not Showing in Preview
**Solution:**
- Make sure GTM Preview is connected
- Check browser console for dataLayer
- Type in console: `window.dataLayer` should show array
- Verify events are being pushed: Watch array grow when triggering events

#### Issue 3: Events in GTM but Not in GA4
**Solution:**
- Check GA4 Configuration tag is firing
- Verify Measurement ID is correct: **G-9EQ61GXMN3**
- Wait 1-2 minutes for DebugView to update
- Check GA4 tag is triggering on the custom events

#### Issue 4: Data Layer Not Defined
**Solution:**
- GTM script should initialize dataLayer automatically
- If error persists, check Script is loading with `afterInteractive` strategy
- Verify no JavaScript errors blocking execution

---

### Part 6: Quick Testing Checklist

Use this checklist when testing:

```
□ GTM Preview Mode Connected
□ Page View fires on every page navigation
□ View Item fires when opening product page
□ Add to Cart fires when clicking add to cart
□ Remove from Cart fires when removing items
□ Data appears in GA4 DebugView within 1-2 minutes
□ All ecommerce parameters are correct (price, quantity, etc.)
□ Currency shows as INR
□ No console errors
```

---

### Part 7: How to Debug

#### Method 1: Browser Console
```javascript
// Check if dataLayer exists
console.log(window.dataLayer);

// Watch dataLayer updates
window.dataLayer.push = function() {
  console.log('DataLayer Push:', arguments);
  Array.prototype.push.apply(this, arguments);
};
```

#### Method 2: GTM Preview Console
1. In Preview mode, click any event
2. View **"Data Layer"** tab
3. See exactly what data was sent

#### Method 3: Network Tab
1. Open Chrome DevTools → Network tab
2. Filter by "google-analytics.com" or "gtm"
3. Click on request to see parameters being sent

---

### Part 8: Next Steps After Setup

1. **Wait 24-48 hours** for data to appear in GA4 standard reports
2. **Create custom reports** in GA4 for e-commerce metrics
3. **Set up conversions** in GA4:
   - Mark `purchase` as conversion event
   - Mark `begin_checkout` as conversion event
4. **Configure enhanced measurement** in GA4 for automatic events
5. **Link GA4 to Google Ads** (if running ads)

---

### Resources

- [GTM Documentation](https://support.google.com/tagmanager)
- [GA4 E-commerce Events](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GTM Preview Mode Guide](https://support.google.com/tagmanager/answer/6107056)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)

---

## Quick Reference: Your IDs

- **GTM Container ID:** GTM-TLQQ296R
- **GA4 Measurement ID:** G-9EQ61GXMN3
- **Website URL:** https://frontend.krsna.site/
- **Currency:** INR (Indian Rupee)
