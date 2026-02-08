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
npm install @supabase/supabase-js \
  @supabase/ssr \
  @supabase/auth-helpers-nextjs \
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
mkdir -p lib/supabase
mkdir -p lib/db
mkdir -p lib/stores
mkdir -p types
mkdir -p supabase/migrations
mkdir -p supabase/seed
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
# Supabase Configuration
# Get these from: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: For server-side operations
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

**Important:**
1. Go to https://supabase.com/dashboard
2. Create a new project (if you don't have one)
3. Go to Settings > API
4. Copy Project URL and Anon Key
5. Update `.env.local` with your credentials

### Step 7: Setup Database

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Open `tools/database/schema.sql` from your Atlas directory
5. Copy the entire content
6. Paste into SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. Wait for schema to be created (should take 10-30 seconds)

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project ID from dashboard)
supabase link --project-ref YOUR_PROJECT_ID

# Push schema
supabase db push
```

### Step 8: Seed Database (Optional)

**To get started with sample data:**

1. In Supabase dashboard > SQL Editor
2. Open `tools/database/seed.py` from Atlas
3. Run the seed data sections manually:
   - Copy sight words INSERT statements
   - Copy phonics letters INSERT statements
   - Copy badges INSERT statements
   - Paste and run each section separately

Or use Python script (if system resources allow):

```bash
# From Atlas directory, run
python3 tools/database/seed.py --full
```

### Step 9: Test Connection

```bash
# From Atlas directory
python3 tools/setup/validate_supabase.py
```

Expected output:
```
✅ Supabase connection successful!
   URL: https://... (truncated)
   Anon key: ...... (truncated)
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

### 1. lib/supabase/client.ts

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. lib/supabase/server.ts

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }) } catch (e) {}
        },
        remove(name: string, options: any) {
          try { cookieStore.delete({ name, ...options }) } catch (e) {}
        }
      }
    }
  )
}
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

**Tip:** Run `npx supabase gen types typescript --local` to generate complete types automatically.

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

### Issue: Supabase connection fails

**Solutions:**
1. Verify .env.local has correct values
2. Check Supabase project is active (not paused)
3. Ensure Supabase URL format: `https://xxxxx.supabase.co`
4. Regenerate API keys from Supabase dashboard

### Issue: Database schema migration fails

**Solutions:**
1. Copy schema in smaller chunks (section by section)
2. Check for syntax errors in SQL
3. Ensure you have admin/service role permissions
4. Use Supabase dashboard SQL Editor for visual feedback

---

## Verification Checklist

After completing setup, verify:

- [ ] `literacy-learning` directory exists
- [ ] `npm install` completed without errors
- [ ] shadcn/ui components added
- [ ] Directory structure created
- [ ] `.env.local` configured with Supabase credentials
- [ ] Database schema imported to Supabase
- [ ] Validation script passes: `python3 tools/setup/validate_supabase.py`
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

**Supabase Dashboard:** https://supabase.com/dashboard

---

*Manual setup guide created due to system resource constraints*
*Date: 2026-02-07*
*Status: Ready for manual setup*
