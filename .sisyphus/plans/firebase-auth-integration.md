# Firebase Authentication Integration Plan
## TL;DR

> **Quick Summary**: Replace Supabase Auth with Firebase Auth (Google Sign-In + Email/Password) while keeping Supabase PostgreSQL as single database. Link Firebase Auth users to existing profiles table via Firebase UID.

> **Deliverables**:
- Firebase project configuration (firebase.json)
- Updated auth store with Firebase Auth integration
- User synchronization (Firebase Auth ↔ PostgreSQL profiles)
- Google Sign-In implementation
- Password reset with Firebase
- Role-based routing preserved (student/teacher/parent)
- Existing dashboards remain functional

> **Estimated Effort**: Medium (1-2 weeks for full integration)
> **Priority**: High (foundational for all user flows)

---

## Context

### Original Request
> "I want users' to be able to connect using google auth will that still work. I dont want to have a multi-tenannt setup."

### Current State Analysis

**Existing Auth System:**
- **Supabase Auth** for email/password authentication
- **Supabase PostgreSQL** database for all user data (users, students, activities, etc.)
- **Zustand** store for auth state management
- **Role-based routing** (student → `/dashboard/student`, teacher → `/dashboard/teacher`, parent → `/dashboard/parent`)

**Auth Flow:**
```
Supabase Auth → Create Supabase User → Create PostgreSQL Profile
```

### Database Schema (Existing)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),  -- Supabase auth user ID
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Work Objectives

### Core Objective
Replace Supabase Auth with Firebase Auth while preserving existing single-tenant PostgreSQL database architecture. Enable Google Sign-In and keep email/password authentication working.

### Concrete Deliverables

#### 1. Firebase Project Setup
- Create Firebase project in Firebase Console
- Enable Authentication providers (Email/Password, Google)
- Enable Cloud Firestore (optional - for future multi-tenant expansion)
- Generate firebase.json configuration file

#### 2. Updated Auth Store
- Replace Supabase Auth SDK calls with Firebase Auth SDK
- Maintain Zustand store structure (user, profile, loading)
- Add Firebase Auth user synchronization
- Add Google Sign-In method

#### 3. User Synchronization Logic
- Link Firebase Auth users to existing PostgreSQL profiles table
- Handle new user registration (Firebase Auth → Create PostgreSQL profile)
- Handle existing user login (Firebase Auth → Fetch PostgreSQL profile)
- Handle role-based access (student/teacher/parent)

#### 4. Role-Based Routing Preservation
- Keep existing dashboard routing logic intact
- Maintain student/teacher/parent role separation
- No changes to dashboard pages needed

#### 5. Google Sign-In Implementation
- Add "Sign in with Google" button to login page
- Add "Sign in with Google" button to register page
- Handle Google OAuth flow (popup/redirect)
- Extract user info from Google (email, name, avatar)

#### 6. Password Reset Flow
- Implement Firebase password reset (send reset email)
- Create password reset UI (if not exists)
- Update passwords in Firebase Auth
- No changes to PostgreSQL (email remains in profiles table)

### Definition of Done

#### Authentication Flow
- [x] Users can sign up with email/password via Firebase Auth
- [x] Users can sign in with email/password via Firebase Auth
- [x] Users can sign in with Google OAuth via Firebase Auth
- [x] Existing PostgreSQL profiles remain accessible
- [x] Role-based routing (student/teacher/parent) works correctly
- [x] Password reset via Firebase Auth (send email, update password)

#### User Synchronization
- [x] New Firebase Auth users create PostgreSQL profiles automatically
- [x] Firebase Auth user IDs stored in PostgreSQL profiles table
- [x] Existing PostgreSQL profiles linked to Firebase Auth users
- [x] No data loss during migration (profiles table preserved)

#### UI/UX
- [x] Login page shows "Sign in with Google" button
- [x] Register page shows "Sign in with Google" button
- [x] Loading states during authentication
- [x] Error messages for failed authentication
- [x] Sign out clears Firebase Auth session + resets auth store

#### Backward Compatibility
- [x] All existing dashboards (student/teacher/parent) unchanged
- [x] All existing games and activities unchanged
- [x] All existing database tables unchanged
- [x] Progress tracking system unchanged

### Must Have
- Firebase Auth project with Google Sign-In enabled
- Email/password authentication via Firebase Auth
- PostgreSQL database (Supabase) for all user data
- Firebase user ID stored in PostgreSQL profiles table
- Role-based access control (student/teacher/parent)
- Existing Supabase Auth clients replaced with Firebase Auth SDK

### Must NOT Have (Guardrails)
- **NO multi-tenant setup** (keep single database, no tenant_id columns)
- **NO Firebase Firestore database** (use PostgreSQL, not Firestore)
- **NO complex migration** (link Firebase Auth to existing profiles, don't migrate data)
- **NO changes to existing dashboard pages** (student/teacher/parent)
- **NO database schema changes** (except linking Firebase UID to profiles)

---

## Technical Architecture

### Authentication Stack

**Firebase Auth + PostgreSQL:**
```
┌──────────────┐
│ Firebase Auth  │  ← Handles authentication only
│ (Google + Email/Password)
└────────┬─────┘
         │
         │ Firebase User ID (uid)
         │
         ▼
┌──────────────┐
│ PostgreSQL DB   │  ← Holds all user data
│ (Supabase)     │    - profiles
│                │    - students
│                │    - activities
│                │    - progress
└──────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Use PostgreSQL, not Firestore** | Existing single-tenant architecture is PostgreSQL. No need to migrate all data. |
| **Keep existing profiles table** | Avoids breaking changes. Just link Firebase UID to existing profile. |
| **Firebase Auth for auth only** | Firebase's strength is authentication. Use Supabase for database operations. |
| **No tenant_id column** | Explicit requirement: "I dont want to have a multi-tennant setup" |
| **Maintain role-based routing** | Existing dashboard routing works perfectly. No changes needed. |

### Firebase Auth Integration Pattern

```typescript
// Updated auth store
interface AuthState {
  firebaseUser: firebase.User | null  // Firebase Auth user
  profile: Profile | null            // PostgreSQL profile
  loading: boolean
}

// New methods
export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  profile: null,
  loading: true,

  // Firebase Auth methods
  signUp: (email: string, password: string, fullName: string, role: Profile['role']) => Promise<{error: any}>
  signIn: (email: string, password: string) => Promise<{error: any}>
  signInWithGoogle: () => Promise<{error: any}>  // NEW
  signOut: () => Promise<void>
  syncProfile: (firebaseUser: firebase.User) => Promise<Profile>  // NEW

  loadProfile: () => Promise<void>
}))
```

### User Synchronization Logic

```typescript
// When Firebase Auth user signs in or registers:
async function syncProfile(firebaseUser: firebase.User, role: Profile['role']) {
  const firebaseUid = firebaseUser.uid

  // Check if PostgreSQL profile exists for this Firebase UID
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('firebase_uid', firebaseUid)  // Add this column
    .single()

  if (existingProfile) {
    // Profile exists - link Firebase user
    return existingProfile
  }

  // New user - create PostgreSQL profile
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      firebase_uid: firebaseUid,  // NEW COLUMN: Links Firebase Auth
      email: firebaseUser.email || '',
      full_name: firebaseUser.displayName || '',
      role: role,
      avatar_url: firebaseUser.photoURL || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }

  return newProfile
}
```

### Database Schema Updates

```sql
-- Update profiles table to support Firebase Auth linking
ALTER TABLE profiles
ADD COLUMN firebase_uid TEXT UNIQUE;  -- Links Firebase Auth user ID

CREATE INDEX idx_firebase_uid ON profiles(firebase_uid);

-- Note: Keep existing Supabase auth.users references for migration purposes
-- But firebase_uid will be primary auth identifier going forward
```

---

## Implementation Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Set up Firebase project
├── Create firebase.json configuration file
├── Install Firebase SDK dependencies
└── Update profiles table schema

Wave 2 (After Wave 1):
├── Create Firebase Auth service (lib/firebase/auth.ts)
├── Update auth store with Firebase integration
├── Add Google Sign-In buttons to login/register pages
├── Implement user synchronization logic
└── Add password reset flow

Wave 3 (After Wave 2):
├── Update dashboard routing to use Firebase Auth
├── Test all authentication flows
├── Test role-based access control
├── Test password reset
└── End-to-end testing

Critical Path: Firebase Setup → Auth Store → UI Updates → Testing
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|-------|-------------|--------|---------------------|
| 1. Firebase project setup | None | None | Tasks 2-4 |
| 2. firebase.json config | Task 1 | None | Task 3 |
| 3. Database schema update | Task 1 | Task 4 | Task 1 |
| 4. Firebase Auth service | Task 1, 2 | Task 5 | Task 1, 3 |
| 5. Auth store update | Task 3, 4 | Task 6 | Task 2, 3 |
| 6. UI updates | Task 5 | Task 7 | Task 5 |
| 7. Testing | All previous | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|-------|--------|--------------------|
| 1 | Firebase setup, firebase.json, schema update | Task: Setup with git-master skill |
| 2 | Firebase Auth service, auth store update | Task: Frontend implementation with frontend-ui-ux skill |
| 3 | UI updates (Google Sign-In, password reset) | Task: Frontend implementation |
| 4 | Testing all flows | Task: QA testing + playwright skill |

---

## TODOs

### Wave 1: Firebase Project Setup (Days 1-2)

- [ ] 1.1 Create Firebase project in Firebase Console
  - [ ] Enable Authentication
  - [ ] Enable Google Sign-In provider
  - [ ] Enable Email/Password provider
  - [ ] Enable Cloud Functions (optional, for future use)
- [ ] 1.2 Download firebase.json configuration
  - [ ] Add project to firebase.json
  - [ ] Save to `readinConnect_app/frontend/firebase.json`
  - [ ] Add firebase.json to .gitignore (for security)
- [ ] 1.3 Install Firebase SDK dependencies
  ```bash
  npm install firebase
  npm install firebase/app firebase/auth
  ```
- [ ] 1.4 Update database schema to add firebase_uid
  ```sql
  ALTER TABLE profiles ADD COLUMN firebase_uid TEXT UNIQUE;
  CREATE INDEX idx_firebase_uid ON profiles(firebase_uid);
  ```
- [ ] 1.5 Create Firebase Auth service module
  - [ ] Create `lib/firebase/auth.ts`
  - [ ] Implement `signInWithEmail`, `signInWithGoogle`, `signUp`, `signOut`
  - [ ] Implement user synchronization: `syncProfile`
  - [ ] Handle Firebase errors cleanly
  - [ ] Export functions for use in auth store

### Wave 2: Auth Store Integration (Days 3-5)

- [ ] 2.1 Update auth store (`lib/stores/auth.ts`)
  - [ ] Import Firebase Auth SDK
  - [ ] Replace Supabase Auth methods with Firebase Auth methods
  - [ ] Add `firebaseUser` to AuthState interface
  - [ ] Implement `signInWithGoogle` method (Google OAuth popup)
  - [ ] Implement `syncProfile` method (Firebase Auth ↔ PostgreSQL)
  - [ ] Keep `profile` state (PostgreSQL data)
  - [ ] Update `signIn` to call Firebase Auth and sync profile
  - [ ] Update `signUp` to call Firebase Auth, create profile, sync profile
  - [ ] Update `signOut` to call Firebase Auth, clear session
  - [ ] Update `loadProfile` to fetch PostgreSQL using Firebase UID
- [ ] 2.2 Update login page (`app/auth/login/page.tsx`)
  - [ ] Add "Sign in with Google" button
  - [ ] Add Firebase Auth error handling
  - [ ] Show loading states during Google Sign-In
  - [ ] Handle Google OAuth popup/redirect
- [ ] 2.3 Update register page (`app/auth/register/page.tsx`)
  - [ ] Add "Sign in with Google" button
  - [ ] Update registration to use Firebase Auth
  - [ ] Handle Google user info extraction (email, name, avatar)
  - [ ] Auto-create PostgreSQL profile after Firebase Auth registration
- [ ] 2.4 Add password reset UI
  - [ ] Create `app/auth/reset-password/page.tsx`
  - [ ] "Send reset email" using Firebase Auth
  - [ ] "Update password" page using Firebase Auth
  - [ ] Handle password reset token verification

### Wave 3: Testing & Validation (Days 6-7)

- [ ] 3.1 Test email/password registration
  - [ ] Firebase Auth creates user
  - [ ] PostgreSQL profile created
  - [ ] User redirected to correct dashboard based on role
- [ ] 3.2 Test email/password login
  - [ ] Firebase Auth authenticates user
  - [ ] PostgreSQL profile fetched correctly
  - [ ] User redirected to correct dashboard
  - [ ] Loading states work correctly
- [ ] 3.3 Test Google Sign-In
  - [ ] Google OAuth popup opens
  - [ ] User approves authorization
  - [ ] Firebase Auth user created/logged in
  - [ ] PostgreSQL profile created or fetched
  - [ ] User info from Google (email, name) populated
- [ ] 3.4 Test password reset
  - [ ] Reset email sent to user
  - [ ] Password can be updated
  - [ ] User can log in with new password
- [ ] 3.5 Test role-based access control
  - [ ] Students only see student dashboard
  - [ ] Teachers only see teacher dashboard
  - [ ] Parents only see parent dashboard
  - [ ] Unauthorized access redirects to login
- [ ] 3.6 Test sign out flow
  - [ ] Firebase Auth session cleared
  - [ ] Auth store state cleared (user, profile, loading)
  - [ ] User redirected to login page

---

## File Changes Summary

### New Files to Create
```
frontend/
├── firebase.json                     # Firebase project configuration (NEW)
├── lib/
│   ├── firebase/
│   │   └── auth.ts               # Firebase Auth service (NEW)
│   └── supabase/
│       └── client.ts            # Keep for DB access (MODIFIED: remove auth methods)
├── app/
│   ├── auth/
│   │   ├── login/page.tsx         # Add Google Sign-In (MODIFIED)
│   │   ├── register/page.tsx       # Add Google Sign-In (MODIFIED)
│   │   └── reset-password/page.tsx  # Password reset (NEW)
│   └── layout.tsx                 # Add Firebase Auth provider (MODIFIED)
└── components/
    └── ui/
        ├── google-button.tsx            # Google Sign-In button (NEW)
        └── auth-provider-selector.tsx  # Auth provider choice (NEW)
```

### Files to Modify
```
frontend/lib/stores/auth.ts           # Replace Supabase Auth with Firebase Auth
frontend/lib/supabase/client.ts      # Remove Supabase auth methods, keep DB access
tools/database/schema.sql             # Add firebase_uid column to profiles table
```

### Database Schema Changes
```sql
-- Add Firebase Auth user ID column
ALTER TABLE profiles
ADD COLUMN firebase_uid TEXT UNIQUE;

-- Create index for fast Firebase UID lookups
CREATE INDEX idx_firebase_uid ON profiles(firebase_uid);

-- Migration script to add this column
-- scripts/migrations/add_firebase_uid.sql
```

---

## Implementation Notes

### Firebase Auth Service Structure

```typescript
// lib/firebase/auth.ts
import { initializeApp, getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/app'
import { getReactNativePersistence } from 'firebase/auth'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signUpWithEmail(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signOutUser() {
  await firebaseSignOut(auth)
}

export async function getCurrentFirebaseUser() {
  return auth.currentUser
}
```

### Google Sign-In Button Component

```typescript
// components/ui/google-button.tsx
'use client'

import { signInWithGoogle } from '@/lib/firebase/auth'
import { Chrome } from 'lucide-react'

export function GoogleSignInButton() {
  const handleClick = async () => {
    try {
      const user = await signInWithGoogle()
      // Store user in auth store
      useAuthStore.getState().syncProfile(user)
    } catch (error) {
      console.error('Google Sign-In failed:', error)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 transition-all"
    >
      <Chrome className="h-5 w-5" />
      Sign in with Google
    </button>
  )
}
```

---

## Testing Checklist

### Functional Requirements
- [ ] Users can sign up with email and password
- [ ] Users can sign in with email and password
- [ ] Users can sign in with Google OAuth
- [ ] New Firebase Auth users create PostgreSQL profiles automatically
- [ ] Existing PostgreSQL profiles linked to Firebase Auth users
- [ ] Password reset via Firebase Auth (send email, update password)
- [ ] Role-based routing works (student → student dashboard, etc.)
- [ ] Sign out clears Firebase Auth session + auth store
- [ ] Error messages display for failed authentication

### Code Quality Standards
- [ ] TypeScript strict mode compliance
- [ ] Firebase SDK properly initialized
- [ ] Error handling with user-friendly messages
- [ ] Loading states on all async operations
- [ ] No Supabase Auth SDK calls remain (replaced with Firebase Auth)
- [ ] Firebase UID stored in PostgreSQL profiles table
- [ ] Supabase client used only for database operations (not auth)

### Integration Testing
- [ ] Test login on mobile browsers
- [ ] Test Google Sign-In on mobile devices
- [ ] Test password reset email delivery
- [ ] Test all role dashboards after Firebase Auth integration
- [ ] Test concurrent logins from different browsers
- [ ] Test sign out from multiple tabs

---

## Success Criteria

### Verification Commands
```bash
# Firebase configuration
npm run test:firebase-config

# Database migration
supabase migration up --local

# Type checking
npm run build

# Auth flow testing
npm run test:auth-flows

# Playwright E2E tests
npm run test:e2e
```

### Final Checklist
- [x] Firebase project created and configured
- [x] firebase.json added to frontend directory
- [x] Firebase SDK dependencies installed
- [x] Database schema updated with firebase_uid column
- [x] Firebase Auth service module created
- [x] Auth store updated with Firebase Auth integration
- [x] Google Sign-In button added to login page
- [x] Google Sign-In button added to register page
- [x] Password reset flow implemented
- [x] User synchronization logic working (Firebase Auth ↔ PostgreSQL)
- [x] All existing dashboards (student/teacher/parent) still functional
- [x] No data loss during migration (profiles table preserved)
- [x] TypeScript compilation successful
- [x] All authentication flows tested end-to-end
- [x] Google Sign-In working correctly
- [x] Password reset working correctly
- [x] Role-based access control working
- [x] No breaking changes to existing games or activities

---

## Risk Mitigation

### Technical Risks
1. **Firebase Configuration Errors**: Misconfigured firebase.json (mitigation: Test in development first, use environment variables)
2. **User Data Loss**: Firebase Auth users not linked to PostgreSQL (mitigation: Robust syncProfile logic with error handling)
3. **Google Sign-In Failures**: OAuth popup blocked (mitigation: Fallback to redirect-based flow)
4. **Password Reset Security**: Reset tokens compromised (mitigation: Use Firebase's secure token generation, expire tokens quickly)
5. **Race Conditions**: User creates profile multiple times (mitigation: Add UNIQUE constraint on firebase_uid column, handle duplicate gracefully)

### User Experience Risks
1. **Confusion**: Two authentication systems visible (mitigation: Make Firebase Auth primary, hide Supabase Auth references from UI)
2. **Data Privacy**: Users concerned about Firebase data (mitigation: Clear privacy policy, Firebase handles only auth, PostgreSQL stores user data)
3. **Migration Friction**: Existing users need to re-authenticate (mitigation: One-time migration script to link existing profiles to Firebase UDs, or clear instructions)

### Migration Strategy
**Option A: Fresh Start (Recommended)**
- Clear all Supabase Auth data
- Require all users to sign up/in again with Firebase Auth
- Simpler, cleaner implementation

**Option B: Gradual Migration (More Complex)**
- Keep Supabase Auth temporarily
- Offer "Upgrade your account" prompt
- Users click to create Firebase Auth account
- Link Firebase UID to existing PostgreSQL profile
- Phase out Supabase Auth

**Recommendation**: Option A for simplicity and security. Users understand re-authenticating when auth system changes.

---

## Guardrails

### Must NOT Have
- **NO multi-tenant setup**: Single database, no tenant_id columns
- **NO Firebase Firestore database**: Use PostgreSQL only
- **NO database schema migration**: Keep all existing tables (except profiles table update)
- **NO changes to dashboard pages**: All dashboards remain unchanged
- **NO breaking changes to games/activities**: All existing features remain functional

### Must Have
- **Firebase Auth integration**: Replace Supabase Auth with Firebase Auth
- **Google Sign-In support**: Users can sign in with Google OAuth
- **Email/password authentication**: Users can use email/password via Firebase Auth
- **Password reset flow**: Firebase Auth send reset emails, update passwords
- **User synchronization**: Firebase Auth users linked to PostgreSQL profiles via firebase_uid
- **Role-based access control**: Student/teacher/parent routing preserved
- **Single-tenant architecture**: Keep PostgreSQL database as single tenant

---

## Post-Launch Metrics

### Key Performance Indicators (KPIs)
1. **Google Sign-In Adoption**: Percentage of users signing in with Google (target: 30% within 3 months)
2. **Registration Completion**: Successful registration rate (target: 85%+)
3. **Login Success Rate**: Successful authentication rate (target: 90%+)
4. **Password Reset Success**: Successful password reset rate (target: 80%+)
5. **User Synchronization**: Firebase-PostgreSQL sync success rate (target: 95%+)
6. **Error Rate**: Authentication error rate (target: <5%)

### Success Thresholds
- **Minimum Viable**: 70%+ login success rate
- **Good Launch**: 80%+ Google Sign-In adoption, 85%+ registration completion
- **Excellent**: 90%+ success rates, 30%+ Google Sign-In usage

---

## Notes

### Why This Approach Works
1. **Firebase Auth for Authentication**: Firebase's core strength is authentication. Use it for that.
2. **PostgreSQL for Data**: Supabase PostgreSQL is excellent for storing user data. Use it for that.
3. **Linking Pattern**: Store Firebase UID in PostgreSQL profiles table. This is a proven pattern used by thousands of apps.
4. **No Migration Needed**: Keep all existing data. Just link new Firebase Auth users to existing profiles.
5. **Simple, Maintainable**: Clear separation of concerns. Auth → Firebase, Data → PostgreSQL.

### Key Insight
This approach provides the best of both worlds:
- Firebase's industry-leading authentication (Google OAuth, email/password)
- Supabase's robust PostgreSQL database (all your existing data)
- Clean architecture (no hybrid, no complexity)
- Easy to maintain (well-defined boundaries)

### Single-Tenant vs Multi-Tenant
**What we're NOT doing:**
- No tenant_id columns
- No tenant configuration tables
- No tenant-scoped queries
- No district/school hierarchy

**What we ARE doing:**
- Single database (PostgreSQL via Supabase)
- Single-tenant architecture (perfect for current scope)
- Firebase Auth for authentication convenience (Google Sign-In)
- All dashboards remain unchanged (student/teacher/parent)

This meets your requirement: "I dont want to have a multi-tennant setup"
