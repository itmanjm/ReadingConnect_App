# Firebase Setup

## Step 1: Enable Firestore Database

```bash
# Navigate to project
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend

# Enable Firestore (if not already enabled)
firebase use readingconnect-lit
```

Then go to Firebase Console:
1. https://console.firebase.google.com/project/readingconnect-lit/firestore
2. Click "Create database"
3. Start in "production mode" (free tier)

## Step 2: Deploy Security Rules

The security rules file has been created at:
`frontend/firestore.rules`

To deploy:
```bash
firebase deploy --only firestore:rules
```

## Step 3: Deploy Firestore Indexes

The indexes file has been created at:
`frontend/firestore.indexes.json`

To deploy:
```bash
firebase deploy --only firestore:indexes
```

## Free Tier Considerations

The current design is optimized for free tier:

**Firestore Free Tier Limits:**
- Reads: 50K/day
- Writes: 20K/day
- Storage: 1GB

**Optimizations Applied:**
1. **Compound indexes** on student_id + current_mastery for efficient queries
2. **Minimal subcollections** - only create progress documents as needed
3. **Client-side caching** - Use Zustand with Firestore listeners
4. **Pagination** - Limit queries to 20 words at a time

## Step 4: Verify Setup

After deploying, verify in Firebase Console:
1. Firestore is enabled: https://console.firebase.google.com/project/readingconnect-lit/firestore/data
2. Security rules are deployed: https://console.firebase.google.com/project/readingconnect-lit/firestore/rules
3. Indexes are deployed: https://console.firebase.google.com/project/readingconnect-lit/firestore/indexes

---

## Next Steps (After Phase 1 Complete)

Once Firestore is set up:
1. Run seed scripts to populate reading levels
2. Implement CVC word practice activity
3. Implement sight word practice activity
4. Connect dashboards to real Firestore data
