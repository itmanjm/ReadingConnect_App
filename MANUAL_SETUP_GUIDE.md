# Literacy Learning App - Manual Setup Guide

> Due to system resource constraints (EAGAIN errors), automated setup is unavailable.
> Follow this manual guide to initialize the project.

---

## Current Status

✅ **ATLAS Phase Complete** — Architecture, schema, and tools are ready
⚠️  **System Resource Issue** — Bash commands failing (EAGAIN errors)
📋 **Solution** — Manual setup required

---

## Manual Setup Steps

### Step 1: Initialize Next.js Project

**In your terminal, run:**

```bash
# Navigate to your Atlas directory
cd /Users/zero/Documents/Projects/Atlas

# Create Next.js project
npx create-next-app@latest literacy-learning \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --skip-git
```

**If that fails, try alternative approach:**

```bash
# Install create-next-app globally first
npm install -g create-next-app

# Then create project
create-next-app literacy-learning \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --use-npm \
  --skip-git
```

### Step 2: Navigate to Project

```bash
cd literacy-learning
```

### Step 3: Install Dependencies

**Install core dependencies:**

```bash
npm install firebase \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-tabs \
  @radix-ui/react-progress \
  @radix-ui/react-avatar \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-select \
  lucide-react \
  zustand \
  @tanstack/react-query \
  framer-motion \
  @react-pdf/renderer \
  date-fns \
  clsx \
  tailwind-merge
```

**Install dev dependencies:**

```bash
npm install -D @types/node @types/react @types/react-dom typescript
```

### Step 4: Setup shadcn/ui

```bash
# Initialize shadcn/ui (interactive)
npx shadcn-ui@latest init
```

When prompted:
- Default style: New York
- Base color: Slate
- CSS variables: Yes

**Add UI components:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add separator
```

### Step 5: Create Project Structure

```bash
# Create all required directories
mkdir -p components/ui
mkdir -p components/activities
mkdir -p components/dashboard
mkdir -p components/shared
mkdir -p lib/firebase
mkdir -p lib/db
mkdir -p lib/stores
mkdir -p types
mkdir -p firebase/rules
mkdir -p public/audio/letters
mkdir -p public/audio/effects
mkdir -p public/audio/stories
mkdir -p public/images/badges
mkdir -p public/images/illustrations
```

### Step 6: Configure Environment Variables

**Create .env.local file:**

```bash
cat > .env.local << 'EOF'
# Firebase Configuration
# Get these from: https://console.firebase.google.com/
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Admin SDK (for server-side operations - never expose to client)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
EOF
```

**Important:**
1. Go to https://console.firebase.google.com/
2. Create a new project (if you don't have one)
3. Navigate to Project Settings
4. Scroll down to "Your apps" and create a Web app
5. Copy the Firebase SDK configuration
6. Update `.env.local` with your credentials
7. For admin operations, go to Project Settings > Service Accounts > Generate New Private Key

### Step 7: Setup Firebase

**Create Firestore Collections:**

1. Go to https://console.firebase.google.com/
2. Select your project
3. Navigate to **Firestore Database**
4. Create a database (start in Test Mode for development)
5. Create collections manually or import data from `firebase/seed-data.json`

**Create Firebase Storage:**

1. Navigate to **Storage**
2. Get Started
3. Start in Test Mode (for development)
4. Create folders: `audio/letters`, `audio/effects`, `audio/stories`, `images/badges`, `images/illustrations`

**Set up Firestore Security Rules:**

1. Navigate to Firestore > Rules
2. Copy rules from `firebase/firestore.rules`
3. Publish rules

**Set up Storage Security Rules:**

1. Navigate to Storage > Rules
2. Copy storage rules
3. Publish rules

### Step 8: Seed Database (Optional)

**To get started with sample data:**

1. In Firebase Console > Firestore Database
2. Click "Import Document"
3. Upload JSON files from `firebase/seed/` directory:
   - `activities.json`
   - `sight-words.json`
   - `phonics-letters.json`
   - `badges.json`

Or use Firebase CLI:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Import data
firebase firestore:import firebase/seed/activities.json --project your-project-id
```

### Step 9: Test Connection

```bash
# From Atlas directory
python3 tools/setup/validate_firebase.py
```

Expected output:
```
✅ Firebase connection successful!
   Project ID: ... (truncated)
   App ID: ...... (truncated)
```

### Step 10: Start Development Server

```bash
cd literacy-learning
npm run dev
```

**Open browser to:** http://localhost:3000

---

## Initial Files to Create

After setting up the project, create these files manually:

### 1. lib/firebase/client.ts

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  app = getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }
```

### 2. lib/firebase/admin.ts

```typescript
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  })
}

export const adminDb = getFirestore()
export const adminStorage = getStorage()
```

### 3. types/database.ts

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | 'parent' | 'admin'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      students: { /* ... */ }
      activities: { /* ... */ }
      // ... add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
```

**Tip:** Use Firebase CLI to auto-generate types or manually define interfaces based on your Firestore collections.

### 4. app/layout.tsx

```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Literacy Learning App',
  description: 'Building Strong Readers, One Word at a Time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### 5. app/page.tsx (Landing Page)

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Literacy Learning App</h1>
      <p className="mt-4 text-xl text-gray-600">
        Building Strong Readers, One Word at a Time
      </p>
    </main>
  )
}
```

---

## Troubleshooting

### Issue: "EAGAIN: resource temporarily unavailable"

**Cause:** System has exhausted file descriptors or process slots

**Solutions:**
1. **Restart your terminal** — Close and open new terminal
2. **Restart your computer** — If issue persists
3. **Close other applications** — Free up system resources
4. **Check system limits:**
   ```bash
   ulimit -a
   ```
5. **Increase limits temporarily:**
   ```bash
   ulimit -n 4096
   ```

### Issue: "create-next-app not found"

**Solution:**
```bash
npm install -g create-next-app
```

### Issue: Firebase connection fails

**Solutions:**
1. Verify .env.local has correct Firebase configuration
2. Check Firebase project is not disabled
3. Ensure all environment variables are set correctly
4. Regenerate Firebase config from console if needed

### Issue: Firestore permission denied

**Solutions:**
1. Check Firestore Security Rules
2. For development, use test mode temporarily
3. Ensure user is authenticated
4. Check collection and document names match exactly

### Issue: Storage upload fails

**Solutions:**
1. Check Storage Security Rules
2. Ensure file paths are valid
3. Verify file size limits (default 10MB)
4. Check authentication status

---

## Verification Checklist

After completing setup, verify:

- [ ] `literacy-learning` directory exists
- [ ] `npm install` completed without errors
- [ ] shadcn/ui components added
- [ ] Directory structure created
- [ ] `.env.local` configured with Firebase credentials
- [ ] Firestore collections created (via console or import)
- [ ] Firebase Storage configured with folders
- [ ] Security rules published
- [ ] Validation script passes: `python3 tools/setup/validate_firebase.py`
- [ ] `npm run dev` starts successfully
- [ ] Browser loads http://localhost:3000

---

## Next Development Steps

Once setup is complete:

### Week 1: Core Infrastructure
1. Build authentication pages (login, register)
2. Create student and teacher dashboards
3. Implement basic navigation

### Week 2: Activity System
1. Build activity list component
2. Create activity detail pages
3. Implement activity completion flow

### Week 3: Activities
1. Phonics activity (letter hunt)
2. Sight words (bingo game)
3. Fluency (timer + WPM calculation)

### Week 4: Progress & Gamification
1. Skill progress visualization
2. Badge system
3. Points and rewards

---

## Quick Reference

**Project Root:** `/Users/zero/Documents/Projects/Atlas/literacy-learning`
**Schema File:** `tools/database/schema.sql`
**Goal File:** `goals/literacy_app.md`
**Config File:** `args/literacy_app.yaml`

**Firebase Console:** https://console.firebase.google.com/

---

*Manual setup guide created due to system resource constraints*
*Date: 2026-02-07*
*Status: Ready for manual setup*
