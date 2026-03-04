# Google Cloud TTS - Implementation Summary

## ✅ Code Created

### 1. Frontend TTS Client
**File:** `frontend/lib/audio/googleTTS.ts`
- Speaks text using Google Cloud TTS
- Caches audio files for reuse
- Fallback to Web Speech if TTS fails
- Supports batch preloading

### 2. Cloud Function
**File:** `frontend/functions/src/tts/generateTTS.ts`
- Generates MP3 audio using WaveNet voices
- Saves to Firebase Storage
- Returns signed URLs (7-day expiry)
- Supports batch generation

## 📋 Setup Steps (REQUIRED)

### Step 1: Install Package
```bash
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend/functions
npm install @google-cloud/text-to-speech
```

### Step 2: Enable Google Cloud API
1. Go to https://console.cloud.google.com/apis/library
2. Search "Cloud Text-to-Speech API"
3. Click **ENABLE**
4. Select project: **readingconnect-lit**

### Step 3: Setup Authentication

**Option A: Using gcloud CLI (recommended)**
```bash
# Login to Google Cloud
gcloud auth application-default login

# Set project
gcloud config set project readingconnect-lit
```

**Option B: Using Service Account Key**
1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Create service account: `tts-function`
3. Grant role: **Cloud Text-to-Speech User**
4. Create key (JSON) and download
5. Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

### Step 4: Deploy Functions
```bash
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend/functions
npm run deploy
```

### Step 5: Update Game Imports

Update all game files to use new TTS:

**In files:**
- `app/activities/word-builder/page.tsx`
- `app/activities/sound-detective/page.tsx`
- `app/activities/story-sequencing/page.tsx`
- `app/activities/reading-racetrack/page.tsx`
- `app/activities/question-quest/page.tsx`
- `app/activities/word-pop/page.tsx`
- `app/activities/blend-blaster/page.tsx`
- `app/activities/magic-e/page.tsx`

**Change:**
```typescript
// FROM:
import { speakCVCWord, speakPhoneme } from '@/lib/audio/ttsPhonics';

// TO:
import { speakCVCWord, speakPhoneme } from '@/lib/audio/googleTTS';
```

### Step 6: Deploy Frontend
```bash
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend
npm run build
firebase deploy --only hosting --project readingconnect-lit
```

## 🎤 Voice Configuration

**Voice:** `en-US-Wavenet-D`
- **Type:** Male, neutral
- **Quality:** WaveNet (most natural)
- **Speed:** 0.85 (15% slower for children)
- **Pitch:** Normal

**Alternative voices:**
- `en-US-Wavenet-C` - Female
- `en-US-Wavenet-A` - Male, deeper
- `en-US-Wavenet-F` - Female, younger

Change in `functions/src/tts/generateTTS.ts` if needed.

## 💰 Free Tier

- **4 million characters/month** = FREE
- ~60,000 words/month
- Typical usage: 500-2000 words/day
- **You will NOT be charged** unless you exceed 4M chars

## 🧪 Testing

After deployment, test with:
```javascript
// In browser console
import { speakText } from './lib/audio/googleTTS';
speakText('Hello, this is a test of the new voice');
```

## 🔧 Troubleshooting

**Error: "API not enabled"**
→ Go to Google Cloud Console and enable Text-to-Speech API

**Error: "Permission denied"**
→ Check service account has "Cloud Text-to-Speech User" role

**Error: "No audio generated"**
→ Check Firebase Storage bucket exists and is writable

**Voice sounds robotic**
→ Make sure you're using WaveNet voice (not Standard)

---

## ⏱️ Time Estimate

- Enable API: 2 minutes
- Setup auth: 5 minutes  
- Deploy functions: 3 minutes
- Update imports: 5 minutes
- Deploy frontend: 2 minutes

**Total: ~17 minutes**

Ready to proceed with setup?
