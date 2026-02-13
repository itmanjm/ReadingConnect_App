# Firebase Project Setup Guide

This guide will help you set up Firebase for ReadinConnect's authentication system.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `readinconnect`
4. Disable Google Analytics for this project (not needed for auth)
5. Click **"Create project"**
6. Wait for project creation (1-2 minutes)

## Step 2: Enable Authentication

1. In the Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get Started"**
3. Click **"Sign-in method"** tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Enable "Email/Password" provider
   - Click **"Save"**
5. Enable **Google**:
   - Click on "Google"
   - Enable "Google" provider
   - Add your project name and support email
   - Click **"Save"**

## Step 3: Get Firebase Configuration

1. Click the **Project Overview** gear icon (top left) → **Project Settings**
2. Scroll down to **"Your apps"** section
3. Click **Web icon (</>)**
4. Enter app name: `ReadinConnect Frontend`
5. Register the app (don't check Firebase Hosting)
6. Copy the **firebaseConfig** object values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "readinconnect.firebaseapp.com",
     projectId: "readinconnect",
     storageBucket: "readinconnect.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXX"  // Optional, may not be present
   }
   ```

## Step 4: Configure Environment Variables

1. Create/Update the `.env.local` file in the frontend directory:
   ```bash
   cd readinConnect_app/frontend
   ```

2. Add the following Firebase environment variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

   # Supabase Configuration (existing)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Replace `your_*_here` with the actual values from the Firebase Console

## Step 5: Run Database Migration

Apply the database migration to add `firebase_uid` column to the profiles table:

```bash
cd /Users/zero/Documents/Projects/Atlas
supabase migration up --local
```

Or manually run the migration SQL:
```bash
psql -h localhost -U postgres -d readinconnect -f tools/database/migrations/add_firebase_uid.sql
```

## Step 6: Test the Application

1. Start the development server:
   ```bash
   cd readinConnect_app/frontend
   npm run dev
   ```

2. Open your browser: http://localhost:3000

3. Test authentication flows:
   - Register with email/password
   - Register with Google Sign-In
   - Login with email/password
   - Login with Google Sign-In
   - Verify role-based routing works

## Step 7: Verify Firebase Integration

Check the Firebase Console:
1. Go to **Authentication** → **Users** tab
2. Verify users are appearing after registration
3. Check that both email/password and Google providers are working

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct in `.env.local`
- Restart the development server after updating environment variables

### "Firebase: Error (auth/operation-not-allowed)"
- Verify that both Email/Password and Google providers are enabled in Firebase Console
- Go to Firebase Console → Authentication → Sign-in method

### "No such user" error
- User doesn't exist in Firebase Authentication
- User must register before they can log in

### Google Sign-In popup doesn't open
- Check browser's popup blocker settings
- Ensure Google provider is enabled in Firebase Console

### Profile not syncing to database
- Verify Supabase connection is working
- Check that `profiles` table has `firebase_uid` column
- Check Supabase logs for errors

## Next Steps

After completing this setup:
1. ✅ Users can register/login with Email/Password
2. ✅ Users can register/login with Google Sign-In
3. ✅ Firebase users are synced to PostgreSQL profiles table
4. ✅ Role-based routing works correctly

---

**Support**: If you encounter any issues, check the browser console for error messages and verify all configuration values are correct.
