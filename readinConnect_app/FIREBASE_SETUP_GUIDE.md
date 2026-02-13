# Firebase Setup Guide

> Complete step-by-step guide to set up Firebase for ReadinConnect

---

## 🎯 Overview

This guide walks you through setting up Firebase for the ReadinConnect literacy learning platform, including:
- Creating a Firebase project
- Importing the complete database schema
- Configuring authentication
- Setting up storage for audio and PDF files
- Getting your API credentials

**Time Required:** 10-15 minutes
**Prerequisites:** None (Firebase is free!)

---

## Step 1: Create Firebase Account

1. Go to https://firebase.com
2. Click **"Start your project"** or **"Sign Up"**
3. Choose one of the following:
   - **GitHub** (recommended - easiest)
   - **Email**
   - **Google**
4. Follow the prompts to create your account

**Why GitHub is recommended:**
- Faster setup (no password confirmation email)
- Integrated with your existing workflow
- One-click project creation

---

## Step 2: Create a New Project

1. After signing in, you'll see the **"New Project"** button
2. Click **"New Project"**
3. Fill in the form:

   **Organization Name:** `ReadinConnect` (or your organization)
   **Project Name:** `readinconnect-app`
   **Database Password:** Create a strong password (save it somewhere safe!)

4. Click **"Create new project"**

5. **Wait for setup** (usually takes 1-2 minutes)
   - Firebase will provision:
     - PostgreSQL database
     - Authentication system
     - Real-time database
     - File storage
     - Edge functions

6. Once ready, click **"Continue to Project Dashboard"**

**Success:** You should see the Firebase dashboard for your new project!

---

## Step 3: Import the Database Schema

### Option A: Via SQL Editor (Recommended - Easiest)

1. In the Firebase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New Query"** button
3. Navigate to the database schema file:
   ```
   readinConnect_app/tools/database/schema.sql
   ```

4. Open `schema.sql` in your text editor
5. **Copy the entire file** (Ctrl/Cmd + A, then Ctrl/Cmd + C)
6. Go back to Firebase SQL Editor
7. **Paste the schema** (Ctrl/Cmd + V)
8. Click the **"Run"** button (or press Ctrl/Cmd + Enter)

9. **Wait for execution** (10-30 seconds)
   - You should see a green success message
   - All 21 tables will be created
   - All functions and policies will be set up

**Success Indicators:**
- Green checkmark next to query
- `Success. No rows returned` message
- Tables appear in the **Table Editor** section

### Option B: Via Command Line (For Developers)

If you have the Firebase CLI installed:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```
   (This opens your browser for authentication)

3. **Link your local project to Firebase:**
   ```bash
   cd readinConnect_app
   firebase link --project-ref YOUR_PROJECT_ID
   ```
   (Find your project ID in the dashboard URL: `firebase.com/dashboard/project/YOUR_PROJECT_ID`)

4. **Push the schema:**
   ```bash
   cd frontend
   firebase db push
   ```

**Success:** Schema imported without errors!

---

## Step 4: Get Your API Credentials

1. In the Firebase dashboard, click **Settings** in the left sidebar
2. Click **API** in the settings menu
3. You'll see your credentials:

   **Project URL:**
   ```
   https://xxxxxxxxx.firebase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role (secret):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **Keep the service_role key secret! Never commit it to Git!**

4. **Copy both:**
   - Project URL
   - anon public key
   - (Optional) service_role key

---

## Step 5: Configure Environment Variables

### 1. Create `.env.local` File

Navigate to your frontend directory:
```bash
cd readinConnect_app/frontend
```

Create a new file named `.env.local`

### 2. Add Firebase Credentials

Paste the following into `.env.local`:

```env
# Firebase Configuration
# Get these from: https://firebase.com/dashboard/project/YOUR_PROJECT_ID/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.firebase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For server-side operations (admin access)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace:**
- `https://xxxxxxxxx.firebase.co` with your actual Project URL
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual anon key

### 3. Save the File

Save `.env.local` in the `frontend` directory

**⚠️ Important:**
- Never commit `.env.local` to Git (it's in `.gitignore`)
- Never share your service_role key publicly
- Keep credentials secure

---

## Step 6: Verify the Setup

### 1. Test Database Connection

You can use the provided validation script:

```bash
cd readinConnect_app
python3 tools/setup/validate_firebase.py
```

**Expected Output:**
```
✅ Firebase connection successful!
   URL: https://xxxxxxxxx.firebase.co
   Anon key: ...xxxx...
   Project: readinconnect-app
```

### 2. Start the Development Server

```bash
cd readinConnect_app/frontend
npm run dev
```

### 3. Test Authentication

1. Open http://localhost:3000
2. Click **"Get Started"**
3. Click **"Sign up"**
4. Register a new account
5. Verify you can log in with those credentials

### 4. Check Database in Firebase Dashboard

1. Go to **Table Editor** in Firebase dashboard
2. You should see all 21 tables created:
   - `profiles`
   - `students`
   - `activities`
   - `weekly_plans`
   - `weekly_activities`
   - `skill_progress`
   - `activity_completions`
   - `sight_words`
   - `sight_word_progress`
   - `phonics_letters`
   - `phonics_progress`
   - `vocabulary_words`
   - `vocabulary_mastery`
   - `fluency_sessions`
   - `comprehension_questions`
   - `comprehension_responses`
   - `badges`
   - `earned_badges`
   - `reward_points`
   - `observation_sheets`
   - `printable_assets`

---

## Step 7: Set Up Storage (Optional, Recommended)

For audio files and PDF printables:

1. In Firebase dashboard, click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Create these buckets:

   **Bucket 1:** `audio-files`
   - Public: Yes (if you want to serve audio directly)
   - File size limit: 10MB
   - Allowed MIME types: `audio/*`

   **Bucket 2:** `printable-pdfs`
   - Public: No (for security)
   - File size limit: 25MB
   - Allowed MIME types: `application/pdf`

4. Upload sample files to test (optional)

---

## Step 8: Configure Authentication Email Templates (Optional)

For a better user experience:

1. In Firebase dashboard, go to **Authentication** → **Templates**
2. Configure:

   **Confirm Signup Template:**
   - Subject: "Welcome to ReadinConnect!"
   - Body: Custom welcome message
   - Include links: "Verify your email" button

   **Reset Password Template:**
   - Subject: "Reset your ReadinConnect password"
   - Include: "Reset Password" link
   - Expiry time: 1 hour

3. Save the templates

---

## 🎯 What Was Created

### Database Tables (21 total)

**User Management (2 tables)**
- `profiles` - Extended auth profiles with roles
- `students` - Student records with teacher/parent links

**Activity System (3 tables)**
- `activities` - Activity library (7 types)
- `weekly_plans` - Teacher-created schedules
- `weekly_activities` - Activity assignments by day

**Progress Tracking (2 tables)**
- `skill_progress` - 8 skill areas tracking
- `activity_completions` - Activity completion records

**Learning Areas (8 tables)**
- `sight_words`, `sight_word_progress` - 220+ Dolch/Fry words
- `phonics_letters`, `phonics_progress` - A-Z alphabet with phonemes
- `vocabulary_words`, `vocabulary_mastery` - Word library
- `fluency_sessions` - WPM and accuracy tracking
- `comprehension_questions`, `comprehension_responses` - Quiz system

**Gamification (3 tables)**
- `badges` - Achievement definitions
- `earned_badges` - Student badges
- `reward_points` - Points tracking

**Teacher Tools (2 tables)**
- `observation_sheets` - Weekly progress logs
- `printable_assets` - PDF resources for download

### Database Functions (4)

- `get_student_progress_summary()` - Aggregate student data
- `get_student_total_points()` - Sum all points
- `get_student_activity_count()` - Count recent completions
- `award_badge()` - Badge awarding logic

### Security Features

- **Row-Level Security (RLS)** on all user-facing tables
- Teacher can only access their students
- Students isolated from each other
- Service role key for admin operations

---

## ✅ Verification Checklist

- [ ] Firebase account created
- [ ] Project created (`readinconnect-app`)
- [ ] Database schema imported (21 tables)
- [ ] All tables visible in Table Editor
- [ ] Project URL copied
- [ ] Anon key copied
- [ ] `.env.local` file created
- [ ] Credentials added to `.env.local`
- [ ] Connection validated (if using validation script)
- [ ] Development server starts without errors
- [ ] Can register new account
- [ ] Can log in with registered account
- [ ] User is routed to correct dashboard

---

## 🚨 Troubleshooting

### Issue: "Error: database schema migration failed"

**Solutions:**
1. Check for SQL syntax errors in the schema
2. Try importing in smaller sections (table by table)
3. Ensure you have a strong database password
4. Check Firebase status page for outages

### Issue: "Cannot connect to Firebase"

**Solutions:**
1. Verify `.env.local` exists in `frontend` directory
2. Check Project URL format: `https://xxxxx.firebase.co`
3. Ensure project is active (not paused in Firebase dashboard)
4. Regenerate API keys from Firebase dashboard
5. Check network connectivity

### Issue: "RLS policy errors"

**Solutions:**
1. The schema includes RLS policies
2. These may block initial inserts
3. Use the service_role key for initial setup if needed
4. Check RLS policies in SQL Editor > Authentication > Policies

### Issue: "Environment variables not loading"

**Solutions:**
1. Restart the development server after creating `.env.local`
2. Ensure `NEXT_PUBLIC_` prefix on public variables
3. Check file is named `.env.local` (not `.env.example`)
4. Verify file encoding is UTF-8

### Issue: "Table not found" errors

**Solutions:**
1. Run the migration again
2. Check Firebase Table Editor to verify tables exist
3. Check table names match exactly (case-sensitive)
4. Review TypeScript types if type errors persist

---

## 📊 Database Schema Reference

### Table Relationships

**User Flow:**
```
auth.users → profiles
            ↓
         students (teacher_id)
```

**Activity Flow:**
```
teachers → weekly_plans → weekly_activities → activities
                                      ↓
                              students → activity_completions
```

**Progress Flow:**
```
students → skill_progress
        ↓ sight_word_progress
        ↓ phonics_progress
        ↓ vocabulary_mastery
        ↓ fluency_sessions
```

**Gamification Flow:**
```
students → activity_completions → reward_points
        ↓
      earned_badges ← badges
```

**Teacher Tools:**
```
teachers → observation_sheets → students
        ↓
    printable_assets
```

---

## 🎓 Advanced Configuration (Optional)

### Enable Real-Time Subscriptions

If you want real-time updates for dashboards:

1. In Firebase dashboard, go to **Database** → **Replication**
2. Enable real-time for your tables:
   - `activity_completions`
   - `earned_badges`
   - `reward_points`
3. Use the `firebase.realtime` client in your code

### Configure Edge Functions

For backend operations that can't be exposed to the client:

1. In Firebase dashboard, click **Edge Functions**
2. Create functions for:
   - Email notifications
   - PDF generation
   - Report generation
3. Deploy and test

### Set Up Database Webhooks

For notifications on database changes:

1. In Firebase dashboard, go to **Database** → **Webhooks**
2. Configure webhooks for:
   - New user registration
   - Activity completions
   - Badge awards
3. Set target URLs (your backend or external service)

---

## 🚀 Next Steps After Setup

### 1. Create Initial Data

Use the seeding script to populate initial data:

```bash
cd readinConnect_app
python3 tools/database/seed.py --full
```

This will populate:
- Sample sight words (Dolch, Fry lists)
- Phonics letters with phonemes
- Badge definitions
- Vocabulary words

### 2. Create Your First Account

1. Run development server: `npm run dev`
2. Open http://localhost:3000
3. Click "Get Started"
4. Register as a teacher account
5. Verify you're redirected to teacher dashboard

### 3. Add Students

1. In teacher dashboard, click "Add Student"
2. Fill in student details
3. Save to database (once backend is connected)

### 4. Test Activities

1. Create a student account (or use existing)
2. Access student dashboard
3. Try each activity:
   - Phonics Letter Hunt
   - Sight Words Bingo
   - Fluency Reading Timer
   - Comprehension Quiz
4. Verify points and badges are displayed

---

## 📚 Additional Resources

### Firebase Documentation
- **Quick Start:** https://firebase.com/docs/guides/getting-started/nextjs
- **Auth:** https://firebase.com/docs/guides/auth
- **Database:** https://firebase.com/docs/guides/database
- **Storage:** https://firebase.com/docs/guides/storage
- **Edge Functions:** https://firebase.com/docs/guides/functions

### ReadinConnect Documentation
- **Setup Guide:** `SETUP_GUIDE.md`
- **Final Report:** `FINAL_REPORT.md`
- **Completion Summary:** `COMPLETION_SUMMARY.md`
- **Database Schema:** `tools/database/schema.sql`

---

## 🎯 Success Criteria

Your setup is complete when:

✅ **Firebase Project Created**
- New project exists in dashboard
- Database is provisioned
- Storage is ready

✅ **Database Schema Imported**
- All 21 tables visible in Table Editor
- All functions created
- RLS policies enabled
- No errors in SQL execution

✅ **Environment Configured**
- `.env.local` file exists
- NEXT_PUBLIC_SUPABASE_URL set
- NEXT_PUBLIC_SUPABASE_ANON_KEY set
- Credentials are valid

✅ **Application Works**
- Development server starts
- Can register/login
- Dashboards load correctly
- No console errors related to database

---

## 💡 Tips for Production

### Security

1. **Never commit secrets:**
   - Add `.env.local` to `.gitignore`
   - Never add API keys to code
   - Use environment-specific configurations

2. **Use service_role carefully:**
   - Only on server-side
   - Never expose to client
   - Store securely (Vault, secrets manager)

3. **Enable RLS:**
   - Already enabled in schema
   - Test with different user roles
   - Verify data isolation

### Performance

1. **Use indexes:**
   - Already included in schema
   - Review slow queries with EXPLAIN ANALYZE
   - Add composite indexes if needed

2. **Optimize queries:**
   - Select only needed columns
   - Use pagination for large datasets
   - Cache frequently accessed data

3. **Connection pooling:**
   - Firebase manages automatically
   - Configured for production workloads

### Monitoring

1. **Firebase Dashboard:**
   - Monitor database size
   - Check query performance
   - Review authentication logs
   - Track API usage

2. **Application Logging:**
   - Add error tracking
   - Monitor user flows
   - Track activity completion rates

---

## 🎉 You're Ready!

Once Firebase is set up, ReadinConnect will have:

✅ **Real Authentication**
✅ **Persistent Data Storage**
✅ **Real-time Capabilities** (optional)
✅ **File Storage** for audio and PDFs
✅ **Row-Level Security** for data protection
✅ **Scalable Database** with automatic backups

**Next:** Start building your classroom with ReadinConnect!

---

**Need Help?**
- **Firebase Docs:** https://firebase.com/docs
- **Support:** https://firebase.com/support
- **Community:** https://firebase.com/community

---

*Created: 2026-02-07*
*Purpose: Complete Firebase setup guide for ReadinConnect*
*Version: 1.0.0*
