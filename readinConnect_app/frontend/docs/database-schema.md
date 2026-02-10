# Firebase Realtime Database Schema

## Overview

Firebase Realtime Database provides a cloud-hosted NoSQL database for storing and syncing user data in real-time. Data is stored as JSON and synchronized to all connected clients.

## Tables

### 1. Users
```json
{
  "users": {
    "uid": "string - User unique identifier",
    "email": "string - User email address",
    "displayName": "string - User's display name",
    "role": "string - User role (student, teacher, parent, admin)",
    "selectedLevel": "number - Currently selected reading level",
    "totalPoints": "number - Total points earned",
    "streakDays": "number - Current consecutive days of activity",
    "createdAt": "number - Account creation timestamp",
    "lastActiveAt": "number - Last activity timestamp"
    "preferences": {
      "audioEnabled": "boolean - Enable/disable audio",
      "theme": "string - Preferred theme"
    }
  }
}
```

### 2. ReadingLevels
```json
{
  "readingLevels": {
    "1": {
      "title": "Level 1: Beginner",
      "description": "Introduction to letters and sounds",
      "emoji": "🌟",
      "minAge": "4",
      "maxAge": "5",
      "wordCount": "20",
      "order": 1
    },
    "2": {
      "title": "Level 2: Beginner",
      "description": "Simple CVC words and sight words",
      "emoji": "📖",
      "minAge": "5",
      "maxAge": "6",
      "wordCount": "40",
      "order": 2
    },
    "3": {
      "title": "Level 3: Intermediate",
      "description": "Building reading fluency with longer passages",
      "emoji": "📚",
      "minAge": "6",
      "maxAge": "8",
      "wordCount": "50",
      "order": 3
    },
    "4": {
      "title": "Level 4: Intermediate",
      "description": "Advanced vocabulary and comprehension",
      "emoji": "📗",
      "minAge": "7",
      "maxAge": "9",
      "wordCount": "60",
      "order": 4
    },
    "5": {
      "title": "Level 5: Advanced",
      "description": "Complex reading and critical thinking",
      "emoji": "🚀",
      "minAge": "8",
      "maxAge": "10",
      "wordCount": "80",
      "order": 5
    }
  }
}
```

### 3. CVCWords
```json
{
  "cvcWords": {
    "word": "string - The CVC word (e.g., 'cat')",
    "letter": "string - Consonant (c)",
    "vowel": "string - Vowel (v)",
    "consonant2": "string - Consonant 2 (c2)",
    "vowel2": "string - Vowel 2 (v2)",
    "consonant3": "string - Consonant 3 (optional c3)",
    "audioPath": "string - Path to audio file",
    "level": "number - Difficulty level (1-5)",
    "createdAt": "number - Word creation timestamp"
  }
}
```

### 4. SightWords
```json
{
  "sightWords": {
    "word": "string - The sight word",
    "level": "number - Difficulty level (1-3)",
    "pronunciation": "string - TTS pronunciation",
    "examples": {
      "sentence": "string - Example sentence",
      "context": "string - Word in context"
    },
    "masteredCount": "number - Times user has answered correctly (3 = mastered)",
    "masteredAt": "number - Timestamp when word was mastered",
    "createdAt": "number - Word creation timestamp"
  }
}
```

### 5. UserProgress
```json
{
  "userProgress": {
    "uid": "string - User ID",
    "levelId": "number - Reading level ID",
    "wordId": "string - Word ID (for CVC or sight word)",
    "activityId": "number - Activity type ID",
    "score": "number - Score earned (correct answers)",
    "attempts": "number - Total attempts",
    "completedAt": "number - Timestamp when completed",
    "timeSpent": "number - Time spent in seconds"
    "createdAt": "number - Progress record timestamp"
  }
}
```

### 6. Badges
```json
{
  "badges": {
    "badgeId": "string - Badge unique identifier",
    "userId": "string - User ID",
    "type": "string - Badge type (level_completion, word_mastery, streak)",
    "levelId": "number - Associated reading level",
    "wordId": "string - Associated word ID (for mastery badges)",
    "streakCount": "number - Streak count when awarded",
    "earnedAt": "number - Timestamp when earned",
    "createdAt": "number - Badge creation timestamp"
  }
}
```

### 7. Rewards
```json
{
  "rewards": {
    "rewardId": "string - Reward unique identifier",
    "title": "string - Reward title",
    "description": "string - Reward description",
    "icon": "string - Emoji icon",
    "cost": "number - Points required",
    "points": "number - Points value",
    "image": "string - Optional image path",
    "userId": "string - User ID",
    "claimedAt": "number - Timestamp when claimed",
    "createdAt": "number - Reward creation timestamp"
  }
}
```

### 8. Streaks
```json
{
  "streaks": {
    "userId": "string - User ID",
    "currentStreak": "number - Current consecutive days",
    "lastActiveDate": "number - Last activity date",
    "bestStreak": "number - Best streak ever",
    "createdAt": "number - First streak created",
    "updatedAt": "number - Last update timestamp"
  }
}
```

### 9. Worksheets
```json
{
  "worksheets": {
    "worksheetId": "string - Worksheet unique identifier",
    "levelId": "number - Associated reading level",
    "title": "string - Worksheet title",
    "generatedAt": "number - Generation timestamp",
    "pdfPath": "string - Path to PDF file in storage",
    "content": {
      "passages": "array of reading passages",
      "exercises": "array of activities (phonics, vocabulary, comprehension)",
      "wordCount": "number - Number of words (10-20)"
    },
    "userId": "string - User who generated worksheet",
    "createdAt": "number - Worksheet creation timestamp"
  }
}
```

### 10. Activities
```json
{
  "activities": {
    "activityId": "string - Activity unique identifier",
    "userId": "string - User ID",
    "type": "string - Activity type (cvc_practice, sight_words, fluency, comprehension)",
    "levelId": "number - Associated reading level",
    "score": "number - Points earned",
    "completedAt": "number - Completion timestamp",
    "timeSpent": "number - Time spent in seconds",
    "createdAt": "number - Activity creation timestamp"
  }
}
```

## Indexing Strategy

Firebase Realtime Database queries are optimized with `.indexOn` property on references:

### Users
- Index on: `uid` (for user lookups by role)
- Index on: `email` (for authentication)
- Index on: `role` (for filtering users by role)

### UserProgress
- Index on: `uid` (for user progress queries)
- Composite index on: `uid + levelId` (for querying user progress in specific level)
- Index on: `createdAt` (for sorting recent progress)

### ReadingLevels
- Index on: `order` (for fetching levels in sequence)
- No complex queries needed for simple level listing

### CVCWords
- No indexes needed for simple word lookup by level
- Filter queries: `orderByChild('level')` for fetching words by difficulty

### SightWords
- Index on: `level` (for fetching sight words by difficulty)
- No complex indexes needed

### Badges & Rewards
- Index on: `userId` (for user's badges and rewards)
- Index on: `type` (for filtering badges by type)
- No complex indexes needed

## Security Rules

Firebase Realtime Database rules are defined in `firebase.database.rules`:

```json
{
  "rules": {
    ".read": "auth != null && (auth.uid == userId || root.exists() == true)",
    ".write": "auth != null && (auth.uid == userId || root.exists() == true)",
    ".validate": "auth != null && ( newData().val() != null)",
    ".indexOn": "uid"  // Optimize for large collections
  }
}
```

## Implementation Notes

1. **Data Structure**: All data stored as JSON with denormalized structure optimized for Firebase Realtime queries
2. **Real-time Sync**: Firebase Realtime Database provides automatic synchronization to all connected clients
3. **Indexing**: Primary indexes on commonly queried fields (`uid`, `email`, `role`, `level`, `createdAt`)
4. **Security**: Rule-based access control using Firebase Authentication
5. **Offline Support**: Firebase automatically caches data locally when offline
6. **Scalability**: Designed to scale from simple prototype to full production deployment
