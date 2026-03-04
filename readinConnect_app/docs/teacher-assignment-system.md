# Teacher Assignment & Session Planning System
## Technical Specification Document

---

## 🎯 Overview

Enable teachers to scope game availability and create sequenced learning sessions for students, providing structured, differentiated instruction aligned with classroom curriculum.

---

## 📊 Core User Stories

### Teacher Stories
1. **As a teacher, I want to select specific games** so students focus on targeted skills
2. **As a teacher, I want to sequence game order** so students follow a learning progression
3. **As a teacher, I want to assign to individuals or groups** for differentiation
4. **As a teacher, I want to set due dates** to manage pacing
5. **As a teacher, I want to see completion status** to monitor progress

### Student Stories
1. **As a student, I want to see my assigned games** so I know what to work on
2. **As a student, I want to unlock games sequentially** for sense of progression
3. **As a student, I want to see due dates** to manage my time
4. **As a student, I want to see my progress** to feel accomplished

---

## 🏗️ Data Models

### Assignment (Teacher-Created)
```typescript
interface Assignment {
  id: string;
  teacherId: string;
  title: string;                    // "Week 3: Short Vowels"
  description?: string;
  
  // Target Students
  targetType: 'individual' | 'group' | 'class';
  targetStudentIds?: string[];      // For individual assignments
  targetGroupId?: string;           // For group assignments
  
  // Game Configuration
  games: AssignedGame[];
  
  // Scheduling
  startDate: Timestamp;
  dueDate?: Timestamp;
  timeLimitMinutes?: number;        // Per session
  
  // Settings
  settings: {
    sequentialUnlock: boolean;      // true = must complete in order
    allowReplay: boolean;           // Can replay completed games
    showTimer: boolean;             // Display countdown
    minimumScore?: number;          // Required to advance (if sequential)
  };
  
  // Status
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AssignedGame {
  gameId: string;                   // "word-builder", "sound-detective", etc.
  order: number;                    // 1, 2, 3... for sequencing
  
  // Game-Specific Config
  config: {
    // Word Builder
    wordFamilies?: string[];        // ["-at", "-an"]
    difficulty?: 1 | 2 | 3;
    
    // Reading Racetrack
    passageLevel?: 1 | 2 | 3 | 4;
    targetWPM?: number;
    
    // Sight Words
    wordList?: 'preprimer' | 'primer' | 'grade1';
    
    // Story Sequencing
    storyCount?: number;
    
    // General
    questionCount?: number;         // For quiz-type games
    timeLimit?: number;             // Seconds per question
  };
  
  // Completion Requirements
  requirements: {
    minimumScore?: number;          // e.g., 80%
    minimumAccuracy?: number;       // e.g., 70%
    attemptsAllowed?: number;       // null = unlimited
  };
  
  // Optional Instructions
  teacherInstructions?: string;     // "Focus on the 'a' sound"
}
```

### StudentAssignment (Per-Student Instance)
```typescript
interface StudentAssignment {
  id: string;
  studentId: string;
  assignmentId: string;
  teacherId: string;
  
  // Status Tracking
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  progress: {
    totalGames: number;
    completedGames: number;
    currentGameIndex: number;
    percentComplete: number;
  };
  
  // Per-Game Progress
  gameProgress: {
    [gameId: string]: {
      status: 'locked' | 'available' | 'in_progress' | 'completed';
      score: number;
      accuracy: number;
      attempts: number;
      startedAt?: Timestamp;
      completedAt?: Timestamp;
      timeSpentSeconds: number;
    }
  };
  
  // Timestamps
  assignedAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  dueDate?: Timestamp;
}
```

### AssignmentGroup (For Differentiation)
```typescript
interface AssignmentGroup {
  id: string;
  teacherId: string;
  name: string;                     // "Reading Intervention", "Advanced Group"
  description?: string;
  studentIds: string[];
  color: string;                    // UI color coding
  createdAt: Timestamp;
}
```

### SessionLog (For Analytics)
```typescript
interface AssignmentSessionLog {
  id: string;
  studentId: string;
  assignmentId: string;
  gameId: string;
  
  // Session Details
  startedAt: Timestamp;
  endedAt: Timestamp;
  durationSeconds: number;
  
  // Performance
  score: number;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
  
  // Detailed Events
  events: {
    type: 'start' | 'question' | 'hint' | 'complete' | 'abandon';
    timestamp: Timestamp;
    data?: any;
  }[];
}
```

---

## 🎨 Teacher Interface Design

### Page: Assignment Builder (`/teacher/assignments/create`)

#### Step 1: Basic Information
```
┌─────────────────────────────────────────────────────────────┐
│  Create New Assignment                           [Cancel]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Assignment Title *                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Week 3: Mastering Short A Words                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Description (optional)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Focus on -at, -an, and -ap word families.          │   │
│  │ Complete all activities by Friday.                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Continue to Games →]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Step 2: Select & Configure Games
```
┌─────────────────────────────────────────────────────────────┐
│  Select Games                                    [← Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All ▼]  [Search games...]    Selected: 4 games   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📚 PHONEMIC AWARENESS                                 │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │ 🔍          │  │ 🎨          │  │ 🎵          │   │ │
│  │  │ Sound       │  │ Sound       │  │ Rhyme       │   │ │
│  │  │ Detective   │  │ Blender     │  │ Time        │   │ │
│  │  │             │  │             │  │             │   │ │
│  │  │ [✓ Added]   │  │ [+ Add]     │  │ [+ Add]     │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📖 PHONICS                                            │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐                    │ │
│  │  │ 🏗️          │  │ 🚀          │                    │ │
│  │  │ Word        │  │ Blend       │                    │ │
│  │  │ Builder     │  │ Blaster     │                    │ │
│  │  │             │  │             │                    │ │
│  │  │ [✓ Added]   │  │ [✓ Added]   │                    │ │
│  │  └─────────────┘  └─────────────┘                    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Continue to Configuration →]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Step 3: Configure Each Game
```
┌─────────────────────────────────────────────────────────────┐
│  Configure Games                                 [← Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Game Order (drag to reorder):                             │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡ 1. Word Builder 🏗️                                  │ │
│  │    ┌───────────────────────────────────────────────┐  │ │
│  │    │ Difficulty: [Level 1 ▼]                        │  │ │
│  │    │ Word Families: [x] -at  [x] -an  [ ] -ap      │  │ │
│  │    │ Words per round: [10 ▼]                        │  │ │
│  │    │ Minimum score to advance: [80% ▼]              │  │ │
│  │    │ Teacher note: "Listen carefully to each sound" │  │ │
│  │    └───────────────────────────────────────────────┘  │ │
│  │                                        [Remove]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ≡ 2. Sound Detective 🔍                               │ │
│  │    ┌───────────────────────────────────────────────┐  │ │
│  │    │ Focus: [Beginning sounds ▼]                    │  │ │
│  │    │ Phoneme set: [Set 1 (s,a,t,p) ▼]               │  │ │
│  │    │ Questions: [10 ▼]                              │  │ │
│  │    └───────────────────────────────────────────────┘  │ │
│  │                                        [Remove]      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Add Another Game]                                       │
│                                                             │
│  [Continue to Students →]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Step 4: Select Students & Schedule
```
┌─────────────────────────────────────────────────────────────┐
│  Assign to Students                              [← Back]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Assign To:                                                │
│  ○ Individual Students                                    │
│  ● Group                                                  │
│  ○ Entire Class                                           │
│                                                             │
│  Select Group: [Reading Group A ▼]                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 5 students selected:                                │   │
│  │ 👤 Emma L.   👤 Lucas M.   👤 Sophia R.            │   │
│  │ 👤 Jackson T.  👤 Olivia P.                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Schedule:                                                 │
│  Start Date: [Today ▼]    Due Date: [Friday ▼]             │
│                                                             │
│  Settings:                                                 │
│  [x] Students must complete games in order                │
│  [x] Allow students to replay completed games             │
│  [ ] Show countdown timer during games                    │
│                                                             │
│  [Save as Draft]  [Assign Now]                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page: Assignment List (`/teacher/assignments`)
```
┌─────────────────────────────────────────────────────────────┐
│  Assignments                                     [+ Create] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [Active ▼]  [All Groups ▼]                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Week 3: Mastering Short A Words              [⋯]      │ │
│  │ 📚 4 games • 👥 5 students • Due Friday               │ │
│  │                                                       │ │
│  │ Progress: ████████░░ 80% (4/5 completed)              │ │
│  │                                                       │ │
│  │ Emma L.: ✓ Complete    Lucas M.: ✓ Complete          │ │
│  │ Sophia R.: ▶ In Progress  Jackson T.: ⏸ Not Started  │ │
│  │ Olivia P.: ✓ Complete                                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Sight Word Blast - Advanced Readers          [⋯]      │ │
│  │ 📚 3 games • 👥 8 students • Due Tomorrow             │ │
│  │                                                       │ │
│  │ Progress: ██████░░░░ 60% (5/8 completed)              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Page: Assignment Detail (`/teacher/assignments/[id]`)
```
┌─────────────────────────────────────────────────────────────┐
│  Week 3: Mastering Short A Words                 [Edit]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: Active  |  Due: Friday, Jan 24  |  5 students     │
│                                                             │
│  Progress Overview:                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ████████████████████████████████████████████ 80%   │   │
│  │  4 completed  |  1 in progress  |  0 not started    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Student Progress:                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Student        | Status    | Current Game | Score    │ │
│  │ ────────────────────────────────────────────────────│ │
│  │ Emma L.        | ✓ Done    | -           | 95%      │ │
│  │ Lucas M.       | ✓ Done    | -           | 88%      │ │
│  │ Olivia P.      | ✓ Done    | -           | 92%      │ │
│  │ Jackson T.     | ✓ Done    | -           | 85%      │ │
│  │ Sophia R.      | ▶ Active  | Word Builder| 60%      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [View Detailed Report]  [Send Reminder]  [Extend Deadline] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 👦 Student Interface Design

### Student Dashboard - Assignments View
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome back, Emma! 🌟                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Your Assignments                                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Week 3: Mastering Short A Words              Due Fri  │ │
│  │                                                       │ │
│  │ Progress: ████████░░ 80%                              │ │
│  │                                                       │ │
│  │ 1. ✓ Word Builder    Completed! 95%                  │ │
│  │ 2. ✓ Sound Detective Completed! 100%                 │ │
│  │ 3. ▶ Reading Racetrack  ▶ PLAY NOW                   │ │
│  │ 4. 🔒 Story Sequencing  Locked                       │ │
│  │                                                       │ │
│  │                    [Continue Playing ▶]              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  🎮 Free Play Games                                         │
│  (Games your teacher has unlocked for practice)            │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                      │
│  │ 🎈      │ │ 🧩      │ │ 🏎️      │                      │
│  │ Word Pop│ │ Story   │ │ Racetrack│                      │
│  │         │ │ Sequence│ │         │                      │
│  │ [Play]  │ │ [Play]  │ │ [Play]  │                      │
│  └─────────┘ └─────────┘ └─────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Game Launch Screen
```
┌─────────────────────────────────────────────────────────────┐
│  [← Back]                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    🏗️ Word Builder                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  Your Goal: Complete 10 words                     │   │
│  │  Minimum score needed: 80%                        │   │
│  │                                                     │   │
│  │  Focus on these word families:                    │   │
│  │  📝 -at, -an, -ap                                 │   │
│  │                                                     │   │
│  │  Teacher tip: "Listen carefully to each sound!"   │   │
│  │                                                     │   │
│  │              [Start Game ▶]                       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Previous attempts:                                        │
│  Attempt 1: 75% (Retry to unlock next game)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Backend Implementation

### Cloud Functions

```typescript
// Create Assignment
export const createAssignment = functions.https.onCall(
  async (data: CreateAssignmentInput, context) => {
    // Validate teacher
    // Create assignment document
    // Create StudentAssignment for each target student
    // Send notifications (optional)
  }
);

// Update Game Progress
export const updateGameProgress = functions.https.onCall(
  async (data: UpdateProgressInput, context) => {
    // Validate student
    // Update StudentAssignment.gameProgress
    // Check if assignment completed
    // Check if next game should unlock (sequential)
    // Award badges/points
  }
);

// Get Student Assignments
export const getStudentAssignments = functions.https.onCall(
  async (data: { studentId: string }, context) => {
    // Return active assignments for student
    // Include progress, available games, locked games
  }
);

// Get Assignment Details (Teacher View)
export const getAssignmentDetails = functions.https.onCall(
  async (data: { assignmentId: string }, context) => {
    // Return assignment with all student progress
    // Aggregate statistics
  }
);
```

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assignments - Teachers can CRUD their own
    match /assignments/{assignmentId} {
      allow read: if request.auth != null && 
        (resource.data.teacherId == request.auth.uid ||
         request.auth.token.role == 'admin');
      allow write: if request.auth != null && 
        request.auth.token.role == 'teacher';
    }
    
    // StudentAssignments - Students read their own, teachers read their students'
    match /studentAssignments/{docId} {
      allow read: if request.auth != null && 
        (resource.data.studentId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(resource.data.studentId)).data.teacherId == request.auth.uid);
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.studentId;
    }
  }
}
```

---

## 🎮 Game Integration

### Game Component Updates

Each game needs to accept assignment configuration:

```typescript
interface GameProps {
  // Existing props
  
  // Assignment context (optional)
  assignmentId?: string;
  gameConfig?: AssignedGame['config'];
  requirements?: AssignedGame['requirements'];
  
  // Callbacks
  onComplete: (results: GameResults) => void;
  onProgress: (progress: Partial<GameProgress>) => void;
}

// Example: Word Builder with assignment
function WordBuilderGame({ 
  assignmentId, 
  gameConfig,
  requirements,
  onComplete 
}: GameProps) {
  
  // Use assignment config if provided
  const wordFamilies = gameConfig?.wordFamilies || ['-at', '-an'];
  const targetScore = requirements?.minimumScore || 70;
  
  const handleGameComplete = (score: number) => {
    onComplete({
      score,
      accuracy: calculateAccuracy(),
      timeSpent: getTimeSpent(),
      metRequirements: score >= targetScore
    });
  };
  
  // ... rest of game logic
}
```

### Progress Tracking Middleware

```typescript
// Hook for tracking assignment progress
function useAssignmentProgress(assignmentId?: string) {
  const updateProgress = useCallback(async (
    gameId: string, 
    progress: GameProgress
  ) => {
    if (!assignmentId) return;
    
    await updateGameProgress({
      assignmentId,
      gameId,
      progress
    });
    
    // Check if game completed
    if (progress.status === 'completed') {
      // Check if unlock next game
      // Show celebration
      // Check if assignment complete
    }
  }, [assignmentId]);
  
  return { updateProgress };
}
```

---

## 📱 Implementation Roadmap

### Phase 1: Core Assignment System (Week 1)
- [ ] Data models (Assignment, StudentAssignment)
- [ ] Create assignment Cloud Function
- [ ] Basic assignment builder UI (Step 1-2)
- [ ] Assignment list view

### Phase 2: Game Configuration (Week 2)
- [ ] Game configuration panels (Step 3)
- [ ] Game scoping (hide/show games)
- [ ] Student selection (Step 4)
- [ ] Assignment detail view

### Phase 3: Student Experience (Week 3)
- [ ] Student assignments dashboard
- [ ] Progress tracking
- [ ] Sequential unlock logic
- [ ] Game launch with assignment context

### Phase 4: Polish & Analytics (Week 4)
- [ ] Teacher progress reports
- [ ] Notifications (due dates, completions)
- [ ] Bulk operations (edit multiple, extend deadlines)
- [ ] Export progress data

---

## 🎯 Success Metrics

### Teacher Adoption
- % of teachers creating assignments (target: 80%)
- Average assignments per week (target: 3-5)
- % using sequential mode vs free play

### Student Engagement
- Assignment completion rate (target: 85%)
- Average time to complete
- Replay rate for completed games

### Learning Outcomes
- Score improvement from first to last game in sequence
- Correlation between assignment structure and student growth
- Teacher satisfaction with differentiation tools

---

## Next Steps

1. **Approve design** - Any changes needed?
2. **Start Phase 1** - Build core assignment system
3. **Create mock data** - Sample assignments for testing
4. **Design game configuration UIs** - Per-game settings panels
5. **Parallel: Content creation** - Prepare game content libraries

Ready to start building the assignment system?
