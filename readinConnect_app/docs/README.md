# ReadinConnect App

> New project location for Literacy Learning App development
> Created: 2026-02-07

---

## Overview

This is the development directory for the Literacy Learning App (renamed to **ReadinConnect**).

**Original ATLAS Work:** Completed in `/Users/zero/Documents/Projects/Atlas`
**Moved To:** `/Users/zero/Documents/Projects/Atlas/readinConnect_app`

---

## Project Structure

```
readinConnect_app/
├── goals/
│   └── literacy_app.md        # ATLAS goal definition
├── args/
│   └── literacy_app.yaml      # Configuration
├── tools/
│   ├── manifest.md             # Tools index
│   ├── setup/
│   │   ├── init_project.py
│   │   └── validate_firebase.py
│   └── database/
│       ├── schema.sql          # Database schema
│       ├── migrate.py
│       ├── seed.py
│       └── stress_test.py
└── docs/
    ├── LITERACY_APP_ATLAS_REPORT.md
    ├── MANUAL_SETUP_GUIDE.md
    └── README.md
```

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Database:** Firebase (Firestore)
- **Auth:** Firebase Auth
- **State:** Zustand + React Query
- **Animation:** Framer Motion
- **PDF:** @react-pdf/renderer

---

## Quick Start

### 1. Initialize Next.js Project

```bash
cd readinConnect_app

npx create-next-app@latest frontend \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" \
  --use-npm --skip-git
```

### 2. Setup Firebase

```bash
# Get credentials from: https://console.firebase.google.com/
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

### 3. Create Database Schema

```bash
# Option A: Via Firebase Console (Recommended)
# Go to Firestore Database > Create Database
# Import JSON seed files from firebase/seed/ directory

# Option B: Via Firebase CLI
firebase firestore:import firebase/seed/ --project your-project-id
```

### 4. Seed Database

```bash
python3 tools/database/seed.py --full
```

### 5. Start Development

```bash
cd frontend
npm run dev
```

Open: http://localhost:3000

---

## Key Features

- 7 Learning Areas (phonics, sight words, comprehension, etc.)
- Student & Teacher Dashboards
- Gamification (badges, points, rewards)
- Progress Tracking (8 skill areas)
- Printable Materials (PDF generation)
- Offline Support (IndexedDB caching)
- WCAG 2.1 AA Accessibility

---

## Development Workflow

### GOTCHA Framework

| Layer | Location |
|-------|----------|
| **Goals** | `goals/literacy_app.md` |
| **Orchestration** | This development |
| **Tools** | `tools/` directory |
| **Context** | `args/literacy_app.yaml` |
| **Hard Prompts** | (not needed for this phase) |
| **Args** | `args/literacy_app.yaml` |

### ATLAS Steps

1. **Architect** — Define problem, users, metrics ✅
2. **Trace** — Data schema, integrations, stack ✅
3. **Link** — Validate connections ✅
4. **Assemble** — Build database, tools, frontend (in progress)
5. **Stress-test** — Test functionality ✅ (test suite ready)

---

## Documentation

| Document | Description |
|-----------|-------------|
| `goals/literacy_app.md` | Complete ATLAS goal with architecture |
| `args/literacy_app.yaml` | App configuration and behavior settings |
| `tools/database/schema.sql` | Complete database schema (21 tables) |
| `docs/LITERACY_APP_ATLAS_REPORT.md` | ATLAS completion report |
| `docs/MANUAL_SETUP_GUIDE.md` | Manual setup instructions |
| `docs/README.md` | Project overview (this file) |

---

## Tools Available

| Tool | Purpose | Command |
|-------|---------|-----------|
| `init_project.py` | Initialize Next.js project | `python3 tools/setup/init_project.py` |
| `validate_firebase.py` | Test Firebase connection | `python3 tools/setup/validate_firebase.py` |
| `migrate.py` | Run database migrations | `python3 tools/database/migrate.py` |
| `seed.py` | Populate with sample data | `python3 tools/database/seed.py --full` |
| `stress_test.py` | Run test suite | `python3 tools/database/stress_test.py` |

---

## Database Schema Summary

**21 Tables:**
- User management (profiles, students)
- Activity system (activities, weekly_plans, weekly_activities)
- Progress tracking (skill_progress, activity_completions)
- 7 Learning areas (sight_words, phonics, vocabulary, fluency, comprehension)
- Gamification (badges, earned_badges, reward_points)
- Teacher tools (observation_sheets)
- Printables (printable_assets)

**Security:** Firestore Security Rules on all collections
**Functions:** Progress summaries, points calculation, badge awarding

---

## Next Development Tasks

### Phase 1: Setup (Week 1)
- [ ] Initialize Next.js project
- [ ] Install dependencies
- [ ] Setup shadcn/ui components
- [ ] Create project structure
- [ ] Configure environment variables

### Phase 2: Core Features (Week 2-3)
- [ ] Build authentication flow
- [ ] Create student dashboard
- [ ] Create teacher dashboard
- [ ] Implement activity list
- [ ] Build activity detail pages

### Phase 3: Activities (Week 3-4)
- [ ] Phonics: Letter hunt game
- [ ] Sight Words: Bingo game
- [ ] Fluency: Timer and WPM tracking
- [ ] Comprehension: Quiz system
- [ ] Vocabulary: Word of the day

### Phase 4: Advanced Features (Week 4-5)
- [ ] Progress visualization
- [ ] Gamification: Badges and points
- [ ] Weekly plan builder (teachers)
- [ ] Observation sheets (teachers)
- [ ] PDF generation for printables
- [ ] Offline support

### Phase 5: Polish (Week 6+)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing

---

## Status

- ✅ ATLAS Architecture Complete
- ✅ Database Schema Complete
- ✅ Python Tools Complete
- ✅ Documentation Complete
- ⏸️ Next.js Initialization (Manual setup required)
- ⏸️ Frontend Development (Ready to begin)

---

*Project: ReadinConnect*
*Created: 2026-02-07*
*Framework: GOTCHA + ATLAS*
*Status: Ready for Development*
