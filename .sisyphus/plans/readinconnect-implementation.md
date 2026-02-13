# Plan: ReadinConnect Feature Implementation

## TL;DR

> **Quick Summary**: Implement literacy platform features (Days 5-14) using Firebase Realtime Database + Firebase Auth, including level selector, audio phonics, sight words, gamification, PDF worksheets, and progress dashboard.
>
> **Deliverables**:
> - 8 frontend components (level selector, CVC practice, sight words, progress dashboard, audio player, worksheets viewer, rewards store, badges display, streak counter)
> - Firebase Realtime Database schema with 6+ tables
> - 3 backend API endpoints for real-time updates
> - PDF generation system (10-20 worksheets per level)
> - 42 Jolly Phonics audio files + TTS integration
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Firebase Auth & DB setup → Backend APIs → Frontend components → Testing

---

## Context

### Original Request
10-week implementation plan to enhance ReadinConnect literacy learning platform with multiple feature areas:
- Frontend components (Days 5-8)
- Gamification & PDF features (Days 9-12)
- Database setup (Days 1-2)
- Backend APIs (Days 3-4)
- Testing & refinement (Days 13-14)

### User Decisions

**Implementation Approach**:
- **Priority-based**: Focus on critical features first (auth, core activities, dashboards) before gamification
- **Rework allowed**: Can adjust Day order where appropriate as long as framework requirements are followed
- **Parallel execution**: Identify features that can be developed in parallel to accelerate delivery

**Technology Stack**:
- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Firebase Realtime Database (was Supabase, switched to Firebase)
- **Database**: Firebase Realtime Database (JSON-based NoSQL, real-time subscriptions)
- **Auth**: Firebase Auth (already implemented)
- **Audio**: Hybrid approach - Jolly Phonics downloads + TTS fallback
- **PDF**: @react-pdf/renderer for worksheet generation

**PDF Content**: Mixed content (passages, exercises, activities) per level
- 10-20 worksheets per reading level
- Combination of reading passages, phonics exercises, vocabulary work, comprehension questions

**Real-time Strategy**: Firebase Realtime Database
- No longer using Supabase
- Use Firebase Realtime Database for live progress updates
- Leverage Firebase's built-in real-time listeners

**Level Structure**: Flexible/Extensible design
- Start with 3-5 levels, easy to expand later
- Each level has sublevels with clear progression
- Designed for future expansion without major refactoring

**Testing Approach**: Manual + user feedback
- Focus on manual testing with user input
- Iterate based on user feedback
- No automated test suite initially

---

## Work Objectives

### Core Objective
Build a comprehensive literacy learning platform with Firebase backend, featuring phonics learning, sight words practice, progress tracking, and gamification system for children ages 4-8.

### Concrete Deliverables

#### Frontend Components (8 components)
1. **Reading Level Selector** (`/dashboard/level-selector`)
2. **CVC Practice Component** with audio feedback (`/activities/cvc-practice`)
3. **Sight Words Component** - Level-based (`/activities/sight-words-enhanced`)
4. **Progress Dashboard** with charts (`/dashboard/progress`)
5. **Audio Player Component** - Reusable (`/components/audio-player`)
6. **PDF Worksheets Viewer** (`/activities/worksheets`)
7. **Rewards Store** - UI for managing rewards (`/gamification/rewards`)
8. **Badges & Streak Display** - Gamification UI (`/components/badges-display`)

#### Database Schema (6+ tables)
1. **Users table** - User profiles and preferences
2. **ReadingLevels table** - Level definitions and requirements
3. **CVCWords table** - Consonant-Vowel-Consonant words
4. **SightWords table** - Sight words by difficulty level
5. **UserProgress table** - Progress tracking per user/level/word
6. **Badges table** - Earned badges and achievements
7. **Rewards table** - Available rewards and user inventory
8. **Streaks table** - Daily streak tracking
9. **Worksheets table** - Generated worksheets metadata
10. **Activities table** - Activity completion tracking

#### Backend APIs (3+ endpoints)
1. **Real-time progress updates** - Firebase Realtime Database listeners
2. **PDF generation API** - Generate worksheets on demand
3. **User preferences API** - Save user settings

#### Audio Assets
1. **42 Jolly Phonics letter sounds** - Downloaded from jollylearning.co.uk
2. **CVC word examples** - 10-20 examples per letter
3. **Organized structure** - `/public/audio/jolly-phonics/`
4. **TTS integration** - Web Speech API as fallback for words

### Definition of Done

- [ ] User can select reading level from 3-5 options
- [ ] CVC practice plays letter sounds and provides audio feedback
- [ ] Sight words exercises organized by difficulty levels
- [ ] Progress dashboard shows charts of reading development
- [ ] Audio player component works across all activities
- [ ] PDF worksheets generate (10-20 per level) and download correctly
- [ ] Badge system awards level completion and word mastery badges
- [ ] Streak counter tracks consecutive days of activity
- [ ] Real-time progress updates reflect in dashboard < 2s
- [ ] PDF generation completes < 30s per worksheet
- [ ] Manual testing completed for all features
- [ ] User feedback incorporated into UI refinements

### Must Have

- **Firebase Realtime Database**: All data storage using Firebase Realtime Database
- **Firebase Auth**: Integration with existing Firebase Auth system
- **Level flexibility**: 3-5 reading levels, extensible design
- **Audio feedback**: Jolly Phonics sounds + Web Speech API fallback
- **PDF generation**: @react-pdf/renderer for worksheets
- **Real-time updates**: Dashboard reflects progress within 2 seconds
- **Manual testing**: All features tested and refined based on user feedback
- **Responsive design**: Works on desktop, tablet, and mobile
- **Error handling**: Graceful degradation when Firebase is unavailable

### Must NOT Have (Guardrails)

- **No Supabase integration**: Complete switch to Firebase, no Supabase code
- **No hardcoded audio paths**: All audio managed through centralized audio player component
- **No complex authentication**: Reuse existing Firebase Auth, don't create new auth system
- **No PDF template complexity**: Keep PDF generation simple and maintainable
- **No over-engineering**: Focus on working features, avoid premature optimization
- **No automated tests initially**: Manual testing approach, tests can be added later

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.

### Test Decision
- **Infrastructure exists**: YES (Firebase Auth, Next.js build system)
- **Automated tests**: NO (Manual testing + user feedback approach)
- **Framework**: Bun test (can be added later) / Vitest (can be added later)

### If TDD Enabled

Each TODO follows RED-GREEN-REFACTOR:

**Task Structure:**
1. **RED**: Write failing test first
   - Test file: `[path].test.ts`
   - Test command: `bun test [file]`
   - Expected: FAIL (test exists, implementation doesn't)
2. **GREEN**: Implement minimum code to pass
   - Command: `bun test [file]`
   - Expected: PASS
3. **REFACTOR**: Clean up while keeping green
   - Command: `bun test [file]`
   - Expected: PASS (still)

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Whether TDD is enabled or not, EVERY task MUST include Agent-Executed QA Scenarios.
> - **With TDD**: QA scenarios complement unit tests at integration/E2E level
> - **Without TDD**: QA scenarios are the PRIMARY verification method
>
> These describe how the executing agent DIRECTLY verifies the deliverable
> by running it — opening browsers, executing commands, sending API requests.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot |
| **TUI/CLI** | interactive_bash (tmux) | Run command, send keystrokes, validate output |
| **API/Backend** | Bash (curl/httpie) | Send requests, parse responses, assert fields |
| **Library/Module** | Bash (bun/node REPL) | Import, call functions, compare output |
| **Config/Infra** | Bash (shell commands) | Apply config, run state checks, validate |

**Each Scenario MUST Follow This Format:**

```
Scenario: [Descriptive name — what user action/flow is being verified]
  Tool: [Playwright / interactive_bash / Bash]
  Preconditions: [What must be true before this scenario runs]
  Steps:
    1. [Exact action with specific selector/command/endpoint]
    2. [Next action with expected intermediate state]
    3. [Assertion with exact expected value]
  Expected Result: [Concrete, observable outcome]
  Failure Indicators: [What would indicate failure]
  Evidence: [Screenshot path / output capture / response body path]
```

**Scenario Detail Requirements:**
- **Selectors**: Specific CSS selectors (`.level-card`, not "the level card")
- **Data**: Concrete test data (`"Level 1"`, not `"[level]"`)
- **Assertions**: Exact values (`text contains "Level 1"`, not "verify it works")
- **Timing**: Include wait conditions where relevant (`Wait for .dashboard (timeout: 10s)`)
- **Negative Scenarios**: At least ONE failure/error scenario per feature
- **Evidence Paths**: Specific file paths (`.sisyphus/evidence/task-1-level-selector.png`)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately): Foundation
├── Task 1: Setup Firebase Realtime Database
├── [x] Task 2: Download and organize Jolly Phonics audio
├── [x] 3. Create database schema (Firebase Realtime)
└── Task 4: Setup PDF generation infrastructure

Wave 2 (After Wave 1): Core Components
├── Task 5: Reading Level Selector component
├── Task 6: CVC Practice component with audio
├── Task 7: Sight Words enhanced component
└── Task 8: Audio Player reusable component

Wave 3 (After Wave 2): Dashboard & Backend
├── Task 9: Progress Dashboard with charts
├── Task 10: Real-time progress updates API
└── Task 11: PDF generation API

Wave 4 (After Wave 3): Gamification
├── Task 12: Badges & Streak system
├── Task 13: Rewards store component
└── Task 14: PDF worksheets viewer

Critical Path: Firebase DB Setup → Level Selector → CVC Practice → Sight Words → Progress Dashboard
Parallel Speedup: ~50% faster than sequential
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|-------|-------------|--------|---------------------|
| 1 | None | 2, 3, 4 | 2, 3, 4 |
| 2 | 1 | 3 | 3, 4 |
| 3 | 1 | 5, 6, 7, 8 | 4 |
| 4 | 1 | 5 | 2, 3, 4 |
| 5 | 3 | 6, 7 | 6, 7, 8 |
| 6 | 3 | 9 | 7, 8 |
| 7 | 3 | 8 | 8 |
| 8 | 3 | 10 | 5 |
| 9 | 5, 3 | 10 | 10 |
| 10 | 9 | 11, 12, 13, 14 | 11, 12, 13, 14 |
| 11 | 5, 9 | 13, 14 | 12, 13, 14 |
| 12 | 5, 9 | 13, 14 | 13, 14 |
| 13 | 5, 9, 11, 12, 14 | 14 |
| 14 | All | None | None |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|-------|-------|-------------------|
| 1 | 1, 2, 3, 4 | task(category="unspecified-low", load_skills=["git-master"], run_in_background=false) |
| 2 | 5, 6, 7, 8 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) |
| 3 | 9, 10, 11 | task(category="unspecified-high", load_skills=[], run_in_background=false) |
| 4 | 12, 13, 14 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) |

---

## TODOs

- [ ] 1. Setup Firebase Realtime Database

  **What to do**:
  - Add Firebase Realtime Database dependency to project
  - Configure Firebase Realtime Database in Firebase Console
  - Create database initialization in `lib/firebase/database.ts`
  - Test connection and basic CRUD operations
  - Document database structure and rules

  **Must NOT do**:
  - Do not use Supabase client (complete Firebase switch)
  - Do not create separate auth system (reuse existing Firebase Auth)

  **Recommended Agent Profile**:
  > - **Category**: `unspecified-low`
  > - **Skills**: `["git-master"]`
  > - **Reason**: Firebase setup is configuration and dependency management, requires git for tracking project setup
  > - **Skills Evaluated but Omitted**:
  > - `playwright`: Not needed for Firebase config setup
  > - `frontend-ui-ux`: Backend setup, no UI components yet

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (can start immediately)

  **References**:

  > **Pattern References** (existing code to follow):
  > - `lib/firebase/auth.ts` - Firebase initialization pattern (auth setup)
  > - Firebase documentation: https://firebase.google.com/docs/database/web/start

  > **API/Type References** (contracts to implement against):
  > - Firebase Realtime Database SDK: https://firebase.google.com/docs/reference/js/database
  > - Database types: Create `types/database.ts` with Firebase Realtime DB types

  > **Test References** (testing patterns to follow):
  > - Firebase Realtime Database testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Firebase Console setup guide: https://console.firebase.google.com
  > - Database rules documentation: https://firebase.google.com/docs/database/security

  > **External References** (libraries and frameworks):
  > - Firebase Realtime Database official docs: https://firebase.google.com/docs/database
  > - Firebase SDK documentation: https://firebase.google.com/docs/reference/js/

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `lib/firebase/auth.ts` (vague)
  > - Good: `lib/firebase/auth.ts` - Firebase app initialization pattern for auth, auth instance creation, persistence configuration. Follow similar pattern for Realtime Database.

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Firebase Realtime Database initialized in `lib/firebase/database.ts`
  > - [ ] Database connection tested with console logs
  > - [ ] Can read/write basic data (test CRUD operation)
  > - [ ] Database rules documented in README or inline comments

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Initialize Firebase Realtime Database and verify connection
  >   Tool: Bash (curl + Firebase SDK)
  >   Preconditions: Firebase project configured, internet connection available
  >   Steps:
  >     1. Run `npm install firebase` to install Realtime Database SDK
  >     2. Create `lib/firebase/database.ts` with `getDatabase()` initialization
  >     3. Test write operation: `set(ref(db, 'test'), { value: 'hello' })`
  >     4. Test read operation: `onValue(ref(db, 'test'), (snapshot) => console.log(snapshot.val()))`
  >     5. Verify console logs show successful connection
  >   Expected Result: Database initialized and basic CRUD works
  >   Evidence: Console logs showing database connection and successful operations
  >
  > Scenario: Firebase database connection failure handling
  >   Tool: Bash (curl + Firebase SDK)
  >   Preconditions: Firebase project not configured or invalid credentials
  >   Steps:
  >     1. Initialize Firebase with invalid config
  >     2. Attempt database read operation
  >     3. Check for error logs in console
  >   Expected Result: Graceful error handling with clear error message
  >   Evidence: Error caught and logged to console with user-friendly message
  > ```

  **Evidence to Capture**:
  > - [ ] Console logs showing database initialization
  > - [ ] Console logs showing test read/write operations
  > - [ ] Error handling logs (if test fails)

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `feat(firebase): add Firebase Realtime Database setup`
  - Files: `lib/firebase/database.ts`, `package.json`

- [ ] 2. Download and organize Jolly Phonics audio

  **What to do**:
  - Download 42 letter sounds from https://www.jollylearning.co.uk/resource-bank-old/learn-the-letter-sounds/
  - Download 10-20 CVC word examples for each letter
  - Organize into `/public/audio/jolly-phonics/letters/` and `/public/audio/jolly-phonics/words/`
  - Create index file for quick lookup
  - Verify all files downloaded correctly (check file counts)

  **Must NOT do**:
  - Do not use copyrighted audio from other sources
  - Do not create complex audio processing (use raw files)
  - Do not add TTS generation yet (Phase 2 task)

  **Recommended Agent Profile**:
  > - **Category**: `quick`
  > - **Skills**: `["git-master"]`
  > - **Reason**: File downloads and organization are simple operations, git-master can handle efficiently

  > - **Skills Evaluated but Omitted**:
  > - `playwright`: Not needed for file downloads
  > - `frontend-ui-ux`: No UI component yet

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (can start after Task 1)

  **References**:

  > **Pattern References** (existing code to follow):
  > - `public/` directory structure for static assets
  > - Audio file naming conventions in existing project

  > **API/Type References** (contracts to implement against):
  > - Audio file paths: `/audio/jolly-phonics/[letter-sound].mp3`
  > - Audio MIME types: MP3 for compatibility

  > **Test References** (testing patterns to follow):
  > - File download verification patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Jolly Phonics license terms (for audio usage)
  > - File system organization best practices

  > **External References** (libraries and frameworks):
  > - Node.js download utilities: https://nodejs.org/api/fs
  > - Web fetch API: https://developer.mozilla.org/en-US/docs/Web/API/fetch

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `/public/audio/` (vague)
  > - Good: `/public/audio/jolly-phonics/letters/` - Show correct directory structure for organizing letter sounds by phonics category

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] 42 letter sounds downloaded to `/public/audio/jolly-phonics/letters/[letter].mp3`
  > - [ ] 200-500 CVC word examples downloaded to `/public/audio/jolly-phonics/words/[letter].mp3`
  > - [ ] Audio files organized with clear directory structure
  > - [ ] Index file created for quick lookup

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Verify letter sounds downloaded correctly
  >   Tool: Bash (ls, file)
  >   Preconditions: Internet connection available, Jolly Phonics website accessible
  >   Steps:
  >     1. Download letter sounds using download script
  >     2. Verify `/public/audio/jolly-phonics/letters/` contains 42 MP3 files
  >     3. Verify file naming: `a.mp3`, `b.mp3`, etc.
  >     4. Check file sizes are reasonable (100KB-2MB each)
  >   Expected Result: All letter sounds downloaded and organized
  >   Evidence: File listing showing 42 MP3 files in correct directory
  >
  > Scenario: Verify CVC word examples downloaded
  >   Tool: Bash (ls, find, du)
  >   Preconditions: Letter sounds downloaded successfully
  >   Steps:
  >     1. Verify `/public/audio/jolly-phonics/words/` contains 200-500 MP3 files
  >     2. Check total size is reasonable (< 500MB)
  >     3. Create index listing word counts per letter
  >   Expected Result: CVC word examples downloaded and indexed
  >   Evidence: File listing showing organized word examples directory
  >
  > Scenario: Audio files are accessible from frontend
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running on localhost:3000, audio files in `/public/audio/`
  >   Steps:
  >     1. Navigate to test page with audio element
  >     2. Set audio src to `/audio/jolly-phonics/letters/a.mp3`
  >     3. Play audio and verify sound plays correctly
  >     4. Check network tab for successful request (200 OK)
  >   Expected Result: Audio plays correctly in browser
  >   Evidence: Screenshot of network tab showing successful audio load, .sisyphus/evidence/task-2-audio-play.png
  > ```

  **Evidence to Capture**:
  > - [ ] File listing of downloaded letter sounds (42 files)
  > - [ ] File listing of CVC word examples (200-500 files)
  > - [ ] Index file showing organization structure
  > - [ ] Screenshot of audio playing correctly in browser

  **Commit**: YES (groups with 1, 3, 4)
  - Message: `feat(audio): download and organize Jolly Phonics sounds`
  - Files: `/public/audio/jolly-phonics/**`, `scripts/download-audio.js`

- [ ] 3. Create database schema (Firebase Realtime)

  **What to do**:
  - Define database structure for 6+ tables (Users, ReadingLevels, CVCWords, SightWords, UserProgress, Badges, Rewards, Streaks, Worksheets, Activities)
  - Create database rules file (firebase database rules)
  - Document schema in `docs/database-schema.md`
  - Set initial data seeds for reading levels, CVC words, sight words
  - Create database initialization helper functions

  **Must NOT do**:
  - Do not use Supabase schema (complete Firebase switch)
  - Do not create complex relationships (Firebase is NoSQL, use denormalized structure)
  - Do not add foreign key constraints (Firebase doesn't support them)
  - Do not use SQL migrations (Firebase uses JSON structure)

  **Recommended Agent Profile**:
  > - **Category**: `unspecified-low`
  > - **Skills**: `["git-master"]`
  > - **Reason**: Database schema design requires version control for tracking changes
  > - **Skills Evaluated but Omitted**:
  > - `playwright`: No UI component yet
  > - `frontend-ui-ux`: Schema creation, no UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (database can be created in parallel with Task 1)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Firebase database structure patterns from Firebase docs
  > - NoSQL design patterns for denormalized data

  > **API/Type References** (contracts to implement against):
  > - Firebase Realtime Database reference: ` DatabaseReference`, `DataSnapshot`
  > - TypeScript types for database operations

  > **Test References** (testing patterns to follow):
  > - Firebase Realtime Database testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Firebase Realtime Database best practices: https://firebase.google.com/docs/database/structure-data
  > - Database security rules: https://firebase.google.com/docs/database/security/quickstart

  > **External References** (libraries and frameworks):
  > - Firebase Realtime Database official docs: https://firebase.google.com/docs/database
  > - NoSQL database design patterns

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `Firebase Realtime Database docs` (vague)
  > - Good: `https://firebase.google.com/docs/database/structure-data` - Show NoSQL design patterns specific to Firebase, explain denormalization strategies, indexing approaches for Firebase Realtime queries

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Database structure documented in `docs/database-schema.md`
  > - [ ] 6+ table schemas defined (Users, ReadingLevels, CVCWords, SightWords, UserProgress, Badges, Rewards, Streaks, Worksheets, Activities)
  > - [ ] Firebase rules file created with appropriate security settings
  > - [ ] Initial data seeds defined for reading levels, CVC words, sight words
  > - [ ] Database initialization helpers created

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Verify database schema structure
  >   Tool: Bash (cat, grep)
  >   Preconditions: Database schema files created
  >   Steps:
  >     1. Read `docs/database-schema.md` to verify all tables are documented
  >     2. Verify table structures match Firebase NoSQL patterns
  >     3. Check that data types are consistent across tables
  >     4. Verify no foreign keys or SQL-specific patterns
  >   Expected Result: Complete database schema documentation
  >   Evidence: Output of database-schema.md showing all tables with proper structure
  >
  > Scenario: Firebase Realtime Database write operation
  >   Tool: Bash (Firebase SDK)
  >   Preconditions: Firebase initialized, database connected
  >   Steps:
  >     1. Create test script that writes user data: `set(ref(db, 'users/test'), { name: 'Test User' })`
  >     2. Run test script with node
  >     3. Verify data appears in Firebase Console
  >     4. Read data back to verify write succeeded
  >   Expected Result: Can write and read from Firebase Realtime Database
  >   Evidence: Console logs showing write/read operations, Firebase Console screenshot
  > ```

  **Evidence to Capture**:
  > - [ ] Complete database-schema.md file
  > - [ ] Firebase rules file with security settings
  > - [ ] Data seed files for initial database population
  > - [ ] Console logs showing successful write/read operations

  **Commit**: YES (groups with 1, 2, 4)
  - Message: `feat(database): create Firebase Realtime Database schema`
  - Files: `docs/database-schema.md`, `firebase.database.rules`, `lib/firebase/database.ts`

- [ ] 4. Setup PDF generation infrastructure

  **What to do**:
  - Install @react-pdf/renderer package
  - Create PDF generation utility in `lib/utils/generate-pdf.ts`
  - Create PDF templates for worksheets (reading passages, exercises)
  - Test PDF generation with sample data
  - Verify PDFs download correctly

  **Must NOT do**:
  - Do not create complex PDF editing features (focus on generation)
  - Do not add PDF viewer component yet (Phase 4 task)
  - Do not optimize for print layout (screen-first approach)

  **Recommended Agent Profile**:
  > - **Category**: `unspecified-low`
  > - **Reason**: PDF setup is infrastructure task, requires npm and utility creation
  > - **Skills Evaluated but Omitted**:
  > - `playwright`: No UI component yet
  > - `frontend-ui-ux`: PDF generation is utility, no UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (infrastructure can be built in parallel)

  **References**:

  > **Pattern References** (existing code to follow):
  > - `lib/utils.ts` - Utility functions pattern in existing project
  > - Template file patterns for PDF generation

  > **API/Type References** (contracts to implement against):
  > - @react-pdf/renderer API: https://react-pdf.org/
  > - PDF document types

  > **Test References** (testing patterns to follow):
  > - PDF generation testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - @react-pdf/renderer documentation: https://react-pdf.org/
  > - PDF worksheet best practices

  > **External References** (libraries and frameworks):
  > - @react-pdf/renderer official docs: https://react-pdf.org/
  > - PDF accessibility guidelines

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `@react-pdf/renderer docs` (vague)
  > - Good: `https://react-pdf.org/renderer/api/fontoptions` - Show specific font options, size options, and margin settings for PDFs, explain what parameters to use for worksheet generation

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] @react-pdf/renderer installed in package.json
  > - [ ] PDF generation utility created at `lib/utils/generate-pdf.ts`
  > - [ ] PDF templates created for reading passages and exercises
  > - [ ] Test PDF generates correctly with sample data
  > - [ ] PDF downloads successfully when triggered

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Generate PDF worksheet and verify download
  >   Tool: Playwright (playwright skill)
  >   Preconditions: PDF generation infrastructure setup, test data available
  >   Steps:
  >     1. Create test component that generates PDF with sample worksheet data
  >     2. Navigate to test page with PDF generation button
  >     3. Click generate button and wait for PDF to download
  >     4. Verify PDF file appears in downloads folder
  >     5. Open PDF and verify content is correct (passages, exercises)
  >   Expected Result: PDF generates and downloads with correct content
  >   Evidence: Downloaded PDF file with correct worksheet content
  > ```
  >
  > Scenario: PDF generation fails gracefully
  >   Tool: Playwright (playwright skill)
  >   Preconditions: PDF generation infrastructure set up
  >   Steps:
  >     1. Attempt to generate PDF with invalid or missing data
  >     2. Verify error message is displayed to user
  >     3. Verify console shows appropriate error logging
  >     4. Confirm no broken UI or crash
  >   Expected Result: Graceful error handling with user-friendly message
  >   Evidence: Screenshot showing error message, console error logs
  > ```

  **Evidence to Capture**:
  > - [ ] Installed @react-pdf/renderer package in package.json
  > - [ ] PDF generation utility at `lib/utils/generate-pdf.ts`
  > - [ ] PDF templates for worksheets
  > - [ ] Test PDF file showing generated worksheet content

  **Commit**: YES (groups with 1, 2, 4)
  - Message: `feat(infra): setup PDF generation infrastructure`
  - Files: `lib/utils/generate-pdf.ts`, `lib/templates/pdf-templates.ts`, `package.json`

- [ ] 5. Reading Level Selector component

  **What to do**:
  - Create `/dashboard/level-selector/page.tsx` component
  - Display 3-5 reading levels with descriptions and emojis
  - Save selected level to Firebase Realtime Database
  - Show progress within each level (unlock levels sequentially)
  - Use existing UI components (Button, Card, Badge)
  - Make responsive for mobile/tablet/desktop

  **Must NOT do**:
  - Do not create complex level unlock system yet (Phase 2-3)
  - Do not add level customization (keep simple for MVP)
  - Do not use hardcoded level logic (read from Firebase)
  - Do not create separate routing for levels (use existing dashboard structure)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Level selector is UI component requiring design and user experience
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database or auth changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8)
  - **Blocks**: Tasks 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (after Task 3 completes)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Component structure in `/app/dashboard/` and `/app/activities/`
  > - Button, Card, Badge components from shadcn/ui
  > - Tailwind CSS classes and responsive design patterns

  > **API/Type References** (contracts to implement against):
  > - Firebase Realtime Database types (ReadingLevel type)
  > - User progress types (UserProgress type)
  > - Level selector component props

  > **Test References** (testing patterns to follow):
  > - Component testing patterns from existing activities
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Reading level definitions from project plan
  > - UI component best practices from shadcn/ui

  > **External References** (libraries and frameworks):
  > - Tailwind CSS responsive design: https://tailwindcss.com/docs/responsive-design
  > - React component patterns: https://react.dev/learn/thinking-in-react

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `shadcn/ui components` (vague)
  > - Good: `app/dashboard/student/page.tsx` - Show card-based responsive UI with progress indicators, use Tailwind responsive classes like `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for adaptive layouts

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Level selector displays 3-5 reading levels
  > - [ ] Each level has title, description, emoji, and progress indicator
  > - [ ] Selected level saves to Firebase Realtime Database under user profile
  > - [ ] Locked levels show appropriate visual state (disabled, lock icon)
  > - [ ] Component is responsive on mobile, tablet, desktop
  > - [ ] User can select level and navigate to appropriate activities

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: User selects reading level and saves selection
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, user logged in, Firebase DB initialized
  >   Steps:
  >     1. Navigate to `/dashboard/level-selector`
  >     2. Wait for level options to load (3-5 levels displayed)
  >     3. Click on "Level 2: Intermediate" card
  >     4. Wait for navigation (should update user profile or redirect)
  >     5. Check Firebase Console for user's selected_level field
  >   Expected Result: Level selection saved to user profile in Firebase
  >   Evidence: Firebase Console showing selected_level = 2, screenshot of level selector with Level 2 selected state
  >
  > Scenario: Locked levels display correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User on level selector page, 2 levels locked
  >   Steps:
  >     1. Verify all levels display (3-5 total)
  >     2. Check that locked levels show disabled state (lower opacity, no interaction)
  >     3. Check that unlocked levels show enabled state (can select)
  >     4. Verify lock icons display on locked levels
  >   Expected Result: Locked levels clearly visually distinct from unlocked levels
  >   Evidence: Screenshot showing locked vs unlocked level states
  >
  > Scenario: Level selector is responsive
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running with different viewport sizes
  >   Steps:
  >     1. Open DevTools device toolbar
  >     2. Set viewport to mobile (375x667)
  >     3. Verify level cards display in single column
  >     4. Set viewport to tablet (768x1024)
  >     5. Verify level cards display in 2-column grid
  >     6. Set viewport to desktop (1920x1080)
  >     7. Verify level cards display in 3-column grid
  >   Expected Result: Layout adapts to different screen sizes
  >   Evidence: Screenshots showing 3 different viewport layouts
  > ```

  **Evidence to Capture**:
  > - [ ] Level selector component created at `/dashboard/level-selector/page.tsx`
  > - [ ] Screenshot of level selector with all levels displayed
  > - [ ] Firebase Console screenshot showing saved level
  > - [ ] Screenshots showing responsive layout on 3 viewport sizes

  **Commit**: YES (groups with 6, 7, 8)
  - Message: `feat(ui): add reading level selector component`
  - Files: `app/dashboard/level-selector/page.tsx`

- [ ] 6. CVC Practice component with audio

  **What to do**:
  - Create `/activities/cvc-practice/page.tsx` component
  - Display consonant-vowel-consonant (CVC) word building interface
  - Play Jolly Phonics letter sounds when letters are selected
  - Use TTS (Web Speech API) for pronouncing full words
  - Record audio feedback for user pronunciation attempts
  - Score tracking (correct vs incorrect attempts)
  - Progressive difficulty (start with simple CVC words)
  - Use audio player component for sound playback

  **Must NOT do**:
  - Do not create complex phonics engine yet (focus on CVC practice)
  - Do not add voice recording yet (Phase 2 feature)
  - Do not use external audio libraries (use downloaded Jolly sounds + Web Speech API)
  - Do not create separate audio player (reusable component from Task 8)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: CVC practice is interactive UI component requiring audio feedback, clear state management, and user interactions
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database or auth changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8)
  - **Blocks**: Tasks 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (after Tasks 3, 4, 5 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Component structure in `/app/activities/`
  > - Audio playback from audio player component
  > - State management patterns from existing activities

  > **API/Type References** (contracts to implement against):
  > - Web Speech API: `SpeechSynthesisUtterance`
  > - Audio player component props
  > - CVC word patterns (consonant-vowel-consonant)

  > **Test References** (testing patterns to follow):
  > - Component testing patterns from existing activities
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Web Speech API documentation: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  > - Phonics learning best practices

  > **External References** (libraries and frameworks):
  > - Web Speech API official docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  > - Phonics teaching resources

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `Web Speech API docs` (vague)
  > - Good: `https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance#examples` - Show specific code examples for text-to-speech with voice selection, rate control, and error handling patterns

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] CVC practice component created at `/activities/cvc-practice/page.tsx`
  > - [ ] User can select consonants and vowels to build CVC words
  > - [ ] Letter sounds play when selected (use downloaded Jolly sounds)
  > - [ ] Full words pronounce using TTS (Web Speech API)
  > - [ ] Score tracking shows correct/incorrect attempts
  > - [ ] Progressive difficulty (simple CVC words first)
  > - [ ] Audio player component integrates for sound playback
  > - [ ] Component is responsive on all devices

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: User builds CVC word and hears correct pronunciation
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, user logged in, audio files loaded
  >   Steps:
  >     1. Navigate to `/activities/cvc-practice`
  >     2. Select consonant 'c', vowel 'a', consonant 't'
  >     3. Click 'play' button to hear pronunciation
  >     4. Verify TTS says "cat" and audio plays back user's pronunciation
  >     5. Check that word builds correctly in display
  >   Expected Result: User hears TTS pronunciation of built word
  >   Evidence: Screenshot showing CVC word builder with "cat" displayed, .sisyphus/evidence/task-6-cvc-tts.png
  >
  > Scenario: Letter sound playback works correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, CVC practice page loaded
  >   Steps:
  >     1. Click on letter 'c' in CVC builder
  >     2. Verify Jolly phonics sound plays from `/audio/jolly-phonics/letters/c.mp3`
  >     3. Check network tab for 200 status on audio file load
  >     4. Try different letters to verify all sounds work
  >   Expected Result: Letter sounds play correctly for all 26 letters
  >   Evidence: Network tab screenshot showing 200 OK for audio files, .sisyphus/evidence/task-6-letter-sounds.png
  >
  > Scenario: Score tracking works correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User completed CVC word attempt
  >   Steps:
  >     1. Build correct CVC word and submit
  >     2. Verify score increments (correct count + 1)
  >     3. Build incorrect CVC word and submit
  >     4. Verify score doesn't change or shows error feedback
  >   5. Check visual feedback (green checkmark for correct, red X for incorrect)
  >   Expected Result: Score accurately tracks correct and incorrect attempts
  >   Evidence: Screenshot showing score display, .sisyphus/evidence/task-6-score-tracking.png
  >
  > Scenario: TTS fallback works when letter sounds fail
  >   Tool: Playwright (playwright skill)
  >   Preconditions: CVC practice page loaded, TTS available
  >   Steps:
  >     1. Simulate missing audio file by renaming audio file temporarily
  >     2. Build CVC word and play pronunciation
  >     3. Verify TTS fallback provides pronunciation without error
  >     4. Check console for TTS usage logs
  >   Expected Result: TTS provides word pronunciation when audio files fail
  >   Evidence: Console logs showing TTS usage, .sisyphus/evidence/task-6-tts-fallback.png
  > ```

  **Evidence to Capture**:
  > - [ ] CVC practice component created
  > - [ ] Screenshot of CVC word builder interface
  > - [ ] Screenshot of letter sound playback
  > - [ ] Screenshot of score tracking display
  > - [ ] Console logs showing TTS usage when needed

  **Commit**: YES (groups with 5, 7, 8)
  - Message: `feat(ui): add CVC practice with audio feedback`
  - Files: `app/activities/cvc-practice/page.tsx`

- [ ] 7. Sight Words enhanced component

  **What to do**:
  - Enhance existing `/activities/sight-words/page.tsx` component
  - Add level-based organization (Beginner, Intermediate, Advanced)
  - Filter words by difficulty level
  - Show progress through each level (words learned / total words)
  - Add word mastery tracking (3 correct = mastered)
  - Use existing UI components with enhancements
  - Maintain backward compatibility with current sight words feature

  **Must NOT do**:
  - Do not remove existing sight words game functionality
  - Do not create separate sight words data (enhance current component)
  - Do not add complex word definitions yet (Phase 2 feature)
  - Do not create word categorization beyond levels (keep simple MVP)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Sight words enhancement requires UX improvements, level filtering, and visual progress indicators
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8)
  - **Blocks**: Tasks 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (after Tasks 3, 4, 5 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Existing sight words component at `/activities/sight-words/page.tsx`
  > - Progress indicators in existing dashboard components
  > - Badge and progress component patterns

  > **API/Type References** (contracts to implement against):
  > - Sight words data structure (level, word, mastered)
  > - SightWords type from database schema

  > **Test References** (testing patterns to follow):
  > - Component testing patterns from existing activities
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Dolch and Fry sight word lists: https://sightwords.com/
  > - Sight words teaching methodology

  > **External References** (libraries and frameworks):
  > - Sight words teaching resources

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `sight words documentation` (vague)
  > - Good: `https://sightwords.com/lists/` - Show specific sight word lists (Dolch Pre-Primer, Dolch Primer, etc.), explain how to select appropriate lists by level, describe level progression strategy (e.g., Beginner = Dolch Pre-Primer, Intermediate = Dolch Primer + First Grade, Advanced = Second + Third Grade)

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Sight words component enhanced with level filter
  > - [ ] 3 difficulty levels displayed (Beginner, Intermediate, Advanced)
  > - [ ] Words filter by selected level
  > - [ ] Progress tracking shows words learned / total in level
  > - [ ] Word mastery indicator (3 correct = mastered badge)
  > - [ ] Existing bingo game feature still works
  > - [ ] Component is responsive on all devices

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Filter sight words by level and practice
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, sight words data in Firebase, user logged in
  >   Steps:
  >     1. Navigate to `/activities/sight-words`
  >     2. Verify all 3 level filters available (Beginner, Intermediate, Advanced)
  >     3. Select "Intermediate" level filter
  >     4. Verify only Intermediate words display (e.g., words from Dolch Primer + First Grade lists)
  >     5. Play a few words and verify correct feedback works
  >   Expected Result: Words filtered correctly by level, practice functions work
  >   Evidence: Screenshot showing level filter with "Intermediate" selected, filtered word list
  >
  > Scenario: Word mastery tracking
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User has practiced a word 3 times correctly
  >   Steps:
  >     1. Practice word "and" 3 times (click correct each time)
  >     2. Verify "and" shows mastery badge/star icon
  >     3. Check Firebase Realtime Database for mastered flag
  >     4. Practice word incorrectly once
  >     5. Verify mastery status persists (doesn't reset on incorrect)
  >   Expected Result: Word mastery requires 3 correct attempts, resets on incorrect
  >   Evidence: Screenshot showing "and" with mastery badge, Firebase Console screenshot with mastered flag
  >
  > Scenario: Existing bingo game still functional
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Sight words page loaded, bingo game available
  >   Steps:
  >     1. Play bingo game (original functionality)
  >     2. Verify 4x4 grid displays words correctly
  >     3. Get a bingo (4 in a row/column/diagonal)
  >     4. Verify bingo is detected and celebrated
  >   Expected Result: Original bingo game works alongside level enhancements
  >   Evidence: Screenshot of bingo game with bingo detected
  > ```

  **Evidence to Capture**:
  > - [ ] Sight words component enhanced
  > - [ ] Screenshot of level filter UI
  > - [ ] Screenshot of word mastery badges
  > - [ ] Screenshot of bingo game still working
  > - [ ] Firebase Console showing mastery tracking

  **Commit**: YES (groups with 6, 7, 8)
  - Message: `feat(ui): enhance sight words with level-based organization`
  - Files: `app/activities/sight-words/page.tsx`

- [ ] 8. Audio Player reusable component

  **What to do**:
  - Create `/components/audio-player/index.tsx` component
  - Support playback of MP3 files (Jolly Phonics sounds)
  - Include play/pause controls
  - Include volume control
  - Support multiple audio instances (concurrent playback prevention)
  - Show audio waveform or progress bar (visual feedback)
  - Expose props for custom styling and callbacks

  **Must NOT do**:
  - Do not add audio recording (Phase 2 feature)
  - Do not add audio editing capabilities (playback only)
  - Do not create playlist functionality (single audio at a time)
  - Do not add equalizer (keep simple MVP)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Audio player is UI component requiring interactive controls, visual feedback, and accessibility
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database or auth changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: Tasks 9, 10, 11, 12, 13, 14
  - **Blocked By**: None (after Task 2 completes)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Component structure in `/components/` directory
  > - Audio element patterns from existing activities
  > - State management patterns for media playback

  > **API/Type References** (contracts to implement against):
  > - HTML5 Audio API: `AudioContext`, `HTMLAudioElement`
  > - Audio player component props interface

  > **Test References** (testing patterns to follow):
  > - Component testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - HTML5 Audio API documentation: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
  > - Audio accessibility guidelines

  > **External References** (libraries and frameworks):
  > - React audio component patterns

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `HTML5 Audio API docs` (vague)
  > - Good: `https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement#usage_example` - Show specific code examples for creating audio elements, handling play/pause, managing volume, and implementing event listeners for audio state changes (canplay, timeupdate, ended)

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Audio player component created at `/components/audio-player/index.tsx`
  > - [ ] Play/pause controls work correctly
  > - [ ] Volume control adjusts audio volume (0-100%)
  > - [ ] Visual waveform or progress bar shows during playback
  > - [ ] Prevents concurrent playback of multiple audio instances
  > - [ ] Component accepts props for custom styling
  > - [ ] Audio stops when unmounted (cleanup works)

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Play audio file with play/pause/volume controls
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, audio player component integrated in test page
  >   Steps:
  >     1. Navigate to test page with audio player
  >     2. Load test MP3 file (e.g., /audio/jolly-phonics/letters/a.mp3)
  >     3. Click play button, verify audio starts playing
  >     4. Click pause, verify audio pauses, waveform freezes
  >     5. Adjust volume slider to 50%, verify audio volume changes
  >     6. Play again, verify resumes from paused position
  >     7. Seek to middle of audio, verify waveform updates
  >   Expected Result: All controls work correctly, visual feedback accurate
  >   Evidence: Screenshot of audio player with all controls, waveform displaying progress
  >
  > Scenario: Prevent concurrent audio playback
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Audio player loaded with first audio playing
  >   Steps:
  >     1. Load second audio file while first is playing
  >     2. Verify second audio automatically stops first audio (or shows error)
  >     3. Try loading third audio, verify same behavior
  >     4. Check console for concurrent playback prevention logs
  >   Expected Result: Only one audio plays at a time
  >   Evidence: Console logs showing playback stopped, .sisyphus/evidence/task-8-concurrent-audio.png
  >
  > Scenario: Audio cleanup on component unmount
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Audio player playing audio
  >   Steps:
  >     1. Navigate away from page with audio player
  >     2. Verify audio stops playing (cleanup fires)
  >     3. Check console shows cleanup logs
  >   4. Navigate back, verify audio can be played fresh (no errors)
  >   Expected Result: Audio stops when component unmounts, no memory leaks
  >   Evidence: Console logs showing cleanup, no errors after return
  > ```

  **Evidence to Capture**:
  > - [ ] Audio player component created
  > - [ ] Screenshot showing play/pause/volume controls with waveform
  > - [ ] Console logs showing concurrent playback prevention
  > - [ ] Console logs showing cleanup on unmount

  **Commit**: YES (groups with 5, 6, 7, 8)
  - Message: `feat(component): add reusable audio player component`
  - Files: `components/audio-player/index.tsx`

- [ ] 9. Progress Dashboard with charts

  **What to do**:
  - Create `/dashboard/progress/page.tsx` component
  - Display reading level progress chart
  - Display CVC words learned chart
  - Display sight words mastered chart
  - Show overall learning metrics (total time spent, activities completed)
  - Fetch progress data from Firebase Realtime Database
  - Use existing Chart.js or similar charting library
  - Make dashboard responsive and mobile-friendly

  **Must NOT do**:
  - Do not create complex analytics (keep simple visual progress)
  - Do not add detailed activity logs yet (Phase 2 feature)
  - Do not add teacher reporting yet (Phase 3 feature)
  - Do not use external charting libraries requiring heavy dependencies

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Progress dashboard is data visualization requiring chart integration, responsive design, and Firebase Realtime Database queries
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database schema changes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Tasks 12, 13, 14
  - **Blocked By**: None (after Tasks 3, 4, 5, 6, 7, 8 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Dashboard component structure from existing dashboards
  > - Chart.js or similar visualization patterns from existing codebase
  > - Firebase Realtime Database query patterns

  > **API/Type References** (contracts to implement against):
  > - Progress types from database schema
  > - Chart library API (Chart.js, Recharts, or similar)
  > - Firebase Realtime Database types

  > **Test References** (testing patterns to follow):
  > - Component testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Chart library documentation (e.g., Chart.js: https://www.chartjs.org/docs/)
  > - Firebase Realtime Database querying best practices

  > **External References** (libraries and frameworks):
  > - Chart.js documentation: https://www.chartjs.org/docs/
  > - Firebase Realtime Database docs: https://firebase.google.com/docs/database/retrieve-data

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `Chart.js docs` (vague)
  > - Good: `https://www.chartjs.org/docs/latest/getting-started/installation` - Show specific installation command, React integration example, and basic chart configuration with data structure, options for responsiveness, and handling chart updates with real-time data

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Progress dashboard component created at `/dashboard/progress/page.tsx`
  > - [ ] Reading level progress chart displays (level completion over time)
  > - [ ] CVC words learned chart displays (cumulative count)
  > - [ ] Sight words mastered chart displays (cumulative count)
  > - [ ] Overall metrics shown (total time, activities completed)
  > - [ ] Dashboard fetches data from Firebase Realtime Database
  > - [ ] Charts update in real-time when user completes activities
  > - [ ] Component is responsive on all devices

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: View progress dashboard with all charts
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, user logged in, progress data in Firebase
  >   Steps:
  >     1. Navigate to `/dashboard/progress`
  >     2. Wait for all charts to load (level, CVC words, sight words)
  >     3. Verify 3 charts display correctly with labels and data
  >     4. Verify overall metrics show at top (time, activities)
  >     5. Check charts are interactive (tooltips, legends)
  >   Expected Result: Complete progress dashboard with visual charts
  >   Evidence: Screenshot of dashboard with all charts, .sisyphus/evidence/task-9-progress-dashboard.png
  >
  > Scenario: Real-time chart updates
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dashboard loaded, user completes an activity
  >   Steps:
  >     1. Complete a CVC word or sight word in another tab
  >     2. Return to progress dashboard tab
  >     3. Verify charts update within 2 seconds (real-time)
  >     4. Check Firebase Realtime Database for new progress data
  >   Expected Result: Charts update automatically without page refresh
  >   Evidence: Screenshot showing updated chart after activity completion, Firebase Console screenshot with new progress
  >
  > Scenario: Dashboard is responsive
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dashboard loaded
  >   Steps:
  >     1. Set viewport to mobile (375x667)
  >     2. Verify charts stack vertically for mobile
  >     3. Set viewport to tablet (768x1024)
  >     4. Verify charts display in 2-column grid layout
  >     5. Set viewport to desktop (1920x1080)
  >     6. Verify charts display in 3-column grid layout
  >   Expected Result: Layout adapts to screen size
  >   Evidence: Screenshots showing 3 viewport layouts
  > ```

  **Evidence to Capture**:
  > - [ ] Progress dashboard component created
  > - [ ] Screenshot showing all 3 charts
  > - [ ] Screenshot of real-time update (within 2s)
  > - [ ] Screenshots showing responsive layout on 3 viewports

  **Commit**: YES (groups with 9, 10, 11)
  - Message: `feat(ui): add progress dashboard with charts`
  - Files: `app/dashboard/progress/page.tsx`

- [ ] 10. Real-time progress updates API

  **What to do**:
  - Create Firebase Realtime Database listeners for user progress
  - Implement real-time updates to frontend components
  - Add debouncing to prevent excessive Firebase operations
  - Handle connection errors gracefully
  - Implement optimistic updates (UI updates before Firebase confirms)
  - Create progress update helper functions

  **Must NOT do**:
  - Do not use polling (use Firebase real-time listeners)
  - Do not create complex conflict resolution (Firebase handles concurrent writes)
  - Do not implement offline caching yet (Phase 2 feature)

  **Recommended Agent Profile**:
  > - **Category**: `unspecified-high`
  > - **Skills**: `[]`
  > - **Reason**: Real-time progress updates require Firebase Realtime Database integration and backend API development. This is complex backend logic requiring understanding of Firebase SDK patterns.
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No git operations needed
  > - `playwright`: No UI component
  > - `frontend-ui-ux`: Backend logic, no UI components

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Tasks 12, 13, 14
  - **Blocked By**: None (after Tasks 3, 4, 5, 6, 7, 8, 9 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Firebase Realtime Database listener patterns
  > - Optimistic update patterns

  > **API/Type References** (contracts to implement against):
  > - Firebase Realtime Database reference methods: `onValue`, `onChildAdded`, `onChildChanged`
  > - Firebase Realtime Database types

  > **Test References** (testing patterns to follow):
  > - Firebase Realtime Database testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Firebase Realtime Database real-time updates: https://firebase.google.com/docs/database/read-and-write
  > - Firebase Realtime Database offline capabilities

  > **External References** (libraries and frameworks):
  > - Firebase Realtime Database official docs: https://firebase.google.com/docs/database

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `Firebase Realtime Database docs` (vague)
  > - Good: `https://firebase.google.com/docs/database/web/offline-capabilities` - Show specific code patterns for handling offline scenarios with `onDisconnect` events, managing local cache, and re-syncing data when connection restores, which is critical for ensuring data persistence during network interruptions

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Firebase Realtime Database listeners implemented for progress updates
  > - [ ] Listeners subscribe to user progress paths in Firebase
  > - [ ] Real-time updates reflect in dashboard < 2s requirement met
  > - [ ] Connection errors handled gracefully with retry logic
  > - [ ] Optimistic updates implemented (UI updates before Firebase confirms)
  > - [ ] Debouncing prevents excessive Firebase operations
  > - [ ] Helper functions created for common progress update operations

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Real-time progress update when user completes activity
  >   Tool: Bash (curl + Firebase SDK)
  >   Preconditions: Firebase Realtime Database initialized, user logged in, activity in progress
  >   Steps:
  >     1. User completes CVC word in dashboard component
  >     2. Wait 1-2 seconds
  >     3. Check Firebase Realtime Database for updated progress value
  >     4. Verify progress dashboard chart updates with new data
  >     5. Measure time from update trigger to UI update (< 2s)
  >   Expected Result: Progress updates in real-time without page refresh
  >   Evidence: Firebase Console screenshot showing progress update, .sisyphus/evidence/task-10-realtime-update.png with timestamp
  >
  > Scenario: Graceful handling of Firebase connection errors
  >   Tool: Bash (curl + Firebase SDK)
  >   Preconditions: Firebase Realtime Database listeners active
  >   Steps:
  >     1. Simulate network disconnection (disable internet)
  >     2. Attempt to update progress while offline
  >     3. Verify connection error is caught and logged
  >     4. Check that user sees friendly error message
  >     5. Verify data is queued for sync when connection restores
  >   Expected Result: Connection errors handled gracefully, data preserved locally
  >   Evidence: Console error logs showing connection failure, user notification displayed
  >
  > Scenario: Optimistic updates work correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Real-time listeners active
  >   Steps:
  >     1. Update progress from UI component
  >     2. Observe UI updates immediately (optimistic)
  >     3. Wait 1-2 seconds for Firebase listener to fire
  >     4. Verify Firebase confirms the update
  >     5. Try incorrect update (Firebase should reject)
  >   Expected Result: Optimistic updates provide instant feedback, Firebase confirms changes
  >   Evidence: Video recording or console logs showing optimistic update flow
  > ```

  **Evidence to Capture**:
  > - [ ] Firebase Realtime Database listener implementation code
  > - [ ] Firebase Console screenshot showing progress update listener
  > - [ ] Real-time update timing measurement (< 2s)
  > - [ ] Console logs showing error handling
  > - [ ] Evidence of optimistic update working (UI update, then Firebase confirmation)

  **Commit**: YES (groups with 9, 10, 11)
  - Message: `feat(backend): add real-time progress updates via Firebase Realtime`
  - Files: `lib/firebase/realtime-updates.ts`, `lib/utils/progress-helpers.ts`

- [ ] 11. PDF generation API

  **What to do**:
  - Create `/api/generate-worksheet/route.ts` endpoint
  - Generate PDF worksheets based on reading level
  - Include reading passages (age-appropriate text)
  - Include phonics exercises (CVC words, letter matching)
  - Include comprehension questions
  - Include activity sheets (cut/paste, fill-in-blank)
  - Return PDF as download response
  - Optimize PDF generation for < 30s target

  **Must NOT do**:
  - Do not create PDF templates in API route (use templates from Task 4)
  - Do not add PDF customization options yet (Phase 2 feature)
  - Do not implement worksheet preview (direct generation)
  - Do not save generated PDFs (generate on demand)

  **Recommended Agent Profile**:
  > - **Category**: `unspecified-high`
  > - **Reason**: PDF generation API is backend logic requiring template processing, PDF generation, and response handling
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No git operations needed
  > - `frontend-ui-ux`: Backend logic, no UI components

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Tasks 12, 13, 14
  - **Blocked By**: None (after Tasks 3, 4, 5, 6, 7, 8, 9, 10 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Next.js API route patterns
  > - PDF generation utilities from Task 4

  > **API/Type References** (contracts to implement against):
  > - Next.js Response types
  > - @react-pdf/renderer API

  > **Test References** (testing patterns to follow):
  > - API endpoint testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Next.js API routes documentation: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
  > - PDF accessibility guidelines

  > **External References** (libraries and frameworks):
  > - Next.js App Router docs: https://nextjs.org/docs/app
  > - @react-pdf/renderer documentation: https://react-pdf.org/

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `Next.js API routes docs` (vague)
  > - Good: `https://nextjs.org/docs/app/building-your-application/routing/route-handlers#dynamic-route-segments` - Show how to access dynamic route parameters like `[level]`, how to handle GET requests, and how to return PDF responses with appropriate headers (Content-Type: application/pdf, Content-Disposition: attachment)

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] PDF generation API endpoint created at `/api/generate-worksheet/route.ts`
  > - [ ] Generates worksheets for specified reading level
  > - [ ] PDFs include reading passages (age-appropriate text)
  > - [ ] PDFs include phonics exercises (CVC, letter matching)
  > - [ ] PDFs include comprehension questions
  > - [ ] PDFs include activity sheets (cut/paste, etc.)
  > - [ ] Returns PDF as download with correct headers
  > - [ ] PDF generation time < 30s for standard worksheets

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: Generate worksheet for Level 1
  >   Tool: Bash (curl)
  >   Preconditions: PDF generation API running, Firebase DB has Level 1 data
  >   Steps:
  >     1. Send GET request to `/api/generate-worksheet?level=1`
  >     2. Verify response headers (Content-Type: application/pdf)
  >     3. Verify Content-Disposition header has filename
  >     4. Download PDF file
  >     5. Open PDF and verify it contains 10-20 worksheets
  >     6. Check PDF includes reading passages for Level 1 (simple vocabulary)
  >     7. Verify PDF includes phonics exercises (CVC practice, letter matching)
  >     8. Verify PDF includes comprehension questions (3-5 questions per passage)
  >   Expected Result: PDF worksheet generated with correct content for Level 1
  >   Evidence: Downloaded PDF file showing 10-20 worksheets, curl response showing PDF headers
  >
  > Scenario: PDF generation time exceeds 30s
  >   Tool: Bash (curl + time)
  >   Preconditions: PDF generation API running
  >   Steps:
  >     1. Send request to generate complex worksheet (Level 3 with advanced content)
  >     2. Measure time from request to response
  >     3. Verify time > 30s triggers timeout warning
  >     4. Verify user receives warning message in response
  >     5. Verify request doesn't hang or fail
  >   Expected Result: Timeout warning for long PDFs, graceful handling
  >   Evidence: Console logs showing timeout, API response with warning message
  >
  > Scenario: PDF generation fails gracefully
  >   Tool: Bash (curl)
  >   Preconditions: PDF generation API running
  >   Steps:
  >     1. Send request with invalid level ID (e.g., level=999)
  >     2. Verify appropriate error response (400 Bad Request)
  >     3. Check error message is user-friendly
  >     4. Verify no PDF is generated
  >     5. Try request with missing data (malformed)
  >   Expected Result: Graceful error handling with clear messages
  >   Evidence: API response with 400 status code and error message
  > ```

  **Evidence to Capture**:
  > - [ ] PDF generation API endpoint created
  > - [ ] Generated PDF file showing correct structure
  > - [ ] Curl response showing PDF headers
  > - [ ] Timing measurement showing < 30s for standard worksheets
  > - [ ] Error handling evidence (400 responses, error messages)

  **Commit**: YES (groups with 9, 10, 11)
  - Message: `feat(backend): add PDF generation API endpoint`
  - Files: `app/api/generate-worksheet/route.ts`

- [ ] 12. Badges & Streak system

  **What to do**:
  - Define badge types in database schema (level completion, word mastery, streak)
  - Create badges in `/components/badges-display/index.tsx`
  - Implement streak counter logic (consecutive days tracking)
  - Award badges automatically when criteria met
  - Display earned badges in user profile and dashboard
  - Show streak counter in dashboard and profile
  - Create badge visual designs (icons, colors, tooltips)

  **Must NOT do**:
  - Do not create complex badge exchange system yet (Phase 2 feature)
  - Do not add badge rarity or collection features (keep simple MVP)
  - Do not create social sharing for badges (Phase 3 feature)
  - Do not over-engineer badge logic (simple criteria-based awarding)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Badge and streak system is gamification UI requiring visual design, user recognition, and Firebase Realtime Database integration
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database schema changes (schema defined in Task 3)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13, 14)
  - **Blocks**: None (can start after Tasks 3, 4, 5, 6, 7, 8, 9, 10, 11 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Badge and progress component patterns from existing dashboards
  > - Gamification UI patterns

  > **API/Type References** (contracts to implement against):
  > - Badge types from database schema
  > - Streak counter types from database schema
  > - Firebase Realtime Database types

  > **Test References** (testing patterns to follow):
  > - Component testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Gamification best practices: https://www.nngroup.com/games/research-papers/whiteboard/Multi-player%20Games%20Gamification%20Design%20-%20Badges%20-%20Achievements.pdf
  > - Streak system design patterns

  > **External References** (libraries and frameworks):
  > - Gamification design resources

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `gamification design resources` (vague)
  > - Good: `https://www.nngroup.com/games/research-papers/whiteboard/Multi-player%20Games%20Gamification%20Design%20-%20Badges%20-%20Achievements.pdf` - Show specific badge awarding triggers, visual design guidelines for badges (use icons vs images, color psychology, progressive unlocking patterns), and streak system implementation approaches (daily reset, timezone handling, break detection)

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Badges display component created at `/components/badges-display/index.tsx`
  > - [ ] Streak counter displays consecutive days
  > - [ ] Badge types defined (level completion, word mastery, streak)
  > - [ ] Badges award automatically on criteria met
  > - [ ] Earned badges display in user profile and dashboard
  > - [ ] Badge visual designs created (icons, colors, tooltips)
  > - [ ] Streak logic handles timezone and breaks correctly

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: User earns level completion badge
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User logged in, Firebase Realtime Database initialized, level selector accessible
  >   Steps:
  >     1. User completes all activities in Level 1
  >     2. Navigate to level selector or profile page
  >     3. Verify "Level 1 Complete" badge appears in badges section
  >     4. Check Firebase Realtime Database for earnedBadges array with level_1_completion badge
  >     5. Verify badge shows tooltip with description
  >   Expected Result: Level completion badge awarded and displayed correctly
  >   Evidence: Screenshot showing new badge, Firebase Console screenshot showing badge in user data
  >
  > Scenario: Word mastery badge awarded
  >   Tool: Playwright (playwright skill)
  >   Preconditions: CVC practice component loaded, user practicing words
  >   Steps:
  >     1. Practice word "cat" correctly 3 times
  >     2. Verify "Word Master: cat" badge appears with 3 stars
  >     3. Check Firebase Realtime Database for mastered_words array with "cat"
  >     4. Try practicing word incorrectly once (doesn't award badge)
  >     5. Verify badge doesn't appear on incorrect attempt
  >   Expected Result: Word mastery badge requires 3 correct attempts
  >   Evidence: Screenshot showing mastery badge, Firebase Console screenshot showing mastered_words entry
  >
  > Scenario: Streak counter updates correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User logs in multiple consecutive days
  >   Steps:
  >     1. Check current streak (e.g., 5 days) in profile
  >     2. Complete any activity today
  >     3. Refresh page or wait for next day
  >     4. Verify streak increments to 6 days
  >     5. Verify streak counter shows "6 day streak!" message
  >   Expected Result: Streak increments daily, resets on break day
  >   Evidence: Screenshot showing streak counter with 6 days, Firebase Console screenshot showing streak value
  >
  > Scenario: Streak resets correctly on day break
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User with 3-day streak doesn't log in on day 4
  >   Steps:
  >     1. Wait until day 4 passes (simulate by changing system date or waiting)
  >     2. Check Firebase Realtime Database for streak reset logic (last_activity_date)
  >     3. Verify streak shows 0 days on next login
  >     4. Verify previous earned badges remain (streak break doesn't remove badges)
  >   Expected Result: Streak resets on day break, badges persist
  >   Evidence: Firebase Console screenshot showing streak reset to 0, .sisyphus/evidence/task-12-streak-reset.png
  > ```

  **Evidence to Capture**:
  > - [ ] Badges display component created
  > - [ ] Screenshot showing level completion badge
  > - [ ] Screenshot showing word mastery badge
  > - [ ] Screenshot showing streak counter
  > - [ ] Firebase Console screenshots showing badges, streak data

  **Commit**: YES (groups with 12, 13, 14)
  - Message: `feat(gamification): add badges and streak system`
  - Files: `components/badges-display/index.tsx`, `types/database.ts` (badge types)

- [ ] 13. Rewards store component

  **What to do**:
  - Create `/gamification/rewards/page.tsx` component
  - Display available rewards (books, certificates, etc.)
  - Show user's reward inventory (what they've earned)
  - Allow users to claim rewards
  - Integrate with Firebase Realtime Database for rewards data
  - Use existing UI components (Card, Button, Badge)
  - Make responsive for mobile/tablet/desktop

  **Must NOT do**:
  - Do not create reward purchase system yet (Phase 2 feature)
  - Do not add reward redemption codes (Phase 2 feature)
  - Do not create reward categories beyond basic display (keep simple MVP)
  - Do not implement reward expiration logic (manual management)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Rewards store is gamification UI requiring inventory display, user interactions, and Firebase Realtime Database integration
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database schema changes (schema defined in Task 3)

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 12, 13, 14)
  - **Blocks**: None (can start after Tasks 3, 4, 5, 6, 7, 8, 9, 10, 11 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Dashboard component structure from existing dashboards
  > - Card and Button components from shadcn/ui
  > - Gamification UI patterns

  > **API/Type References** (contracts to implement against):
  > - Reward types from database schema
  > - Firebase Realtime Database types

  > **Test References** (testing patterns to follow):
  > - Component testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - Gamification best practices: https://www.nngroup.com/games/research-papers/whiteboard/Multi-player%20Games%20Gamification%20Design%20-%20Badges%20-%20Achievements.pdf
  > - Reward system design patterns

  > **External References** (libraries and frameworks):
  > - Gamification design resources

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `gamification design resources` (vague)
  > - Good: `https://www.nngroup.com/games/research-papers/whiteboard/Multi-player%20Games%20Gamification%20Design%20-%20Badges%20-%20Achievements.pdf` - Show specific reward categories (books, certificates, digital items), inventory display patterns (grid vs list), claim flow UI patterns (claim button, confirmation dialog), and reward redemption strategies (manual vs automatic), which helps prevent over-engineering by defining clear UI patterns

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Rewards store component created at `/gamification/rewards/page.tsx`
  > - [ ] Available rewards displayed from Firebase Realtime Database
  > - [ ] User's reward inventory shown (earned rewards)
  > - [ ] Claim button works (adds to inventory)
  > - [ ] Rewards are responsive on all devices
  > - [ ] Integration with Firebase Realtime Database confirmed

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: View available rewards and claim a reward
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Dev server running, user logged in, Firebase DB has rewards data
  >   Steps:
  >     1. Navigate to `/gamification/rewards`
  >     2. Verify all available rewards display (e.g., 5 books, 3 certificates)
  >     3. Check user's inventory shows current owned rewards
  >     4. Click "Claim" on "Gold Star Certificate" reward
  >     5. Verify "Gold Star Certificate" moves to inventory
  >     6. Check that available count decreases by 1
  >     7. Try claiming reward without enough points (should be disabled)
  >   Expected Result: Rewards display and claim functionality work correctly
  >   Evidence: Screenshot showing rewards page with claimed reward, Firebase Console screenshot showing updated user inventory
  >
  > Scenario: Insufficient points prevents claim
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Rewards page loaded, user has low points
  >   Steps:
  >     1. Find reward requiring 100 points
  >     2. Verify claim button is disabled or shows "Need 100 points"
  >     3. Check no error message in console
  >   Expected Result: Insufficient points prevents reward claim
  >   Evidence: Screenshot showing disabled claim button with points needed message
  > ```

  **Evidence to Capture**:
  > - [ ] Rewards store component created
  > - [ ] Screenshot showing available rewards and user inventory
  > - [ ] Screenshot showing reward claim
  > - [ ] Screenshot showing insufficient points prevention
  > - [ ] Firebase Console screenshots showing rewards data

  **Commit**: YES (groups with 12, 13, 14)
  - Message: `feat(gamification): add rewards store component`
  - Files: `gamification/rewards/page.tsx`

- [ ] 14. PDF worksheets viewer

  **What to do**:
  - Create `/activities/worksheets/page.tsx` component
  - Display list of generated worksheets by reading level
  - Allow users to download individual worksheets
  - Allow batch download (all worksheets for a level)
  - Show worksheet metadata (title, date, word count)
  - Integrate with PDF generation API endpoint
  - Use existing UI components (Card, Button, Badge)
  - Add loading states for PDF generation

  **Must NOT do**:
  - Do not add PDF preview (Phase 2 feature)
  - Do not add PDF editing capabilities (view and download only)
  - Do not add worksheet sharing (Phase 3 feature)
  - Do not add worksheet printing (browser default print is sufficient)

  **Recommended Agent Profile**:
  > - **Category**: `visual-engineering`
  > - **Skills**: `["frontend-ui-ux"]`
  > - **Reason**: Worksheets viewer is UI component requiring list display, download actions, and integration with PDF API
  > - **Skills Evaluated but Omitted**:
  > - `git-master`: No database changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Task 12, 13, 14)
  - **Blocks**: None (can start after Tasks 3, 4, 5, 6, 7, 8, 9, 10, 11 complete)

  **References**:

  > **Pattern References** (existing code to follow):
  > - Component structure in `/app/activities/`
  > - Card and Button components from shadcn/ui

  > **API/Type References** (contracts to implement against):
  > - PDF worksheet types from database schema
  > - Firebase Realtime Database types

  > **Test References** (testing patterns to follow):
  > - Component testing patterns
  > - Manual testing approach from project requirements

  > **Documentation References** (specs and requirements):
  > - PDF accessibility guidelines

  > **External References** (libraries and frameworks):
  > - @react-pdf/renderer documentation: https://react-pdf.org/

  **WHY Each Reference Matters**:
  > - Don't just list files - explain what pattern/information the executor should extract
  > - Bad: `@react-pdf/renderer docs` (vague)
  > - Good: `https://react-pdf.org/renderer/api/document` - Show specific document initialization options (compression, encryption, version compatibility), which are critical for PDF generation ensuring worksheets work across browsers and meet file size requirements

  **Acceptance Criteria**:

  > **If NO TDD (selected)**:
  > - [ ] Worksheets viewer component created at `/activities/worksheets/page.tsx`
  > - [ ] Displays list of worksheets by reading level
  > - [ ] Individual download buttons work (download specific worksheet)
  > - [ ] Batch download buttons work (download all for level)
  > - [ ] Worksheet metadata shown (title, date, word count)
  > - [ ] Integration with PDF generation API confirmed
  > - [ ] Loading states display during PDF generation
  > - [ ] Component is responsive on all devices

  > **Agent-Executed QA Scenarios (MANDATORY — per-scenario, ultra-detailed)**:

  > ```
  > Scenario: View and download worksheets
  >   Tool: Playwright (playwright skill)
  >   Preconditions: PDF generation API running, Firebase DB has worksheets data
  >   Steps:
  >     1. Navigate to `/activities/worksheets`
  >     2. Verify worksheets grouped by reading level (Level 1, Level 2, Level 3)
  >     3. Check worksheet count per level (10-20 as specified)
  >     4. Click individual download button for Level 1, worksheet #5
  >     5. Verify PDF downloads with correct filename (e.g., level-1-worksheet-5.pdf)
  >     6. Click batch download for Level 1
  >     7. Verify all 10-20 PDFs download in zip or individually
  >   Expected Result: Worksheets display correctly, downloads work as expected
  >   Evidence: Screenshot showing worksheet list, download confirmation, .sisyphus/evidence/task-14-worksheets-download.png
  >
  > Scenario: Worksheet metadata displays correctly
  >   Tool: Playwright (playwright skill)
  >   Preconditions: Worksheets page loaded
  >   Steps:
  >     1. Verify each worksheet shows title (e.g., "Level 1 - Letter C")
  >     2. Verify each worksheet shows generation date
  >     3. Verify each worksheet shows word count (e.g., "15 words")
  >     4. Hover over worksheet to see tooltip with detailed info
  >   Expected Result: Metadata displays correctly and informatively
  >   Evidence: Screenshot showing worksheet card with tooltip displaying full metadata
  >
  > Scenario: Loading state during PDF generation
  >   Tool: Playwright (playwright skill)
  >   Preconditions: User initiates batch download (generates multiple PDFs)
  >   Steps:
  >     1. Click batch download for Level 3 (advanced, many worksheets)
  >     2. Verify loading spinner appears on buttons
  >     3. Verify individual download buttons disabled during generation
  >     4. Wait for generation to complete
  >     5. Verify buttons re-enabled and downloads ready
  >     6. Check loading message shows progress (e.g., "Generating 15 of 20 worksheets...")
  >   Expected Result: Loading states clear, user understands what's happening
  >   Evidence: Screenshot showing loading spinner and progress message, .sisyphus/evidence/task-14-loading-state.png
  > ```

  **Evidence to Capture**:
  > - [ ] Worksheets viewer component created
  > - [ ] Screenshot showing worksheet list by level
  > - [ ] Screenshot of download functionality
  > - [ ] Screenshot showing metadata display
  > - [ ] Screenshot showing loading state

  **Commit**: YES (groups with 12, 13, 14)
  - Message: `feat(ui): add PDF worksheets viewer component`
  - Files: `activities/worksheets/page.tsx`

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|-------------|
| 1, 2, 3, 4 | `feat(infra): setup Firebase Realtime Database infrastructure` | `lib/firebase/database.ts`, `docs/database-schema.md`, `firebase.database.rules`, `package.json` | All Firebase setup verified |
| 5, 6, 7, 8 | `feat(ui): add core literacy components (level selector, CVC practice, sight words, audio player)` | `dashboard/level-selector/page.tsx`, `activities/cvc-practice/page.tsx`, `activities/sight-words/page.tsx`, `components/audio-player/index.tsx` | All components tested and responsive |
| 9, 10, 11 | `feat(backend): add real-time progress and PDF generation` | `dashboard/progress/page.tsx`, `lib/firebase/realtime-updates.ts`, `api/generate-worksheet/route.ts` | Real-time < 2s, PDF < 30s verified |
| 12, 13, 14 | `feat(gamification): add badges, rewards, and worksheets viewer` | `components/badges-display/index.tsx`, `gamification/rewards/page.tsx`, `activities/worksheets/page.tsx` | All gamification features working |

---

## Success Criteria

### Verification Commands
```bash
# Firebase Realtime Database connection
npm run dev
# Should see: Firebase Realtime Database connected and initialized

# Component verification
curl http://localhost:3000/dashboard/level-selector
# Should see: Level selector with 3-5 levels displayed

# Audio verification
curl http://localhost:3000/audio/jolly-phonics/letters/a.mp3
# Should return: 200 OK with audio file

# PDF generation
curl http://localhost:3000/api/generate-worksheet?level=1
# Should return: PDF with correct headers and worksheet content

# Real-time updates timing
# Manual test: Complete activity and observe dashboard update time
# Should see: < 2 seconds for chart update
```

### Final Checklist
- [ ] Firebase Realtime Database configured and connected
- [ ] All 8 frontend components implemented and tested
- [ ] 42 Jolly Phonics audio files downloaded and organized
- [ ] Database schema defined for 6+ tables
- [ ] Real-time progress updates < 2s
- [ ] PDF generation < 30s
- [ ] Badges and streak system implemented
- [ ] Manual testing completed with user feedback
- [ ] All components responsive on mobile, tablet, desktop
- [ ] No Supabase code in final implementation
- [ ] Firebase Auth integration confirmed working
