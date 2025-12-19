# Authentication Architecture - Optimized with Zustand

## Overview
The authentication system has been refactored to use **Zustand** as the single source of truth, eliminating the redundant Context layer and React Query dependency.

## Key Improvements

### 1. **Single Source of Truth**
- All authentication state is now managed in `src/stores/auth-store.ts`
- No more Context + Zustand duplication
- No more React Query cache for auth state

### 2. **Simplified Architecture**

```
┌─────────────────────────────────────────┐
│         useAuthStore (Zustand)          │
│  ┌───────────────────────────────────┐  │
│  │ State:                            │  │
│  │ - user                            │  │
│  │ - isAuthenticated                 │  │
│  │ - isGuest                         │  │
│  │ - isLoading                       │  │
│  │ - error                           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Actions:                          │  │
│  │ - initialize()                    │  │
│  │ - loginWithPhone()                │  │
│  │ - verifyOTP()                     │  │
│  │ - logout()                        │  │
│  │ - setGuestMode()                  │  │
│  │ - clearError()                    │  │
│  │ - refreshToken()                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↑
              │ (Direct access)
              │
    ┌─────────┴─────────┐
    │                   │
 Navbar          Profile Pages
 LoginModal      Other Components
```

### 3. **How It Works**

#### Initialization
```typescript
// In AuthProvider (minimal wrapper)
const initialize = useAuthStore((state) => state.initialize);

useEffect(() => {
  initialize(); // Sets up Firebase listener & loads user from cookies
}, [initialize]);
```

#### Login Flow
```typescript
// 1. User enters phone number
const confirmationResult = await loginWithPhone(phoneNumber);

// 2. User enters OTP
await verifyOTP(confirmationResult, otp);

// 3. Store automatically updates with user data
// Components re-render automatically via Zustand subscription
```

#### State Access in Components
```typescript
// Option 1: Use the hook (recommended for backward compatibility)
import { useAuth } from '@/providers/auth-provider';
const { user, isAuthenticated, logout } = useAuth();

// Option 2: Use store directly (more explicit)
import { useAuthStore } from '@/stores/auth-store';
const { user, isAuthenticated, logout } = useAuthStore();
```

## File Structure

```
src/
├── stores/
│   ├── auth-store.ts           # Main auth state & logic (Zustand)
│   └── login-modal-store.ts    # Modal visibility state (Zustand)
│
├── providers/
│   └── auth-provider.tsx       # Minimal wrapper, just calls initialize()
│
├── hooks/
│   └── use-phone-auth.ts       # Phone auth UI logic
│
└── lib/
    ├── auth/
    │   ├── auth-actions.ts     # Server actions (cookies, backend API)
    │   └── graphql-auth.ts     # GraphQL mutations
    └── firebase/
        ├── config.ts           # Firebase setup
        └── auth-service.ts     # Firebase auth methods
```

## State Management Details

### Auth Store (`auth-store.ts`)
- **State**: User data, loading, errors, authentication status
- **Actions**: All auth operations (login, logout, verify, etc.)
- **Firebase Listener**: Set up in `initialize()`, syncs Firebase auth state
- **Token Management**: Stores `idToken` in state, refreshes automatically

### Login Modal Store (`login-modal-store.ts`)
- **State**: Modal open/close state
- **Actions**: `openModal()`, `closeModal()`
- **Purpose**: UI state only, separate from auth logic

## Benefits

✅ **No Redundancy**: Single store instead of Context + Zustand + React Query  
✅ **Better Performance**: Direct store access, no Context re-renders  
✅ **Simpler Code**: All logic in one place  
✅ **Type Safety**: Full TypeScript support  
✅ **Easier Testing**: Pure functions in store  
✅ **Token Persistence**: Proper `idToken` storage and refresh  
✅ **Firebase Sync**: Automatic sync with Firebase auth state  

## Migration Notes

### Before (Old Pattern)
```typescript
// Multiple layers of abstraction
useAuthQuery() → AuthProvider → Context → Components
```

### After (New Pattern)
```typescript
// Direct access
useAuthStore() → Components
```

### Backward Compatibility
The `useAuth()` hook is still exported from `auth-provider.tsx` for backward compatibility:
```typescript
export function useAuth() {
  return useAuthStore();
}
```

This means existing components don't need to be updated immediately.

## Common Patterns

### Check Authentication Status
```typescript
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
```

### Get User Data
```typescript
const user = useAuthStore((state) => state.user);
```

### Perform Actions
```typescript
const logout = useAuthStore((state) => state.logout);
await logout();
```

### Subscribe to Specific Fields (Performance)
```typescript
// Only re-renders when isAuthenticated changes
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Re-renders on any state change
const { user, isAuthenticated, isLoading } = useAuthStore();
```

## Error Handling

Errors are stored in the `error` field and can be cleared:
```typescript
const { error, clearError } = useAuthStore();

// Clear error when user dismisses
clearError();
```

## Token Refresh

Tokens are automatically refreshed via the Firebase listener. Manual refresh:
```typescript
const refreshToken = useAuthStore((state) => state.refreshToken);
await refreshToken();
```
