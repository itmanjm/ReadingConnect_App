# Product Requirements Document (PRD)
# CVC Feature + Reading Levels + Progress Dashboard

**Project:** ReadinConnect  
**Version:** 1.0  
**Status:** Requirements Document  
**Date:** February 10, 2026  
**Architecture:** Firebase (Firestore + Authentication + Storage)

---

## Executive Summary

ReadinConnect requires structured reading levels, CVC word practice, and comprehensive progress tracking to serve students in Kindergarten through Grade 2. This PRD outlines the implementation using **Firebase** as the sole backend infrastructure.

**Key Deliverables:**
- ✅ Firebase Firestore database with hierarchical reading levels
- ✅ CVC word practice with phonetic audio feedback
- ✅ Sight word mastery tracking
- ✅ Reading level progression system
- ✅ Teacher & parent progress dashboards
- ✅ Offline support via IndexedDB + Firebase SDK
- ✅ PDF worksheet generation

---

## 1. Problem Statement

ReadinConnect currently lacks:
1. Structured reading levels aligned with educational standards (CCSS.ELA-LITERACY.RF)
2. Foundational CVC (Consonant-Vowel-Consonant) word practice
3. Lexile/Fry readability alignment
4. Comprehensive progress tracking for students, teachers, and parents
5. Reading gamification with badges and streaks

**Impact:**
- ❌ Students cannot progress through grade-level reading milestones
- ❌ Teachers cannot align content with curriculum standards
- ❌ Parents lack visibility into reading development
- ❌ School adoption blocked (requires leveled content & reporting)
- ❌ Competitive disadvantage (all literacy apps have reading levels)

---

## 2. User Personas

### 2.1 Students (Ages 4-8)

| Grade | Age | Reading Level | Key Needs |
|-------|-----|---------------|-----------|
| **Kindergarten** | 4-5 | Pre-reader | Letter sounds, basic CVC words (cat, dog, sun) |
| **Grade 1** | 6-7 | Early reader | Simple sentences, sight words (the, and, is) |
| **Grade 2** | 8 | Developing reader | Multi-syllable words, comprehension |

### 2.2 Teachers
- Assign appropriate reading levels to students
- Track class progress across all levels
- Monitor mastery of specific skills (CVC words, sight words)
- Generate progress reports for parents

### 2.3 Parents
- View child's reading level and progress
- Understand which words/skills to practice
- Track achievement milestones (badges, streaks)
- Access printable materials for offline practice

---

## 3. Success Metrics

### 3.1 Student Engagement
- **CVC Word Mastery:** 80% accuracy on 20-50 words per level
- **Reading Level Progression:** Complete 3 levels (K → 1 → 2) in 24 weeks
- **Sight Word Fluency:** Read 20-50 sight words within 4-6 weeks
- **Activity Completion:** 10-15 activities per week

### 3.2 Teacher Effectiveness
- **Level Assignment:** 100% successful assignment rate
- **Report Generation:** Progress reports generated in < 5 minutes
- **Class Visibility:** Real-time progress for all students

### 3.3 Parent Engagement
- **Progress Clarity:** 90% understand child's reading level
- **Adoption Rate:** 60% access printable materials
- **Session Frequency:** 3+ sessions per week per child

### 3.4 Technical Performance
- **Reading Level Assignment:** < 500ms latency
- **Dashboard Updates:** Real-time (< 2s)
- **PDF Generation:** < 30s per worksheet
- **Offline Mode:** Full functionality without internet
- **Concurrent Users:** 1,000 users with < 5s response time

---

## 4. Firebase Architecture

### 4.1 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | Firebase Firestore | NoSQL document database, real-time sync |
| **Authentication** | Firebase Auth | Email/password, Google OAuth |
| **Storage** | Firebase Storage | Audio files, PDFs, badges |
| **Hosting** | Firebase Hosting | Next.js frontend deployment |
| **Frontend** | Next.js 14 (App Router) | React framework with SSR |
| **State Management** | Zustand + React Query | Local state + server caching |
| **Audio** | Jolly Phonics files | Letter sound pronunciations |
| **Charts** | Recharts | Progress visualization |
| **PDF** | react-pdf @react-pdf/renderer | Printable worksheets |
| **Offline Support** | IndexedDB + Firebase SDK | Browser-native caching |
| **Styling** | Tailwind CSS | Responsive design |

### 4.2 Firebase Project Structure

```
readinconnect-firebase/
├── firestore/
│   ├── indexes/
│   │   └── indexes.json          # Firestore composite indexes
│   ├── collections/
│   │   ├── reading_levels        # Top-level collection
│   │   ├── students              # Top-level collection
│   │   ├── activities            # Top-level collection
│   │   ├── badges                # Top-level collection
│   │   └── skill_progress        # Top-level collection
│   └── security.rules            # Firestore security rules
├── storage/
│   ├── audio/                    # Jolly Phonics audio files
│   ├── badges/                   # Badge icons
│   └── worksheets/               # Generated PDFs
└── auth/
    └── providers/                # Auth configuration
```

---

## 5. Firestore Data Schema

### 5.1 Collection Structure

```javascript
// ===== TOP-LEVEL COLLECTIONS =====

// 1. READING LEVELS
// Path: reading_levels/{level_id}
reading_levels {
  level_id: string              // "kindergarten", "grade1", "grade2"
  level_name: string            // "Kindergarten"
  age_range: string             // "4-5"
  lexile_min: number            // 0
  lexile_max: number            // 200
  fry_readability_range: string // "0-2"
  description: string           // "Beginner CVC words..."
  estimated_duration_weeks: number // 8
  min_cvc_words: number         // 20
  created_at: timestamp
}

// Subcollection: CVC Words
// Path: reading_levels/{level_id}/cvc_words/{word_id}
cvc_words {
  word_id: string               // Unique identifier
  word: string                  // "cat"
  letter1: string               // "c"
  letter2: string               // "a"
  letter3: string               // "t"
  phonetic_sound: string        // "/k/-/æ/-/t/"
  frequency: number             // 5 (commonness)
  difficulty_level: string      // "easy", "medium", "hard"
  audio_file_path: string       // "/audio/cvc/cat.mp3"
  created_at: timestamp
}

// Subcollection: Sight Words
// Path: reading_levels/{level_id}/sight_words/{word_id}
sight_words {
  word_id: string               // Unique identifier
  word: string                  // "the"
  grade_level: string           // "kindergarten"
  difficulty_level: string      // "easy", "medium", "hard"
  frequency: number             // 100 (commonness)
  audio_file_path: string       // "/audio/sight/the.mp3"
  created_at: timestamp
}

// 2. STUDENTS
// Path: students/{student_id}
students {
  student_id: string            // Auto-generated by Firebase Auth
  name: string                  // "Kal-El"
  email: string                 // Parent email
  grade_level: string           // "kindergarten"
  current_reading_level: string // "kindergarten"
  total_badges_earned: number   // 5
  created_at: timestamp
  updated_at: timestamp
}

// Subcollection: CVC Word Progress
// Path: students/{student_id}/cvc_word_progress/{word_id}
cvc_word_progress {
  word_id: string               // References cvc_words.word_id
  attempts: number              // 15
  correct_attempts: number      // 12
  last_attempt: timestamp
  current_mastery: number       // 80 (percentage)
  created_at: timestamp
  updated_at: timestamp
}

// Subcollection: Sight Word Progress
// Path: students/{student_id}/sight_word_progress/{word_id}
sight_word_progress {
  word_id: string               // References sight_words.word_id
  attempts: number              // 8
  correct_attempts: number      // 7
  last_attempt: timestamp
  current_mastery: number       // 87 (percentage)
  created_at: timestamp
  updated_at: timestamp
}

// Subcollection: Level Progress
// Path: students/{student_id}/level_progress/{level_id}
level_progress {
  level_id: string              // "kindergarten"
  words_learned: number         // 45
  words_mastered: number        // 30
  activities_completed: number  // 15
  quizzes_passed: number        // 8
  current_streak: number        // 12 (days)
  best_streak: number           // 20
  total_minutes_spent: number   // 180
  last_activity_date: timestamp
  level_completed: boolean      // false
  completion_date: timestamp    // null
  updated_at: timestamp
}

// Subcollection: Badges Earned
// Path: students/{student_id}/badges/{badge_id}
badges {
  badge_id: string              // References badges.badge_id
  earned_at: timestamp
}

// 3. ACTIVITIES
// Path: activities/{activity_id}
activities {
  activity_id: string           // "cvc-001"
  type: string                  // "cvc_practice", "sight_words", "fluency", "comprehension"
  reading_level: string         // "kindergarten"
  cvc_word_ids: array           // ["abc", "def", "ghi"]
  sight_word_ids: array         // ["jkl", "mno"]
  difficulty_level: string      // "easy", "medium", "hard"
  created_at: timestamp
}

// 4. BADGES
// Path: badges/{badge_id}
badges {
  badge_id: string              // "level1_complete"
  badge_name: string            // "Kindergarten Master"
  description: string           // "Complete all Kindergarten CVC words"
  badge_type: string            // "reading_level", "word_mastery", "streak"
  icon_url: string              // "/badges/kindergarten.png"
  requirements: object {
    level_id: string            // "kindergarten"
    min_mastery: number         // 80
    min_words: number           // 20
  }
  created_at: timestamp
}

// 5. SKILL PROGRESS
// Path: skill_progress/{document_id}
// Document ID is composite: {student_id}_{activity_id}
skill_progress {
  student_id: string            // "123"
  activity_id: string           // "cvc-001"
  reading_level: string         // "kindergarten"
  streak_count: number          // 5
  words_learned_count: number   // 12
  words_mastered_count: number  // 8
  updated_at: timestamp
}
```

### 5.2 Firestore Indexes

```json
// indexes.json
{
  "indexes": [
    {
      "collectionGroup": "cvc_word_progress",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "student_id", "order": "ASCENDING"},
        {"fieldPath": "current_mastery", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "sight_word_progress",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "student_id", "order": "ASCENDING"},
        {"fieldPath": "current_mastery", "order": "DESCENDING"}
      ]
    },
    {
      "collectionGroup": "level_progress",
      "queryScope": "COLLECTION",
      "fields": [
        {"fieldPath": "level_id", "order": "ASCENDING"},
        {"fieldPath": "words_mastered", "order": "DESCENDING"}
      ]
    }
  ]
}
```

---

## 6. Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isTeacher() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    function isParent(userId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
    
    function isStudentOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // READING LEVELS - Public read, teacher write
    match /reading_levels/{levelId} {
      allow read: if true;
      allow write: if isTeacher();
      
      // CVC words subcollection
      match /cvc_words/{wordId} {
        allow read: if true;
        allow write: if isTeacher();
      }
      
      // Sight words subcollection
      match /sight_words/{wordId} {
        allow read: if true;
        allow write: if isTeacher();
      }
    }

    // STUDENTS - Teacher read/write, parent read own children
    match /students/{studentId} {
      allow read: if isTeacher() || isParent(studentId);
      allow create: if isTeacher();
      allow update: if isTeacher() || isStudentOwner(studentId);
      allow delete: if isTeacher();
      
      // Student progress subcollections
      match /cvc_word_progress/{wordId} {
        allow read, write: if isTeacher() || isStudentOwner(studentId);
      }
      
      match /sight_word_progress/{wordId} {
        allow read, write: if isTeacher() || isStudentOwner(studentId);
      }
      
      match /level_progress/{levelId} {
        allow read, write: if isTeacher() || isStudentOwner(studentId);
      }
      
      match /badges/{badgeId} {
        allow read: if true;
        allow create: if isTeacher() || isStudentOwner(studentId);
      }
    }

    // ACTIVITIES - Public read, teacher write
    match /activities/{activityId} {
      allow read: if true;
      allow write: if isTeacher();
    }

    // BADGES - Public read, teacher write
    match /badges/{badgeId} {
      allow read: if true;
      allow write: if isTeacher();
    }

    // SKILL PROGRESS - Teacher and student owner
    match /skill_progress/{docId} {
      allow read, write: if isTeacher();
    }
  }
}
```

---

## 7. Environment Variables

```env
# ===== FIREBASE CONFIGURATION =====
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=readinconnect.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=readinconnect
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=readinconnect.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# ===== FIREBASE ADMIN SDK (Server-side) =====
FIREBASE_ADMIN_PROJECT_ID=readinconnect
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@readinconnect.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ===== AUDIO CONFIGURATION =====
NEXT_PUBLIC_AUDIO_BASE_URL=https://storage.googleapis.com/readinconnect.appspot.com/audio
NEXT_PUBLIC_JOLLY_PHONICS_AUDIO_PATH=/audio/jolly-phonics

# ===== PDF GENERATION =====
NEXT_PUBLIC_PDF_API_URL=https://api.readinconnect.com/pdf
PDF_MAX_FILE_SIZE=10485760  # 10MB

# ===== OFFLINE SUPPORT =====
NEXT_PUBLIC_INDEXEDDB_CACHE_SIZE=104857600  # 100MB
NEXT_PUBLIC_OFFLINE_MODE_ENABLED=true

# ===== APPLICATION SETTINGS =====
NEXT_PUBLIC_MAX_UPLOAD_SIZE=52428800  # 50MB
NEXT_PUBLIC_API_TIMEOUT=30000  # 30 seconds
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# ===== NODE ENVIRONMENT =====
NODE_ENV=production
```

---

## 8. Feature Specifications

### 8.1 Reading Level Management

**User Flow:**
1. Teacher logs in via Firebase Auth (Email/Password or Google OAuth)
2. Teacher navigates to "Class Management" dashboard
3. Teacher selects student and assigns reading level (Kindergarten/Grade1/Grade2)
4. Firestore writes `current_reading_level` to student document
5. Student sees new level on next login (real-time sync)

**API Endpoints (Firebase SDK):**
```typescript
// Assign reading level
const assignReadingLevel = async (studentId: string, levelId: string) => {
  await updateDoc(doc(db, "students", studentId), {
    current_reading_level: levelId,
    updated_at: serverTimestamp()
  });
  
  // Initialize level progress document
  await setDoc(
    doc(db, "students", studentId, "level_progress", levelId),
    {
      level_id: levelId,
      words_learned: 0,
      words_mastered: 0,
      activities_completed: 0,
      quizzes_passed: 0,
      current_streak: 0,
      best_streak: 0,
      total_minutes_spent: 0,
      last_activity_date: serverTimestamp(),
      level_completed: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }
  );
};
```

### 8.2 CVC Word Practice

**User Flow:**
1. Student logs in
2. Dashboard shows assigned reading level (e.g., "Kindergarten")
3. Student taps "CVC Practice" activity
4. Firebase queries `reading_levels/{levelId}/cvc_words`
5. Activity displays word (e.g., "cat") with letter buttons
6. Student taps letter → plays Jolly Phonics audio
7. Student builds word → receives immediate feedback
8. Progress updates to `students/{studentId}/cvc_word_progress/{wordId}`
9. Real-time listeners update dashboard

**Data Flow:**
```typescript
// Fetch CVC words for level
const fetchCVCWords = async (levelId: string) => {
  const q = query(
    collection(db, `reading_levels/${levelId}/cvc_words`),
    orderBy("difficulty_level", "asc"),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update word mastery
const updateWordMastery = async (
  studentId: string, 
  wordId: string, 
  isCorrect: boolean
) => {
  const progressRef = doc(db, "students", studentId, "cvc_word_progress", wordId);
  const progressSnap = await getDoc(progressRef);
  
  if (progressSnap.exists()) {
    const data = progressSnap.data();
    await updateDoc(progressRef, {
      attempts: increment(1),
      correct_attempts: isCorrect ? increment(1) : increment(0),
      current_mastery: isCorrect ? data.current_mastery + 5 : data.current_mastery - 2,
      last_attempt: serverTimestamp(),
      updated_at: serverTimestamp()
    });
  } else {
    await setDoc(progressRef, {
      word_id: wordId,
      attempts: 1,
      correct_attempts: isCorrect ? 1 : 0,
      current_mastery: isCorrect ? 5 : 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
  }
};
```

### 8.3 Sight Word Practice

**User Flow:**
1. Student selects "Sight Words" from dashboard
2. Firebase queries `reading_levels/{levelId}/sight_words`
3. Activity shows flashcards with audio
4. Student taps "I know this" or "Practice again"
5. Progress updates to `students/{studentId}/sight_word_progress/{wordId}`
6. Mastery threshold: 80% = word "mastered"

### 8.4 Progress Dashboard

**User Flow:**
1. Student/Teacher logs in
2. Dashboard loads via Firebase real-time listeners (`onSnapshot`)
3. Displays:
   - Current reading level
   - Words learned/mastered (with progress bars)
   - Current streak (days)
   - Best streak
   - Badges earned
   - Time spent (minutes)
4. Real-time updates when activities completed

**Dashboard Query:**
```typescript
// Listen to level progress
const unsubscribe = onSnapshot(
  doc(db, "students", studentId, "level_progress", levelId),
  (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      // Update UI with real-time data
      setWordsLearned(data.words_learned);
      setWordsMastered(data.words_mastered);
      setCurrentStreak(data.current_streak);
      setBestStreak(data.best_streak);
      setTotalMinutes(data.total_minutes_spent);
    }
  }
);
```

### 8.5 Gamification

**Badge System:**
- **Level Completion Badge:** Awarded when reading level completed (80% mastery)
- **Word Master Badge:** Awarded for 100 words mastered
- **Streak Badge:** Awarded for 7-day, 30-day, 100-day streaks
- **Speed Badge:** Awarded for completing 10 activities in 1 day

**Badge Awarding Logic:**
```typescript
const checkBadgeEligibility = async (studentId: string) => {
  // Check level completion
  const levelProgress = await getDoc(
    doc(db, "students", studentId, "level_progress", levelId)
  );
  
  if (levelProgress.data()?.words_mastered >= 20) {
    // Award badge
    await setDoc(
      doc(db, "students", studentId, "badges", "level1_complete"),
      { badge_id: "level1_complete", earned_at: serverTimestamp() },
      { merge: true }
    );
  }
};
```

### 8.6 PDF Worksheet Generation

**User Flow:**
1. Teacher selects "Generate Worksheets"
2. Chooses reading level and content type (CVC words, sight words)
3. Frontend sends request to PDF generation service
4. PDF generated using `@react-pdf/renderer`
5. PDF uploaded to Firebase Storage
6. Download URL returned to teacher
7. Teacher prints or shares PDF

**PDF Generation:**
```typescript
const generateWorksheet = async (levelId: string, type: string) => {
  // 1. Fetch data from Firestore
  const cvcWords = await fetchCVCWords(levelId);
  
  // 2. Generate PDF
  const pdfBuffer = await generatePDF(cvcWords);
  
  // 3. Upload to Firebase Storage
  const storageRef = ref(
    storage, 
    `worksheets/${levelId}/${type}_${Date.now()}.pdf`
  );
  await uploadBytes(storageRef, pdfBuffer);
  
  // 4. Get download URL
  const url = await getDownloadURL(storageRef);
  return url;
};
```

---

## 9. Offline Support

### 9.1 Firebase SDK Offline Configuration

```typescript
// firebase.ts
import { enableIndexedDbPersistence } from "firebase/firestore";

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log("Multiple tabs open, persistence can only be enabled in one tab");
  } else if (err.code == 'unimplemented') {
    console.log("Browser doesn't support persistence");
  }
});
```

### 9.2 IndexedDB Fallback

```typescript
// offlineCache.ts
import { openDB } from 'idb';

const CACHE_NAME = 'readinconnect-offline';
const CACHE_VERSION = 1;

export const offlineCache = await openDB(CACHE_NAME, CACHE_VERSION, {
  upgrade(db) {
    // Store CVC words
    db.createObjectStore('cvc_words', { keyPath: 'word_id' });
    
    // Store sight words
    db.createObjectStore('sight_words', { keyPath: 'word_id' });
    
    // Store progress (for syncing later)
    db.createObjectStore('pending_updates', { autoIncrement: true });
  }
});

// Cache CVC words for offline use
export const cacheCVCWords = async (words: any[]) => {
  const tx = offlineCache.transaction('cvc_words', 'readwrite');
  await Promise.all(words.map(word => tx.store.put(word)));
  await tx.done;
};

// Sync pending updates when online
export const syncPendingUpdates = async (studentId: string) => {
  const tx = offlineCache.transaction('pending_updates', 'readwrite');
  const pending = await tx.store.getAll();
  
  for (const update of pending) {
    // Write to Firestore
    await updateDoc(doc(db, "students", studentId, "cvc_word_progress", update.wordId), update.data);
  }
  
  // Clear pending updates
  await tx.store.clear();
};
```

---

## 10. Implementation Phases

### Phase 1: Firebase Setup (Days 1-2)
- [ ] Create Firebase project in Firebase Console
- [ ] Enable Firestore database (Start in production mode)
- [ ] Enable Firebase Authentication (Email/Password + Google)
- [ ] Enable Firebase Storage
- [ ] Configure Firebase Security Rules
- [ ] Create Firestore indexes (via Firebase CLI)
- [ ] Set up Firebase Hosting for Next.js deployment
- [ ] Generate Firebase config credentials

### Phase 2: Data Seeding (Days 3-4)
- [ ] Create seed script for reading levels
- [ ] Create seed script for CVC words (50+ per level)
- [ ] Create seed script for sight words (100+ per level)
- [ ] Create seed script for badges
- [ ] Create seed script for activities
- [ ] Run all seed scripts (Firebase Admin SDK)
- [ ] Verify data in Firestore Console

### Phase 3: Authentication (Days 5-6)
- [ ] Implement Firebase Auth in Next.js
- [ ] Create login/signup pages
- [ ] Implement role-based access (Teacher, Parent, Student)
- [ ] Add password reset functionality
- [ ] Test authentication flows

### Phase 4: Core Features (Days 7-12)
- [ ] Build reading level assignment (Teacher view)
- [ ] Build CVC word practice activity
- [ ] Build sight word practice activity
- [ ] Implement progress tracking (real-time listeners)
- [ ] Build student dashboard
- [ ] Build teacher dashboard
- [ ] Implement offline support (IndexedDB)

### Phase 5: Gamification (Days 13-14)
- [ ] Implement badge system
- [ ] Add streak counter
- [ ] Create rewards store
- [ ] Test gamification flows

### Phase 6: PDF Generation (Days 15-16)
- [ ] Set up PDF generation service
- [ ] Create worksheet templates
- [ ] Implement PDF upload to Firebase Storage
- [ ] Add download functionality
- [ ] Test PDF generation performance

### Phase 7: Testing (Days 17-18)
- [ ] Functional testing (all features)
- [ ] Integration testing (Firebase SDK)
- [ ] Offline mode testing
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Performance testing (load testing)
- [ ] Security testing (Firestore rules)

### Phase 8: Deployment (Day 19-20)
- [ ] Deploy to Firebase Hosting
- [ ] Configure custom domain
- [ ] Set up monitoring (Firebase Crashlytics)
- [ ] Create user documentation
- [ ] Train teachers/parents

---

## 11. Testing Strategy

### 11.1 Functional Testing Checklist

**Reading Level Assignment:**
- [ ] Teacher can assign Kindergarten level
- [ ] Teacher can assign Grade 1 level
- [ ] Teacher can assign Grade 2 level
- [ ] Student sees assigned level on dashboard
- [ ] Level persists across sessions
- [ ] Level assignment can be changed

**CVC Word Practice:**
- [ ] Audio plays for each letter
- [ ] Student can build words correctly
- [ ] Visual feedback shows correct/incorrect
- [ ] Mastery updates in real-time
- [ ] Progress saves to Firestore
- [ ] Offline mode works

**Progress Dashboard:**
- [ ] Shows current reading level
- [ ] Shows words learned/mastered
- [ ] Shows streak counter
- [ ] Shows badges earned
- [ ] Real-time updates work

**PDF Generation:**
- [ ] PDF generates in < 30s
- [ ] PDF includes level-specific content
- [ ] PDF downloads correctly
- [ ] PDF uploads to Firebase Storage

### 11.2 Integration Testing

**Firestore Integration:**
- [ ] Reading levels load correctly
- [ ] CVC words load from subcollections
- [ ] Sight words load from subcollections
- [ ] Progress updates write to Firestore
- [ ] Real-time listeners work
- [ ] Security rules enforce permissions

**Firebase Auth Integration:**
- [ ] Email/password authentication works
- [ ] Google OAuth works
- [ ] Session persistence works
- [ ] Role-based access works

**Firebase Storage Integration:**
- [ ] Audio files load correctly
- [ ] PDF uploads succeed
- [ ] Download URLs work

### 11.3 Performance Testing

**Load Testing:**
- [ ] 100 concurrent users: < 2s response
- [ ] 1,000 concurrent users: < 5s response
- [ ] Firestore queries: < 500ms
- [ ] PDF generation: < 30s

**Bundle Size:**
- [ ] Initial bundle: < 200 KB (gzipped)
- [ ] Activity bundle: < 150 KB (gzipped)
- [ ] Firebase SDK: < 100 KB (gzipped)

### 11.4 Edge Case Testing

**Offline Mode:**
- [ ] CVC practice works offline
- [ ] Progress caches locally
- [ ] Sync happens when online
- [ ] Offline indicator shows

**Large Database:**
- [ ] 500 CVC words load without lag
- [ ] Dashboard loads < 2s
- [ ] Pagination works

**Multi-Device Sync:**
- [ ] Progress syncs across devices
- [ ] Real-time updates work
- [ ] Offline writes sync correctly

---

## 12. Success Criteria

### 12.1 Must-Have (MVP)
- ✅ Firebase Firestore database with all collections
- ✅ CVC word practice with audio feedback
- ✅ Sight word practice
- ✅ Reading level assignment
- ✅ Progress dashboard (students & teachers)
- ✅ Real-time progress updates
- ✅ Offline support
- ✅ Authentication (Firebase Auth)

### 12.2 Should-Have (Post-MVP)
- ⏳ PDF worksheet generation
- ⏳ Badge system
- ⏳ Streak counter
- ⏳ Parent portal
- ⏳ Analytics dashboard

### 12.3 Nice-to-Have (Future)
- 📅 Reading comprehension quizzes
- 📅 Fluency passages
- 📅 Advanced analytics
- 📅 AI-powered recommendations
- 📅 Multi-language support

---

## 13. Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Firestore costs exceed budget** | Medium | High | Implement caching, limit queries, monitor usage |
| **Offline sync fails** | Low | High | Test extensively, use IndexedDB fallback |
| **Firebase Security Rules leak data** | Low | Critical | Security audit, automated testing |
| **PDF generation timeout** | Medium | Medium | Use background jobs, queue system |
| **Audio files don't load** | Low | Medium | Use CDN, fallback to TTS |
| **Teachers find UI confusing** | Medium | Medium | User testing, iterative design |

---

## 14. Post-Launch

### 14.1 Monitoring
- Firebase Crashlytics (error tracking)
- Firebase Analytics (user behavior)
- Firebase Performance Monitoring (latency)
- Custom monitoring (cost alerts)

### 14.2 Maintenance
- Weekly backup of Firestore data
- Monthly security rule review
- Quarterly Firebase SDK updates
- Annual cost optimization review

### 14.3 Support
- In-app help documentation
- Video tutorials for teachers
- Email support for parents
- FAQ page on website

---

## Appendix

### A. Firebase CLI Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase project
firebase init

# Deploy to Firebase Hosting
firebase deploy

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Open Firebase Console
firebase open
```

### B. Seeding Firestore Data

```javascript
// tools/seedFirestore.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-sdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Seed reading levels
async function seedReadingLevels() {
  const levels = [
    {
      level_id: 'kindergarten',
      level_name: 'Kindergarten',
      age_range: '4-5',
      lexile_min: 0,
      lexile_max: 200,
      fry_readability_range: '0-2',
      description: 'Beginner CVC words and letter sounds',
      estimated_duration_weeks: 8,
      min_cvc_words: 20,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    },
    // ... Grade 1, Grade 2
  ];
  
  const batch = db.batch();
  levels.forEach(level => {
    const ref = db.collection('reading_levels').doc(level.level_id);
    batch.set(ref, level);
  });
  
  await batch.commit();
  console.log('Reading levels seeded successfully');
}

seedReadingLevels().catch(console.error);
```

### C. Related Documents

- `memory/Jolly-Phonics-Audio-Documentation.md` - Audio file references
- `memory/ReadinConnect-Feature-Ideas.md` - Feature backlog
- `tools/firebase/schema.js` - Firestore schema definitions
- `goals/literacy-app.md` - Project goals and OKRs

---

**Document Status:** ✅ Approved for Development  
**Next Steps:**
1. ✅ PRD reviewed and approved
2. ⏳ Create Firebase project
3. ⏳ Initialize Firestore and Authentication
4. ⏳ Write Security Rules
5. ⏳ Seed Firestore data
6. ⏳ Begin Phase 1 implementation

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Owner:** ReadinConnect Product Team
