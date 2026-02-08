# Literacy Learning App — ATLAS Workflow

## Goal

Build a literacy learning platform following ATLAS methodology within the GOTCHA framework. The app helps new readers (ages 4-8) build foundational literacy skills through interactive activities.

**Tech Stack**: Next.js 14 + Tailwind CSS + Supabase (PostgreSQL, Auth, Storage)

---

## A — Architect

### Problem Statement
New readers (ages 4-8 or struggling older readers) lack a structured, engaging platform to build foundational literacy skills through 7 core areas: phonemic awareness, phonics, sight words, vocabulary, fluency, comprehension, and reading enjoyment.

### Users
1. **Students (ages 4-8)**: Primary learners engaging with interactive activities
2. **Teachers/Parents**: Educators and caregivers tracking progress and managing learning plans

### Success Metrics
- Student reads 20-50 sight words fluently within 4-6 weeks
- Student completes weekly phonics assessments with 80% accuracy
- Student participates in 2+ story-based discussions per week
- Teachers can easily log progress with weekly reading observation sheets

### Constraints
- Child-friendly UI (large buttons, simple navigation, engaging visuals)
- Offline capability for core activities (no internet required)
- Printable materials (activity sheets, flashcards, progress tracking)
- Cross-platform support (web + tablet)
- COPPA/GDPR compliance for student data

---

## T — Trace

### Data Schema

See `tools/database/schema.sql` for complete database schema.

**Key Tables:**
- `profiles` — User accounts with roles (student, teacher, parent)
- `students` — Student profiles linked to teachers/parents
- `activities` — Activity definitions (7 types)
- `weekly_plans` — Teacher-created learning schedules
- `skill_progress` — Per-student progress tracking (8 skill types)
- `sight_words` + `sight_word_progress` — Sight word mastery
- `phonics_letters` + `phonics_progress` — Letter recognition
- `vocabulary_words` + `vocabulary_mastery` — Vocabulary tracking
- `fluency_sessions` — Reading fluency records (WPM, accuracy)
- `badges` + `earned_badges` — Gamification
- `reward_points` — Points system
- `observation_sheets` — Teacher progress logs
- `printable_assets` — PDF resources

### Technology Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Frontend | Next.js 14 (App Router) | Modern React framework, SSR, routing |
| Styling | Tailwind CSS | Rapid UI development |
| Components | shadcn/ui | Accessible, customizable components |
| State | Zustand + React Query | Client state + server state sync |
| Database | Supabase (PostgreSQL) | Data persistence, real-time sync |
| Auth | Supabase Auth | Row-level security, multi-user support |
| Storage | Supabase Storage | Audio files, PDFs, recordings |
| PDF | react-pdf | Generate printable materials |
| Audio | Web Speech API (native) | Text-to-speech, speech-to-text |

### Integrations Map

| Service | Purpose | Auth Type |
|---------|---------|-----------|
| Supabase | DB, Auth, Storage | API Key + OAuth |
| Web Speech API | TTS/STT (built-in) | None (browser native) |

### Edge Cases

See `tools/database/schema.sql` — documented in comments.

**Critical edge cases:**
- Offline usage: Use IndexedDB for activity caching
- Multi-device sync: Last-write-wins with timestamps
- Large audio files: Lazy load, streaming, compression fallback
- Accessibility: WCAG 2.1 AA compliance, screen reader support

---

## L — Link

### Connection Validation Checklist

Before building, verify:

```
[ ] Supabase project created
[ ] Supabase URL and anon keys available
[ ] Database migration script ready
[ ] Row-level security policies defined
[ ] Storage buckets configured
[ ] Environment variables documented
```

### Validation Tools

Run `tools/setup/validate_supabase.py` to test Supabase connection.

---

## A — Assemble

### Build Order

1. **Infrastructure** — Project setup, environment configuration
2. **Database** — Schema migrations, seed data
3. **Authentication** — Login, register, user roles
4. **Core Features** — Activity system, progress tracking
5. **Activities** — Implement 7 activity types
6. **Teacher Tools** — Dashboard, weekly plans, observation sheets
7. **Student Dashboard** — Activity list, progress visualization
8. **Gamification** — Badges, points, rewards
9. **Printables** — PDF generation
10. **Polish** — Responsive design, accessibility

### Required Tools

| Tool | Purpose | Location |
|------|---------|----------|
| `setup/init_project.py` | Initialize Next.js project | `tools/setup/` |
| `database/migrate.py` | Run database migrations | `tools/database/` |
| `database/seed.py` | Seed sample data | `tools/database/` |
| `auth/setup_user.py` | Create test users | `tools/auth/` |
| `activities/generate_content.py` | Generate activity content | `tools/activities/` |
| `pdf/generate_printables.py` | Create PDF worksheets | `tools/pdf/` |

---

## S — Stress-test

### Testing Checklist

**Functional Testing:**
```
[ ] Teacher can create student account
[ ] Student can login via child-safe link
[ ] Activities complete and save progress
[ ] Progress syncs in real-time
[ ] Badges award correctly
[ ] PDFs generate without errors
```

**Integration Testing:**
```
[ ] Supabase auth flow working
[ ] RLS policies blocking unauthorized access
[ ] File upload/download to storage
[ ] Web Speech API works across browsers
```

**Edge Case Testing:**
```
[ ] Network disconnect during activity
[ ] Multiple devices logged in simultaneously
[ ] Large class roster performance
[ ] Audio playback fails gracefully
[ ] Invalid input handled
```

**Accessibility Testing:**
```
[ ] Keyboard navigation works
[ ] Screen reader reads all content
[ ] Colors meet WCAG contrast ratios
[ ] Touch targets meet minimum size (44x44px)
```

---

## GOTCHA Layer Mapping

| ATLAS Step | GOTCHA Layer |
|------------|--------------|
| Architect | Goals (this file) |
| Trace | Context (database schema reference) |
| Link | Args (environment config) |
| Assemble | Tools (execution scripts) |
| Stress-test | Orchestration (AI validates) |

---

## Related Files

- **Args:** `args/literacy_app.yaml` (configuration)
- **Context:** `context/literacy/` (activity templates, sample content)
- **Tools:** `tools/` (execution scripts)
- **Database:** `tools/database/schema.sql` (complete schema)

---

## Anti-Patterns

1. **Building without schema** — Must define database structure first
2. **Skipping RLS policies** — Student data must be protected
3. **No offline support** — Activities must work without internet
4. **Ignoring accessibility** — WCAG 2.1 AA is required
5. **Hardcoding content** — Use template-based generation

---

## Completion Criteria

- [ ] All 7 activity types implemented
- [ ] Student and teacher dashboards functional
- [ ] Progress tracking working across all skill areas
- [ ] Gamification system (badges, points) active
- [ ] Printables generation working
- [ ] Offline support (IndexedDB caching)
- [ ] WCAG 2.1 AA compliance verified
- [ ] Stress tests passing
- [ ] Documentation complete

---

*Created: 2026-02-07*
*Status: Active*
