# ReadinConnect - Project Files

> This directory contains all files moved from the Atlas literacy app project.
> Date: 2026-02-07

---

## Directory Structure

```
readinConnect_app/
├── goals/
│   └── literacy_app.md        # Complete ATLAS goal
├── args/
│   └── literacy_app.yaml      # Configuration
├── tools/
│   ├── manifest.md             # Tools index
│   ├── setup/
│   │   ├── init_project.py     # Project initializer
│   │   └── validate_firebase.py  # Connection tester
│   └── database/
│       ├── schema.sql          # Database schema
│       ├── migrate.py          # Migration runner
│       ├── seed.py            # Data seeder
│       └── stress_test.py     # Test suite
└── docs/
    ├── README.md             # This file
    └── MANUAL_SETUP_GUIDE.md  # Manual setup guide
```

---

## Quick Reference

**Project Name:** ReadinConnect
**Goal:** Literacy Learning Platform for ages 4-8
**Framework:** GOTCHA + ATLAS
**Status:** Ready for development

---

## Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| ATLAS Goal | Complete app architecture | `goals/literacy_app.md` |
| Configuration | App behavior settings | `args/literacy_app.yaml` |
| Database Schema | All tables + RLS | `tools/database/schema.sql` |
| Setup Guide | Manual setup instructions | `docs/MANUAL_SETUP_GUIDE.md` |
| Tools Index | Available tools | `tools/manifest.md` |

---

## Next Steps

### 1. Initialize Next.js Project

```bash
# Navigate to project
cd readinConnect_app

# Create frontend application
npx create-next-app@latest frontend \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" \
  --use-npm --skip-git
```

### 2. Setup Environment

```bash
# Create .env.local
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_firebase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_firebase_anon_key
EOF
```

### 3. Setup Database

**Option A: Firebase Dashboard (Recommended)**
1. Go to https://firebase.com/dashboard
2. Navigate to **SQL Editor**
3. Open `tools/database/schema.sql`
4. Copy and paste entire content
5. Click **Run**

**Option B: Firebase CLI**
```bash
firebase db push
```

### 4. Start Development

```bash
cd frontend
npm install @firebase/firebase-js @firebase/ssr @firebase/auth-helpers-nextjs
npx shadcn-ui@latest init
npm run dev
```

---

## Notes

- All files have been moved from `/Users/zero/Documents/Projects/Atlas/`
- Original files remain in Atlas directory for reference
- This is now the working directory for ReadinConnect development

---

*Created: 2026-02-07*
*Purpose: Project files location*
