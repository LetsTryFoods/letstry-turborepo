# SDUI Component Documentation

This document lists all the components currently supported by the mobile app's SDUI system, organized by screen.

---

## 🧭 Server-Driven Navigation (Bottom Tabs)
The bottom tab bar of the mobile app is now fully controlled by the server via the `GET /sdui/navigation` endpoint.

### Tab Configuration (`navigation.tabs`)
- `id`: (string) Unique identifier for the tab.
- `name`: (string) Internal route name (e.g., `index`, `categories`, `profile`).
- `label`: (string) The text displayed under the icon.
- `icon`: (string) Ionicons name (e.g., `home`, `grid`, `star`).
- `screenId`: (string) The ID used to fetch the SDUI layout for this tab.
- `order`: (number) The sorting order.

---

## 📱 Generic Dynamic Screens
If a tab's `name` does not match an existing hardcoded screen (like `index` or `profile`), the app routes to a **Generic Screen Handler**. 
The app will automatically request `GET /sdui/screen/:screenId` and render any combination of registered SDUI components. 

*Example:* The **Loyalty** tab uses the generic screen engine to render a custom banner and notice without requiring a specific `loyalty.tsx` file in the mobile codebase.

---

## 🏠 Home Screen (`HomeScreen`)
The following components are available for the Home page configuration.

### 1. TopBanner
A thin notification or promotional banner usually placed at the top.
- `visible`: (boolean) Show or hide the banner.
- `imageUrl`: (string) URL of the banner image.
- `aspectRatio`: (number) Controls the height relative to width (e.g., `10` for a thin banner).

### 2. Bestsellers / Combos (HorizontalSection)
A horizontal scrolling row of product cards.
- `title`: (string) The header text for the section.
- `cardStyles`: (object) Controls the look of the individual product cards:
    - `borderColor`: (hex string)
    - `borderWidth`: (number)
    - `borderRadius`: (number)
    - `backgroundColor`: (hex string)
    - `elevation`: (number) Shadow intensity for Android.

### 3. Categories (Grid)
Shows the "Shop By Categories" grid layout.
- `title`: (string) Header text for the section.
- `numColumns`: (number) Number of items per row (e.g., `3` or `4`).
- `showSeeAll`: (boolean) Toggle the "See all" button.

### 4. BannerCarousel
A customizable sliding image carousel with parallax effects.
- `items`: (array) List of objects: `[{ imageUrl: "...", action: { ... } }]`
- `height`: (number) Height in pixels.
- `borderRadius`: (number) Corner rounding.
- `autoplayInterval`: (number) Time in milliseconds (e.g., `6000`).

---

## 🥗 Categories Screen (`CategoriesScreen`)

### 1. CategoriesHeader
The top bar for the categories screen.
- `showSearch`: (boolean) Toggle the search icon.
- `styleConfig`: (object)
    - `backgroundColor`: (hex string)
    - `textColor`: (hex string)
    - `iconColor`: (hex string)
    - `borderBottomColor`: (hex string)

### 2. CategoriesSplitView
The main layout with sidebar and product grid.
- `styleConfig`: (object)
    - `sidebarActiveBg`: (hex string)
    - `sidebarActiveText`: (hex string)
    - `sidebarInactiveText`: (hex string)
    - `sidebarInactiveBg`: (hex string)
    - `gridBackgroundColor`: (hex string)

---

## 👤 Profile Screen (`ProfileScreen`)

### 1. ProfileHeader
- `title`: (string) Header text.
- `textColor`: (hex string)

### 2. AuthCard
Login/Signup status card.
- `accentColor`: (hex string) Primary button/link color.
- `cardBackgroundColor`: (hex string)

### 3. LinkSection
A list of navigation links (e.g., "My Orders", "Track Order").
- `title`: (string) Section header text.
- `iconColor`: (hex string)
- `links`: (array) 
    - `id`: (string)
    - `label`: (string)
    - `icon`: (string) Ionicons name.
    - `requiresAuth`: (boolean) Hide if user is not logged in.
    - `action`: (Action object) See Action section.

---

## 🛠️ Generic Components & Forms
Used in `GenericScreen` (like Loyalty) or inside other screens.

### 1. SDUIForm
A container for handling user input and submission.
- `padding`: (number)
- `onSubmit`: (Action object) e.g., `API_CALL`.
- `fields`: (array) List of nested SDUI components (TextInput, Button, etc.).

### 2. SDUITextInput
- `name`: (string) The key used in the form data.
- `label`: (string)
- `placeholder`: (string)
- `keyboardType`: (string) `default`, `phone-pad`, `email-address`.

### 3. SDUIButton
- `label`: (string)
- `isSubmit`: (boolean) Triggers form submission if true.
- `backgroundColor`: (hex string)
- `textColor`: (hex string)

---

## 🛒 Cart Drawer (`CartDrawer`)
### 1. Cart Notice
- `text`: (string)
- `backgroundColor`: (hex string)
- `textColor`: (hex string)
- `borderColor`: (hex string)
- `borderWidth`: (number)
- `borderRadius`: (number)

### 2. Checkout Button Styling
- `label`: (string)
- `backgroundColor`: (hex string)
- `textColor`: (hex string)
- `borderRadius`: (number)
- `showArrow`: (boolean)

---

## ⚡ Actions
Used in buttons, links, and banners.
- `NAVIGATE`: `{ type: 'NAVIGATE', destination: '/route' }`
- `API_CALL`: `{ type: 'API_CALL', endpoint: '...', method: 'POST', payload: { ... } }`
- `SHOW_TOAST`: `{ type: 'SHOW_TOAST', message: '...' }`
- `OPEN_URL`: `{ type: 'OPEN_URL', url: '...' }`

