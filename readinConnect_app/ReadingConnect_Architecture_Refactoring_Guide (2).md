# ReadingConnect: Architecture Refactoring Guide

**From Monolith to React + Cloud Functions**  
*Solo Developer Edition | Firebase Free Tier Optimized | Testing-First Approach*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Assessment](#2-current-architecture-assessment)
3. [Recommended Architecture: React + Cloud Functions](#3-recommended-architecture-react--cloud-functions)
4. [Separation of Concerns Blueprint](#4-separation-of-concerns-blueprint)
5. [Firebase Free Tier Optimization](#5-firebase-free-tier-optimization)
6. [Mastery Enforcement System Design](#6-mastery-enforcement-system-design)
7. [Testing & Teacher Feedback Phase](#7-testing--teacher-feedback-phase)
8. [Incremental Migration Roadmap](#8-incremental-migration-roadmap)
9. [Solo Developer Maintenance Guide](#9-solo-developer-maintenance-guide)
10. [Future Phase: Subscription Implementation](#10-future-phase-subscription-implementation)
11. [Appendix: Code Examples](#11-appendix-code-examples)

---

## 1. Executive Summary

This architectural refactoring guide addresses the critical findings from the ReadingConnect design audit and provides a roadmap for transforming the application from a monolithic structure to a modern React + Cloud Functions architecture. The recommendations prioritize **functionality testing and teacher feedback** before any monetization implementation.

### Current Priority: Test → Validate → Monetize

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT PRIORITIES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1 (NOW)              PHASE 2 (LATER)                     │
│  ─────────────              ──────────────                      │
│  ✓ Core Functionality       ○ Subscription System               │
│  ✓ Mastery Enforcement      ○ Payment Processing                │
│  ✓ Teacher Dashboard        ○ Premium Features                  │
│  ✓ User Testing             ○ Monetization                      │
│  ✓ Feedback Integration                                        │
│                                                                  │
│  "Get it right, then monetize"                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Objectives

- **Separation of Concerns:** Decouple frontend presentation from business logic
- **Mastery Enforcement:** Implement structural gating aligned with phonics pedagogy
- **Testing Infrastructure:** Build for easy testing and rapid iteration
- **Teacher Feedback Loop:** Enable teachers to provide actionable feedback
- **Low Maintenance:** Design for solo developer sustainability
- **Free Tier Compatibility:** Stay within Firebase Spark plan limits

### Critical Findings Addressed

| Issue | Severity | Architectural Fix |
|-------|----------|-------------------|
| Mastery bypass allowed | Critical | Cloud Functions validation layer |
| Gamification misalignment | High | Server-side achievement engine |
| No progression gating | High | Firestore security rules + API gates |
| Teacher dashboard gaps | Medium | Enhanced analytics with feedback system |
| Phonemic awareness missing | Medium | Modular activity system |

---

## 2. Current Architecture Assessment

### 2.1 Monolithic Structure Analysis

Based on the design audit, the current ReadingConnect application follows a monolithic architecture where frontend components, business logic, and data access are tightly coupled within Next.js server components and client-side hooks. This structure creates several challenges for testing and iteration.

### Current Component Dependencies

| Component | Location | Coupling Issues |
|-----------|----------|-----------------|
| Phonics Activity | `app/activities/phonics/page.tsx` | Contains UI, state, business logic, Firestore calls |
| Sight Words Activity | `app/activities/sight-words/page.tsx` | Duplicated validation logic, no shared mastery system |
| Fluency Tracker | `app/activities/fluency/page.tsx` | WPM calculation in client, inconsistent scoring |
| Achievement System | `lib/hooks/useAchievementCelebrations.ts` | Client-side only, easily bypassed, no server validation |
| Progress Tracking | `lib/hooks/useProgress.ts` | Direct Firestore writes without validation |
| Teacher Dashboard | `app/teacher/dashboard/page.tsx` | Limited aggregation, no real-time skill analytics |

### 2.2 Technical Debt Inventory

- **Duplicated Logic:** Mastery calculations exist in multiple activity components without a shared service. Each activity implements its own progress tracking, leading to inconsistent mastery thresholds.
- **Client-Side Trust:** All achievement processing and point calculations occur on the client side, allowing users to manipulate scores and bypass mastery requirements.
- **No Schema Enforcement:** Firestore reads and writes lack validation layers, permitting malformed data and enabling progression exploits.
- **Scattered State Management:** Progress data is managed through multiple React hooks and context providers, making consistency difficult.
- **Missing Analytics Pipeline:** Teacher dashboard aggregates basic metrics but lacks skill-level analytics for instructional decision-making.

### 2.3 Firebase Usage Analysis

| Operation | Current Pattern | Est. Daily Usage | Optimization Needed |
|-----------|-----------------|------------------|---------------------|
| Progress reads | Every activity load | ~500-2000 | Cache with TTL |
| Progress writes | Every answer submission | ~1000-5000 | Batch updates |
| Achievement checks | Every session end | ~200-500 | Cloud Functions only |
| Leaderboard queries | Dashboard load | ~50-200 | Denormalized cache |

---

## 3. Recommended Architecture: React + Cloud Functions

### 3.1 Architecture Overview

The recommended architecture separates the application into three distinct layers:

| Layer | Technology | Responsibilities | Scaling |
|-------|------------|------------------|---------|
| Presentation | React + Next.js | UI components, user interaction, optimistic updates, caching | CDN/Edge |
| Business Logic | Cloud Functions | Validation, mastery calculation, achievement processing | Auto-scale |
| Data Access | Firestore + Security Rules | Persistence, real-time sync, access control | Auto-scale |

### 3.2 Directory Structure

```
readingconnect/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication routes
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (student)/                    # Student-facing routes
│   │   ├── activities/
│   │   │   ├── phonics/page.tsx
│   │   │   ├── sight-words/page.tsx
│   │   │   ├── fluency/page.tsx
│   │   │   └── comprehension/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── profile/page.tsx
│   ├── (teacher)/                    # Teacher-facing routes
│   │   ├── dashboard/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── students/page.tsx
│   │   └── feedback/page.tsx         # Teacher feedback system
│   ├── (parent)/                     # Parent-facing routes
│   │   └── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx                      # Landing page
│
├── functions/                        # Firebase Cloud Functions
│   └── src/
│       ├── activities/               # Activity processing functions
│       │   ├── processPhonicsAnswer.ts
│       │   ├── processSightWordAnswer.ts
│       │   ├── processFluencySession.ts
│       │   └── processComprehensionAnswer.ts
│       ├── mastery/                  # Mastery calculation functions
│       │   ├── calculateMastery.ts
│       │   ├── checkPhaseUnlock.ts
│       │   └── updateMasteryState.ts
│       ├── achievements/             # Achievement processing functions
│       │   ├── processAchievements.ts
│       │   ├── checkMilestones.ts
│       │   └── awardBadge.ts
│       ├── feedback/                 # Teacher feedback system
│       │   ├── submitFeedback.ts
│       │   └── getFeedbackStats.ts
│       ├── users/                    # User management functions
│       │   ├── createUserProfile.ts
│       │   └── updateSettings.ts
│       ├── utils/                    # Shared utilities
│       │   ├── validation.ts
│       │   ├── scoring.ts
│       │   └── firestore.ts
│       └── index.ts                  # Function exports
│
├── lib/                              # Shared client-side libraries
│   ├── api/                          # API client functions
│   │   ├── activities.ts
│   │   ├── mastery.ts
│   │   ├── achievements.ts
│   │   └── feedback.ts
│   ├── hooks/                        # React hooks
│   │   ├── useActivity.ts
│   │   ├── useMastery.ts
│   │   ├── useProgress.ts
│   │   └── useFeedback.ts
│   ├── stores/                       # Zustand state stores
│   │   ├── userStore.ts
│   │   ├── activityStore.ts
│   │   └── settingsStore.ts
│   └── utils/                        # Client utilities
│       ├── caching.ts
│       ├── formatting.ts
│       └── validation.ts
│
├── types/                            # TypeScript definitions
│   ├── database.ts                   # Firestore document types
│   ├── activities.ts                 # Activity types
│   ├── mastery.ts                    # Mastery types
│   ├── achievements.ts               # Achievement types
│   └── feedback.ts                   # Feedback types
│
├── firestore.rules                   # Firestore security rules
└── firestore.indexes.json            # Firestore indexes
```

### 3.3 Data Flow Architecture

The data flow ensures all critical operations go through Cloud Functions for validation:

1. **User Action:** Student submits an answer in an activity
2. **Optimistic Update:** Frontend immediately updates local state for responsive UI
3. **Cloud Function Call:** Frontend calls the appropriate Cloud Function
4. **Server Validation:** Cloud Function validates answer, calculates mastery, checks achievements
5. **Firestore Update:** Cloud Function writes validated results with security rule enforcement
6. **Response:** Cloud Function returns updated mastery state and achievements
7. **State Reconciliation:** Frontend reconciles optimistic state with server response

### 3.4 Cloud Functions Inventory

| Function | Trigger | Purpose | Est. Invocations |
|----------|---------|---------|------------------|
| `processActivityAnswer` | HTTPS callable | Validate answer, update mastery, check achievements | 100-500/day |
| `calculateMasteryState` | Firestore trigger | Recalculate mastery on progress changes | 50-200/day |
| `checkPhaseUnlock` | HTTPS callable | Determine if student can access next phase | 20-50/day |
| `processAchievements` | Firestore trigger | Award badges and milestones | 20-100/day |
| `generateTeacherReport` | Scheduled (daily) | Aggregate student progress | 1/day |
| `submitTeacherFeedback` | HTTPS callable | Collect teacher feedback on functionality | 10-50/day |

**Total estimated monthly invocations: 6,000-25,000** (well under 125,000 free tier limit)

---

## 4. Separation of Concerns Blueprint

### 4.1 Principle: Single Responsibility Modules

Each module has a single, well-defined responsibility:

| Concern | Module Location | Owner Layer | Example Operations |
|---------|-----------------|-------------|-------------------|
| UI Rendering | `app/(student)/activities/*` | Frontend | Display phonics cards, play sounds, show feedback |
| Activity State | `lib/stores/activityStore.ts` | Frontend | Track current question, score, time |
| Answer Validation | `functions/src/activities/*` | Cloud Functions | Verify correct answer, check timing |
| Mastery Calculation | `functions/src/mastery/*` | Cloud Functions | Update letter mastery, check thresholds |
| Achievement Processing | `functions/src/achievements/*` | Cloud Functions | Check milestones, award badges |
| Progress Persistence | `firestore.rules + functions` | Data Layer | Save progress, enforce schema |
| Teacher Feedback | `functions/src/feedback/*` | Cloud Functions | Collect and aggregate feedback |

### 4.2 Activity Module Architecture

Each activity type follows a consistent pattern:

**Frontend Activity Component** - ONLY responsible for UI rendering:

```typescript
// app/(student)/activities/phonics/page.tsx
export default function PhonicsActivity() {
  const { currentPhase, letters } = useActivityState();
  const { submitAnswer, isSubmitting } = useActivitySubmit('phonics');
  const { mastery } = useMastery();
  
  // UI rendering only - no business logic
  return (
    <ActivityLayout>
      <ProgressBar current={currentPhase} total={6} />
      <LetterGrid letters={letters} onSelect={handleSelect} />
      <FeedbackDisplay result={lastResult} />
    </ActivityLayout>
  );
}
```

**Cloud Function Business Logic** - Handles all validation and calculation:

```typescript
// functions/src/activities/processPhonicsAnswer.ts
export const processPhonicsAnswer = functions.https.onCall(
  async (data, context) => {
    // 1. Validate authentication
    const uid = validateAuth(context);
    
    // 2. Validate input schema
    const { letter, selectedSound, phaseId } = validateInput(data);
    
    // 3. Check phase access (mastery gating)
    await verifyPhaseAccess(uid, phaseId);
    
    // 4. Validate answer correctness
    const isCorrect = validateAnswer(letter, selectedSound);
    
    // 5. Calculate mastery delta
    const masteryDelta = calculateMasteryDelta(isCorrect, phaseId);
    
    // 6. Update Firestore with validated data
    const result = await updateProgress(uid, {
      letter, isCorrect, masteryDelta, timestamp: Date.now()
    });
    
    // 7. Check for achievements (async)
    await checkAchievements(uid);
    
    return { isCorrect, masteryLevel: result.newLevel, achievements: result.newBadges };
  }
);
```

### 4.3 Shared Service Layer

Shared utilities prevent code duplication:

| Service | Location | Functions Using It |
|---------|----------|-------------------|
| Mastery Calculator | `functions/src/utils/mastery.ts` | processPhonicsAnswer, processSightWordAnswer |
| Achievement Engine | `functions/src/utils/achievements.ts` | processAchievements, checkMilestones |
| Scoring System | `functions/src/utils/scoring.ts` | All activity processors |
| Validation Helpers | `functions/src/utils/validation.ts` | All callable functions |
| Firestore Helpers | `functions/src/utils/firestore.ts` | All functions reading/writing data |

### 4.4 State Management Architecture

Uses Zustand for simple, performant state management:

```typescript
// lib/stores/activityStore.ts
interface ActivityState {
  activityType: 'phonics' | 'sight_words' | 'fluency' | 'comprehension';
  currentQuestion: number;
  localScore: number;
  timeRemaining: number;
  answers: AnswerRecord[];
  
  // Actions
  startActivity: (type: string) => void;
  recordAnswer: (answer: AnswerRecord) => void;
  tickTimer: () => void;
  resetActivity: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activityType: null,
  currentQuestion: 0,
  localScore: 0,
  timeRemaining: 0,
  answers: [],
  
  startActivity: (type) => set({ activityType: type, currentQuestion: 0 }),
  recordAnswer: (answer) => set((s) => ({ 
    answers: [...s.answers, answer],
    currentQuestion: s.currentQuestion + 1
  })),
  tickTimer: () => set((s) => ({ timeRemaining: Math.max(0, s.timeRemaining - 1) })),
  resetActivity: () => set({ answers: [], localScore: 0 })
}));
```

### 4.5 API Client Layer

Abstracts Cloud Function calls from components:

```typescript
// lib/api/activities.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export async function submitPhonicsAnswer(data: {
  letter: string;
  selectedSound: string;
  phaseId: number;
}) {
  const fn = httpsCallable(functions, 'processPhonicsAnswer');
  const result = await fn(data);
  return result.data as PhonicsAnswerResult;
}

export async function checkPhaseAccess(phaseId: number) {
  const fn = httpsCallable(functions, 'checkPhaseUnlock');
  const result = await fn({ phaseId });
  return result.data as PhaseAccessResult;
}
```

---

## 5. Firebase Free Tier Optimization

### 5.1 Spark Plan Limits

| Resource | Free Tier Limit | Our Strategy |
|----------|-----------------|--------------|
| Firestore Reads | 125K/day (50K single doc) | Client-side caching, denormalization, batch reads |
| Firestore Writes | 50K/day (20K single doc) | Batch updates, write aggregation |
| Firestore Deletes | 40K/day (20K single doc) | Soft deletes, TTL policies |
| Cloud Functions | 125K invocations/month | Batched operations, optimized triggers |
| Cloud Storage | 5GB stored, 1GB/day download | CDN for static assets, optimize media |
| Hosting | 10GB/month transferred | Static generation, edge caching |

### 5.2 Firestore Read Optimization

1. **Client-Side Caching:** Implement React Query or SWR-based cache with 5-10 minute TTLs. Reduces reads by 80-90%.
2. **Denormalization:** Store frequently accessed aggregates (total points, mastered letter count) on user document.
3. **Subcollection Strategy:** Structure data so common queries hit indexed subcollections rather than collection group queries.
4. **Pagination:** Always paginate results in teacher dashboard. Never load entire rosters at once.
5. **Real-time Listener Optimization:** Use snapshot listeners only where real-time updates are essential.

### 5.3 Firestore Write Optimization

1. **Batched Writes:** Accumulate updates during activity sessions, write in batches at session end.
2. **Optimistic Locking:** Use transactions only when necessary. Simple `set` with `merge` is sufficient for most updates.
3. **Soft Deletes:** Mark documents with `deleted` flag instead of deleting. Avoids quota consumption.
4. **On-Create vs On-Update:** Design triggers to fire on creation rather than updates where possible.

### 5.4 Cloud Function Optimization

1. **HTTPS Callable vs Triggers:** Prefer callables over Firestore triggers for activity processing. Batch multiple operations into single invocation.
2. **Achievement Batching:** Check achievements at session end rather than after every answer. Reduces calls by 90%.
3. **Scheduled Functions:** Use daily scheduled functions for teacher reports rather than on-demand generation.
4. **Cold Start Mitigation:** Keep functions small and focused. Deploy related functions together.

### 5.5 Estimated Resource Usage (100 Active Students)

| Resource | Est. Daily Usage | % of Limit | Headroom |
|----------|------------------|------------|----------|
| Firestore Reads | 8,000-15,000 | 6-12% | High |
| Firestore Writes | 2,000-5,000 | 4-10% | High |
| Function Invocations | 200-800 | 5-20% monthly | High |

---

## 6. Mastery Enforcement System Design

### 6.1 Mastery Schema Definition

```typescript
// types/mastery.ts

interface LetterMastery {
  letter: string;
  phase: number;
  status: 'new' | 'learning' | 'mastered';
  consecutiveCorrect: number;
  totalAttempts: number;
  correctAttempts: number;
  lastAttemptAt: Date;
  masteredAt?: Date;
  regressionCount: number;
}

interface PhaseProgress {
  phaseId: number;
  letters: string[];
  masteryThreshold: number;
  masteredCount: number;
  isUnlocked: boolean;
  completedAt?: Date;
}

interface StudentMasteryState {
  userId: string;
  phonics: {
    currentPhase: number;
    phases: PhaseProgress[];
    letters: Record<string, LetterMastery>;
    lastUpdated: Date;
  };
  sightWords: {
    currentLevel: 'pre-primer' | 'primer' | 'grade-1' | 'grade-2';
    masteredWords: string[];
    totalMastered: number;
  };
  fluency: {
    currentLevel: number;
    wpm: number;
    accuracy: number;
    lastAssessment: Date;
  };
}
```

### 6.2 Mastery Calculation Engine

```typescript
// functions/src/mastery/calculateMastery.ts

const PHASE_THRESHOLDS = {
  1: 2,  // Phase 1: 2 consecutive correct to master
  2: 2,  // Phase 2: 2 consecutive correct
  3: 3,  // Phase 3: 3 consecutive correct
  4: 4,  // Phase 4: 4 consecutive correct (digraphs are harder)
  5: 3,  // Phase 5: 3 consecutive correct
  6: 5,  // Phase 6: 5 consecutive correct (full alphabet)
};

export function calculateMasteryDelta(
  letter: string,
  isCorrect: boolean,
  currentMastery: LetterMastery,
  phaseId: number
): { newStatus: MasteryStatus; delta: number } {
  const threshold = PHASE_THRESHOLDS[phaseId];
  
  if (isCorrect) {
    const newConsecutive = currentMastery.consecutiveCorrect + 1;
    
    if (newConsecutive >= threshold && currentMastery.status !== 'mastered') {
      return { newStatus: 'mastered', delta: 1 };
    } else if (newConsecutive >= Math.ceil(threshold / 2) && currentMastery.status === 'new') {
      return { newStatus: 'learning', delta: 0 };
    }
    return { newStatus: currentMastery.status, delta: 0 };
  } else {
    // Wrong answer resets consecutive and may demote
    if (currentMastery.status === 'mastered') {
      const recentAccuracy = calculateRecentAccuracy(currentMastery);
      if (recentAccuracy < 0.70) {
        return { newStatus: 'learning', delta: -1 };
      }
    }
    return { newStatus: currentMastery.status, delta: 0 };
  }
}
```

### 6.3 Phase Access Control

```typescript
// functions/src/mastery/checkPhaseUnlock.ts

export async function verifyPhaseAccess(
  uid: string,
  targetPhaseId: number
): Promise<{ canAccess: boolean; reason?: string }> {
  const progress = await getStudentProgress(uid);
  const currentPhase = progress.phonics.currentPhase;
  
  // Can always access current or previous phases
  if (targetPhaseId <= currentPhase) {
    return { canAccess: true };
  }
  
  // For next phase, verify mastery of current phase
  const currentPhaseProgress = progress.phonics.phases[currentPhase - 1];
  const masteredCount = currentPhaseProgress.masteredCount;
  const threshold = currentPhaseProgress.masteryThreshold;
  
  if (masteredCount >= threshold) {
    await updateCurrentPhase(uid, targetPhaseId);
    return { canAccess: true };
  }
  
  return {
    canAccess: false,
    reason: `Master ${threshold - masteredCount} more letters to unlock Phase ${targetPhaseId}`
  };
}
```

### 6.4 Firestore Security Rules for Mastery

```javascript
// firestore.rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check phase access
    function canAccessPhase(phaseId) {
      let progress = get(/databases/$(database)/documents/users/$(request.auth.uid)/progress/main).data;
      let currentPhase = progress.phonics.currentPhase;
      let phases = progress.phonics.phases;
      
      // Allow access to current or previous phases
      if (phaseId <= currentPhase) return true;
      
      // For next phase, require mastery threshold
      if (phaseId == currentPhase + 1) {
        let prevPhase = phases[currentPhase - 1];
        return prevPhase.masteredCount >= prevPhase.masteryThreshold;
      }
      
      return false;
    }
    
    // Students can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Progress subcollection - validate writes
      match /progress/{doc} {
        allow read: if request.auth.uid == userId;
        // Only allow writes from Cloud Functions (admin SDK)
        allow write: if false;
      }
      
      // Activity sessions - validate phase access
      match /sessions/{sessionId} {
        allow create: if request.auth.uid == userId 
                      && canAccessPhase(request.resource.data.phaseId);
        allow read: if request.auth.uid == userId;
      }
    }
  }
}
```

### 6.5 Frontend UX for Mastery Gates

1. **Visual Lock Indicators:** Locked phases show lock icon with letters needed to unlock
2. **Progress Toward Unlock:** Progress bar shows mastery progress toward next phase
3. **Celebration on Unlock:** Celebrate achievement when student unlocks a new phase
4. **Teacher Override:** Teachers can manually unlock phases with audit trail

---

## 7. Testing & Teacher Feedback Phase

### 7.1 Testing Strategy Overview

Before any monetization, the app needs rigorous testing with real users. This phase is designed to:

1. Validate mastery enforcement works correctly
2. Ensure gamification aligns with learning outcomes
3. Gather teacher feedback on dashboard utility
4. Identify bugs and edge cases
5. Refine the user experience

### 7.2 Teacher Feedback System

```typescript
// types/feedback.ts

interface TeacherFeedback {
  id: string;
  teacherId: string;
  category: 'bug' | 'feature_request' | 'content_issue' | 'ux_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  stepsToReproduce?: string[];
  screenshots?: string[];
  studentId?: string;  // If feedback relates to specific student
  activityType?: 'phonics' | 'sight_words' | 'fluency' | 'comprehension';
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

interface FeedbackStats {
  totalOpen: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionTime: number;
}
```

### 7.3 Feedback Collection Implementation

```typescript
// functions/src/feedback/submitFeedback.ts

export const submitTeacherFeedback = functions.https.onCall(
  async (data, context) => {
    const uid = validateAuth(context);
    
    // Verify teacher role
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(uid)
      .get();
    
    if (userDoc.data()?.role !== 'teacher') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only teachers can submit feedback'
      );
    }
    
    const feedback: Omit<TeacherFeedback, 'id'> = {
      teacherId: uid,
      category: data.category,
      priority: data.priority || 'medium',
      title: data.title,
      description: data.description,
      stepsToReproduce: data.stepsToReproduce,
      screenshots: data.screenshots || [],
      studentId: data.studentId,
      activityType: data.activityType,
      status: 'open',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const ref = await admin.firestore()
      .collection('feedback')
      .add(feedback);
    
    // Notify developer (you) of new feedback
    await sendFeedbackNotification(ref.id, feedback);
    
    return { id: ref.id, success: true };
  }
);
```

### 7.4 Teacher Dashboard Feedback Integration

```typescript
// app/(teacher)/feedback/page.tsx

export default function TeacherFeedbackPage() {
  const { feedback, submitFeedback, isSubmitting } = useFeedback();
  
  return (
    <div className="feedback-container">
      <h1>Submit Feedback</h1>
      <FeedbackForm onSubmit={submitFeedback} />
      
      <h2>Your Previous Feedback</h2>
      <FeedbackList feedback={feedback} />
      
      <h2>Known Issues</h2>
      <KnownIssuesList />
    </div>
  );
}
```

### 7.5 Testing Checklist

#### Functional Testing

- [ ] Phonics activity: Verify correct/incorrect answers update mastery
- [ ] Phonics activity: Verify consecutive correct counts reset on wrong answer
- [ ] Phonics activity: Verify phase unlock triggers at correct threshold
- [ ] Sight words: Verify word mastery tracking
- [ ] Fluency: Verify WPM calculation accuracy
- [ ] Comprehension: Verify question scoring

#### Mastery Enforcement Testing

- [ ] Student cannot access Phase 2 without Phase 1 mastery
- [ ] Student cannot skip phases via direct URL
- [ ] Mastery status persists across sessions
- [ ] Regression: Mastery can be lost after repeated failures
- [ ] Teacher override: Teachers can manually unlock phases

#### Edge Case Testing

- [ ] Network disconnect during answer submission
- [ ] Page reload during activity
- [ ] Multiple devices logged in simultaneously
- [ ] Session timeout during activity
- [ ] Rapid answer submission (prevent race conditions)

#### Teacher Dashboard Testing

- [ ] Class roster displays correctly
- [ ] Student progress updates in real-time
- [ ] Mastery heatmap renders correctly
- [ ] Reports generate with accurate data
- [ ] Feedback submission works

### 7.6 User Testing Protocol

#### Phase 1: Internal Testing (Week 1-2)
- Solo developer testing all features
- Fix obvious bugs before external testing
- Document all known issues

#### Phase 2: Teacher Beta (Week 3-4)
- Recruit 3-5 teachers for testing
- Provide test student accounts
- Weekly feedback sessions
- Prioritize fixes based on feedback

#### Phase 3: Student Beta (Week 5-6)
- Teachers invite small group of students (5-10 per class)
- Monitor for issues in real usage
- Collect both teacher and parent feedback
- Iterate on features

#### Phase 4: Expanded Beta (Week 7-8)
- Expand to more classrooms
- Load test with concurrent users
- Final bug fixes before production

---

## 8. Incremental Migration Roadmap

The migration is designed to be incremental, allowing continued development during transition. Each phase delivers value independently.

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up infrastructure without touching existing code

- [ ] Set up Firebase Cloud Functions project structure in `/functions` directory
- [ ] Create TypeScript type definitions in `/types` for all data models
- [ ] Implement shared utility functions (validation, scoring, Firestore helpers)
- [ ] Set up Zustand stores for client state management
- [ ] Create API client layer with error handling and retry logic
- [ ] Write Firestore security rules for basic data access patterns
- [ ] Set up Firebase Emulator Suite for local testing

**Deliverable:** New project structure alongside existing code, nothing broken

### Phase 2: Mastery System (Weeks 3-4)

**Goal:** Implement mastery logic that can run in parallel with existing system

- [ ] Implement mastery calculation engine in Cloud Functions
- [ ] Create `processActivityAnswer` callable function
- [ ] Build phase access verification logic
- [ ] Update Firestore security rules to enforce mastery gates
- [ ] Create frontend mastery hooks and state management
- [ ] Add visual lock/unlock UI components
- [ ] Test mastery system in parallel with existing progress tracking

**Deliverable:** Mastery system working alongside existing progress, can A/B test

### Phase 3: Activity Migration (Weeks 5-8)

**Goal:** Migrate each activity type one at a time

**Week 5: Phonics (highest priority for mastery gates)**
- [ ] Create `processPhonicsAnswer` Cloud Function
- [ ] Update phonics page to use new API client
- [ ] Test thoroughly with emulator
- [ ] Deploy to production behind feature flag
- [ ] Gradually roll out to users

**Week 6: Sight Words**
- [ ] Create `processSightWordAnswer` Cloud Function
- [ ] Update sight words page to use new API client
- [ ] Test and deploy

**Week 7: Fluency**
- [ ] Create `processFluencySession` Cloud Function
- [ ] Update fluency page to use new API client
- [ ] Test and deploy

**Week 8: Comprehension**
- [ ] Create `processComprehensionAnswer` Cloud Function
- [ ] Update comprehension page to use new API client
- [ ] Test and deploy

**Deliverable:** All activities migrated to Cloud Functions architecture

### Phase 4: Achievement System (Weeks 9-10)

**Goal:** Redesign gamification to align with mastery

- [ ] Redesign milestone conditions to focus on skill over quantity
- [ ] Implement achievement processing Cloud Functions
- [ ] Create skill-based milestone definitions
- [ ] Add accuracy-weighted point calculation
- [ ] Build achievement notification system
- [ ] Update badge collection UI with skill indicators
- [ ] Migrate existing user achievements to new system

**Deliverable:** Achievement system that rewards mastery, not volume

### Phase 5: Teacher Tools & Feedback (Weeks 11-12)

**Goal:** Enhanced teacher dashboard with feedback system

- [ ] Create scheduled function for daily report generation
- [ ] Build letter mastery heatmap component
- [ ] Add error pattern analysis to teacher dashboard
- [ ] Implement skill-based student grouping view
- [ ] Create intervention recommendation system
- [ ] Add teacher override capability with audit logging
- [ ] Implement teacher feedback collection system
- [ ] Test with real teacher data

**Deliverable:** Teacher dashboard with actionable skill analytics + feedback loop

---

## 9. Solo Developer Maintenance Guide

### 9.1 Development Workflow

**Local Development:**
- Use Firebase Emulator Suite for local testing
- Eliminates deployment time during development
- Stays within free tier limits

**Branch Strategy:**
- Simple main/feature branch workflow
- Each feature or bug fix gets a branch
- Test locally with emulators before merging

**Testing Priority:**
- Focus testing on Cloud Functions that enforce mastery
- Frontend components can be validated visually
- Backend logic needs unit tests

**Deployment:**
- Deploy frontend to Vercel (free tier)
- Deploy Cloud Functions to Firebase
- Vercel provides preview deployments for testing

### 9.2 Monitoring and Alerts

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Sentry | Error tracking | 5K errors/month |
| Firebase Console Alerts | Quota limits (80% threshold) | Included |
| Firebase Performance Monitoring | Function execution times | Included |
| Billing Alerts | Unexpected usage detection | Included |

### 9.3 Documentation Strategy

**API Contracts:**
- TypeScript types in `/types` define input/output for all Cloud Functions
- Reference from both frontend and backend

**Architecture Decisions:**
- Simple ADR format in `/docs` folder
- Record why decisions were made

**Runbooks:**
- Markdown files for common operations
- Deploying functions, adding activity types, handling feedback

### 9.4 Feature Development Process

1. **Define Types:** Start with TypeScript types in `/types`
2. **Backend First:** Implement Cloud Functions, test with emulators
3. **API Client:** Add functions to `/lib/api`
4. **Frontend:** Build UI components, integrate with API client
5. **Integration Test:** Test full flow locally before deployment

---

## 10. Future Phase: Subscription Implementation

> **Note:** This phase will be implemented AFTER testing is complete and teacher feedback has been incorporated. The architecture is designed to support subscriptions when ready.

### 10.1 When to Implement Subscriptions

Implement subscriptions when ALL of the following are true:

- [ ] All critical bugs from testing are resolved
- [ ] Teacher feedback has been addressed
- [ ] User testing shows positive learning outcomes
- [ ] You have stable user base (even if small)
- [ ] You have time to dedicate to payment system maintenance

### 10.2 Feature Tier Definition (Future)

| Feature | Free Tier | Premium Tier |
|---------|-----------|--------------|
| Phonics (Phases 1-3) | Full access | Full access |
| Phonics (Phases 4-6) | Limited (2 letters/day) | Full access |
| Sight Words | Pre-primer only | All levels |
| Fluency Tracking | Basic WPM | Detailed analytics |
| Comprehension | 5 stories/month | Unlimited |
| Teacher Dashboard | Basic roster | Full analytics + reports |
| Parent Dashboard | View progress | Detailed reports |

### 10.3 Architecture Preparation

The current architecture already supports subscriptions:

1. **User documents** have `role` field that can include subscription status
2. **Cloud Functions** can check subscription status before processing
3. **Firestore rules** can gate access based on subscription

### 10.4 Minimal Implementation (When Ready)

```typescript
// Add to user document
interface User {
  // ... existing fields
  subscription?: {
    status: 'active' | 'inactive';
    planId?: string;
    expiresAt?: Date;
  };
}

// Add subscription check to Cloud Functions
export const checkPremiumAccess = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user.subscription?.status === 'active';
};
```

### 10.5 Stripe Integration (Future Reference)

When ready to monetize:

1. Create Stripe account
2. Define products and prices in Stripe dashboard
3. Implement `createCheckoutSession` Cloud Function
4. Implement Stripe webhook handler
5. Add subscription status checks throughout app
6. Build subscription management UI

---

## 11. Appendix: Code Examples

### 11.1 Complete Cloud Function Example

```typescript
// functions/src/activities/processPhonicsAnswer.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { validateAuth, validateInput } from '../utils/validation';
import { calculateMasteryDelta } from '../mastery/calculateMastery';
import { verifyPhaseAccess } from '../mastery/checkPhaseUnlock';
import { checkAndAwardAchievements } from '../achievements/processAchievements';

admin.initializeApp();

interface PhonicsAnswerInput {
  letter: string;
  selectedSound: string;
  phaseId: number;
}

interface PhonicsAnswerResult {
  isCorrect: boolean;
  masteryLevel: number;
  newStatus: 'new' | 'learning' | 'mastered';
  achievements: string[];
  phaseUnlocked?: number;
}

export const processPhonicsAnswer = functions.https.onCall(
  async (data: unknown, context): Promise<PhonicsAnswerResult> => {
    // 1. Authentication
    const uid = validateAuth(context);
    
    // 2. Input validation
    const { letter, selectedSound, phaseId } = validateInput<PhonicsAnswerInput>(
      data,
      {
        letter: 'string',
        selectedSound: 'string',
        phaseId: 'number'
      }
    );
    
    // 3. Phase access check
    const accessResult = await verifyPhaseAccess(uid, phaseId);
    if (!accessResult.canAccess) {
      throw new functions.https.HttpsError(
        'permission-denied',
        accessResult.reason || 'Phase not unlocked'
      );
    }
    
    // 4. Get correct answer from content database
    const letterDoc = await admin.firestore()
      .collection('content')
      .doc('phonics')
      .collection('letters')
      .doc(letter)
      .get();
    
    const correctSound = letterDoc.data()?.primarySound;
    const isCorrect = selectedSound === correctSound;
    
    // 5. Get current mastery state
    const masteryDoc = await admin.firestore()
      .collection('users')
      .doc(uid)
      .collection('progress')
      .doc('phonics')
      .get();
    
    const currentMastery = masteryDoc.exists
      ? masteryDoc.data()?.letters?.[letter] || { consecutiveCorrect: 0, status: 'new' }
      : { consecutiveCorrect: 0, status: 'new' };
    
    // 6. Calculate mastery delta
    const masteryResult = calculateMasteryDelta(
      letter,
      isCorrect,
      currentMastery,
      phaseId
    );
    
    // 7. Update Firestore (transactional)
    await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore()
        .collection('users')
        .doc(uid)
        .collection('progress')
        .doc('phonics');
      
      transaction.update(userRef, {
        [`letters.${letter}`]: {
          letter,
          phase: phaseId,
          status: masteryResult.newStatus,
          consecutiveCorrect: isCorrect 
            ? currentMastery.consecutiveCorrect + 1 
            : 0,
          lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
          ...(masteryResult.newStatus === 'mastered' && {
            masteredAt: admin.firestore.FieldValue.serverTimestamp()
          })
        },
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    // 8. Check for achievements
    const achievements = await checkAndAwardAchievements(uid, {
      activityType: 'phonics',
      isCorrect,
      letter,
      newStatus: masteryResult.newStatus
    });
    
    return {
      isCorrect,
      masteryLevel: masteryResult.newStatus === 'mastered' ? 5 : 
                    masteryResult.newStatus === 'learning' ? 3 : 1,
      newStatus: masteryResult.newStatus,
      achievements
    };
  }
);
```

### 11.2 Frontend Hook Example

```typescript
// lib/hooks/useActivitySubmit.ts
import { useMutation } from '@tanstack/react-query';
import { submitPhonicsAnswer } from '../api/activities';
import { useActivityStore } from '../stores/activityStore';
import { useMasteryStore } from '../stores/masteryStore';

export function useActivitySubmit(activityType: 'phonics' | 'sight_words') {
  const { recordAnswer, currentQuestion } = useActivityStore();
  const { updateMastery } = useMasteryStore();
  
  const mutation = useMutation({
    mutationFn: async (data: { letter: string; selectedSound: string; phaseId: number }) => {
      if (activityType === 'phonics') {
        return submitPhonicsAnswer(data);
      }
      // ... other activity types
    },
    
    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['mastery']);
      const previousMastery = useMasteryStore.getState();
      
      recordAnswer({
        questionIndex: currentQuestion,
        answer: variables.selectedSound,
        timestamp: Date.now()
      });
      
      return { previousMastery };
    },
    
    onSuccess: (data) => {
      updateMastery(data.masteryLevel, data.newStatus);
      if (data.achievements.length > 0) {
        data.achievements.forEach(showAchievementToast);
      }
    },
    
    onError: (err, variables, context) => {
      if (context?.previousMastery) {
        useMasteryStore.setState(context.previousMastery);
      }
      showErrorToast('Failed to save progress. Please try again.');
    }
  });
  
  return {
    submitAnswer: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error
  };
}
```

### 11.3 Emulator Setup for Local Development

```javascript
// firebase.json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

```bash
# Start emulators
firebase emulators:start

# Run functions shell for testing
firebase functions:shell
```

---

## Quick Reference Checklist

### Before Starting Migration

- [ ] Set up Firebase project and enable Cloud Functions
- [ ] Install Firebase CLI and log in
- [ ] Set up local emulator suite
- [ ] Create backup of existing Firestore data
- [ ] Set up feature flags for gradual rollout

### For Each Activity Migration

- [ ] Create Cloud Function with full validation
- [ ] Write unit tests for function
- [ ] Test locally with emulators
- [ ] Create API client function
- [ ] Update frontend to use new API
- [ ] Test integration locally
- [ ] Deploy behind feature flag
- [ ] Monitor for errors
- [ ] Remove old code path

### For Mastery System

- [ ] Define mastery thresholds per phase
- [ ] Implement calculation logic
- [ ] Add Firestore security rules
- [ ] Create frontend lock UI
- [ ] Test bypass prevention
- [ ] Document teacher override process

### For Testing Phase

- [ ] Complete internal testing
- [ ] Recruit teacher beta testers
- [ ] Collect and prioritize feedback
- [ ] Expand to student beta
- [ ] Load test concurrent users
- [ ] Document all resolved issues

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Foundation | Weeks 1-2 | Project structure, types, utilities |
| Mastery System | Weeks 3-4 | Mastery engine, phase gates |
| Activity Migration | Weeks 5-8 | All activities on Cloud Functions |
| Achievement System | Weeks 9-10 | Skill-based milestones |
| Teacher Tools & Feedback | Weeks 11-12 | Analytics, feedback system |
| **Testing & Validation** | Weeks 13-16 | User testing, bug fixes |
| **Subscription** | *Future* | Post-testing monetization |

**Total time to production-ready: ~16 weeks**  
**Subscription implementation: Post-testing phase**

---

*This guide is designed to be updated as the project evolves. Keep it in version control and update as decisions are made and lessons are learned.*
