# Google Analytics 4 Implementation Guide

## ✅ Implementation Complete

### Files Created:

1. **`/src/lib/analytics/google-analytics.ts`** - GA4 core functions
2. **`/src/components/analytics/google-analytics.tsx`** - GA4 Script component
3. **`/src/hooks/use-analytics.ts`** - Analytics hook with all e-commerce tracking
4. **`/src/components/analytics/page-view-tracker.tsx`** - Auto page view tracking
5. **`/src/hooks/use-checkout-tracking.ts`** - Checkout & purchase tracking helper

### Files Updated:

1. **`/src/app/layout.tsx`** - Added GA4 script and PageViewTracker
2. **`/src/components/product-page/ActionButtons.tsx`** - Track add_to_cart
3. **`/src/components/product-page/ProductDetails.tsx`** - Track view_item
4. **`/src/components/cart-drawer/CartContainer.tsx`** - Track remove_from_cart

---

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.local` in `/apps/frontend/`:

```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use existing one
3. Go to Admin → Data Streams → Web
4. Copy your Measurement ID (format: G-XXXXXXXXXX)
5. Add it to `.env.local`

---

## 📊 Automatic Tracking (Already Implemented)

### ✅ **Page Views**
Automatically tracked on every route change

### ✅ **Product Views**
Tracked when user views a product detail page

### ✅ **Add to Cart**
Tracked when user clicks "Add to cart" button

### ✅ **Remove from Cart**
Tracked when user removes item from cart

---

## 🛒 Manual Implementation Needed

### **Begin Checkout**

Add this to your checkout page/button:

```typescript
import { useCheckoutTracking } from '@/hooks/use-checkout-tracking';

export function CheckoutButton() {
  const { trackCheckoutStart } = useCheckoutTracking();
  const { data: cartData } = useCart();

  const handleCheckout = () => {
    trackCheckoutStart(cartData);
    // ... your checkout logic
  };

  return <button onClick={handleCheckout}>Proceed to Checkout</button>;
}
```

### **Purchase Complete**

Add this to your order confirmation page:

```typescript
import { useCheckoutTracking } from '@/hooks/use-checkout-tracking';

export function OrderConfirmationPage({ orderData }: Props) {
  const { trackOrderComplete } = useCheckoutTracking();

  useEffect(() => {
    if (orderData) {
      trackOrderComplete(orderData);
    }
  }, [orderData]);

  return <div>Order Complete!</div>;
}
```

---

## 🎯 Available Tracking Methods

From `useAnalytics()` hook:

```typescript
const {
  trackPageView,        // Track page navigation
  trackEvent,           // Track custom events
  trackViewItem,        // Track product view
  trackAddToCart,       // Track add to cart
  trackRemoveFromCart,  // Track remove from cart
  trackBeginCheckout,   // Track checkout start
  trackPurchase,        // Track completed purchase
  trackViewItemList,    // Track product list view
  trackSelectItem,      // Track product click in list
  setUser,              // Set user ID & properties
} = useAnalytics();
```

---

## 📈 Custom Event Tracking Examples

### Track Button Click
```typescript
const { trackEvent } = useAnalytics();

trackEvent('button_click', {
  button_name: 'subscribe_newsletter',
  location: 'footer',
});
```

### Track Search
```typescript
trackEvent('search', {
  search_term: 'organic snacks',
});
```

### Track Form Submit
```typescript
trackEvent('form_submit', {
  form_name: 'contact_us',
  form_destination: '/thank-you',
});
```

### Set User Properties
```typescript
const { setUser } = useAnalytics();

setUser(user.id, {
  user_type: 'premium',
  signup_date: user.createdAt,
});
```

---

## 🧪 Testing Your Implementation

### 1. Enable Debug Mode

In browser console:
```javascript
window.gtag('config', 'G-XXXXXXXXXX', { debug_mode: true });
```

### 2. Use GA Debug View

1. Go to GA4 → Admin → DebugView
2. Enable debug mode (add `?debug_mode=true` to URL)
3. Perform actions on your site
4. See events in real-time

### 3. Check Browser Console

Events are also sent to dataLayer:
```javascript
console.log(window.dataLayer);
```

---

## 📱 Tracking Product Lists (Additional)

For category pages, bestsellers, etc.:

```typescript
import { useAnalytics } from '@/hooks/use-analytics';

export function ProductList({ products }: Props) {
  const { trackViewItemList, trackSelectItem } = useAnalytics();

  useEffect(() => {
    trackViewItemList(
      products.map((p, index) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        position: index,
      })),
      'Bestsellers'
    );
  }, [products]);

  const handleProductClick = (product: any, position: number) => {
    trackSelectItem({
      id: product.id,
      name: product.name,
      price: product.price,
      position,
      listName: 'Bestsellers',
    });
  };

  return (
    <div>
      {products.map((product, index) => (
        <div key={product.id} onClick={() => handleProductClick(product, index)}>
          {product.name}
        </div>
      ))}
    </div>
  );
}
```

---

## ✨ Benefits

- **Dual Tracking**: Both GTM + GA4 for maximum flexibility
- **E-commerce Ready**: Full GA4 e-commerce event schema
- **User Tracking**: Track logged-in users with user_id
- **Custom Events**: Easy to add custom tracking
- **Type-safe**: Full TypeScript support
- **Performance**: Scripts load with `afterInteractive` strategy

---

## 🔍 Verify Implementation

1. Open your site
2. Open DevTools → Network tab
3. Filter by "gtag" or "analytics"
4. Perform actions (view product, add to cart)
5. See requests to Google Analytics

---

## Need Help?

Check GA4 reports:
- **Realtime**: See live user activity
- **Events**: View all tracked events
- **Ecommerce purchases**: Track revenue
- **User properties**: Segment users

All tracking is configured for INR currency as per your e-commerce setup.
