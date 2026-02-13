# Firestore Data Seeding Guide

## Overview
This script seeds the Firebase Firestore database with reading levels and sample CVC words.

## Prerequisites

1. **Firebase Admin SDK private key** required:
   ```bash
   export FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
   ```

2. Generate Firebase Admin SDK private key:
   - Go to: https://console.firebase.google.com/project/readingconnect-lit/settings/serviceaccounts/adminsdk
   - Click "Generate new private key"
   - Save the key securely (never commit to git!)

## Run the Seed Script

```bash
# Navigate to project directory
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend

# Set the private key (replace with actual key)
export FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----YOUR_KEY_HERE..."

# Run the seed script
node seed-firestore.js
```

## What Gets Seeded

### Reading Levels (3 levels)
1. **Kindergarten** (4-5 years)
   - Lexile: 0-200
   - Fry Readability: 0-2
   - 20+ CVC words

2. **Grade 1** (6-7 years)
   - Lexile: 200-400
   - Fry Readability: 2-3
   - 30+ CVC words

3. **Grade 2** (8+ years)
   - Lexile: 400-700
   - Fry Readability: 4-6
   - 40+ CVC words

### CVC Words (10 sample words)
- Easy: cat, dog, sun
- Medium: pig, pan, hat, net
- Hard: jump, frog, trump

Each word includes:
- `word`: The word text
- `letter1`, `letter2`, `letter3`: Individual letters
- `phonetic_sound`: IPA pronunciation guide
- `frequency`: Commonness (1-5)
- `difficulty_level`: easy, medium, hard

## Firestore Collections Created

### Top-level Collections
- `reading_levels/{level_id}` - Reading level definitions
- `students/{student_id}` - Student records (created by auth)
- `activities/{activity_id}` - Activity templates
- `badges/{badge_id}` - Badge definitions

### Subcollections (under reading_levels)
- `reading_levels/{level_id}/cvc_words/{word_id}` - CVC word library

### Subcollections (under students)
- `students/{student_id}/cvc_word_progress/{word_id}` - Per-word mastery tracking
- `students/{student_id}/sight_word_progress/{word_id}` - Sight word progress
- `students/{student_id}/level_progress/{level_id}` - Level completion progress
- `students/{student_id}/badges/{badge_id}` - Earned badges

## Free Tier Optimization

To stay within free tier limits:
- **Write batches**: Uses `db.batch()` to group operations
- **Sample data**: 10 CVC words instead of 60 per level (expandable later)
- **Efficient indexes**: Pre-defined composite indexes for fast queries

## After Seeding

Verify in Firebase Console:
1. https://console.firebase.google.com/project/readingconnect-lit/firestore/data → reading_levels
2. Check the collection count matches expected
3. Verify security rules are working

---

## Next Steps

1. Expand CVC word list (60+ words per level)
2. Add sight words (100+ per level)
3. Create badge seed data
4. Test queries with mock students

## Troubleshooting

**Error: "The caller does not have permission"**
- Ensure private key is valid
- Check Firebase Console: Project settings → Service accounts
- Verify IAM permissions

**Error: "Cannot read/write data"**
- Check firestore.rules deployment
- Verify indexes are created

---

**⚠️ SECURITY WARNING**: Never commit private keys to git or share publicly!
