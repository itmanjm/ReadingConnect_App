# Google Cloud Text-to-Speech Setup Guide

## Step 1: Enable Google Cloud Text-to-Speech API

1. Go to https://console.cloud.google.com/
2. Select your project (readingconnect-lit)
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Cloud Text-to-Speech API"**
5. Click **Enable**

## Step 2: Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name: `tts-service-account`
4. Click **Create and Continue**
5. Role: **Cloud Text-to-Speech User**
6. Click **Continue** > **Done**

## Step 3: Create and Download Key

1. Find your service account in the list
2. Click on it
3. Go to **Keys** tab
4. Click **Add Key** > **Create New Key**
5. Select **JSON**
6. Click **Create**
7. Download the JSON file

## Step 4: Add Key to Firebase

1. Open the downloaded JSON file
2. Copy the entire content
3. Run this command in terminal:

```bash
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend/functions
firebase functions:config:set google.application_credentials="$(cat /path/to/downloaded-key.json)"
```

Or manually:

```bash
firebase functions:config:set google.application_credentials='{"type": "service_account", ...}'
```

## Step 5: Update Function Code

The function at `functions/src/tts/generateTTS.ts` needs authentication. Add this at the top:

```typescript
const credentials = JSON.parse(functions.config().google.application_credentials);
const ttsClient = new google.texttospeech.TextToSpeechClient({ credentials });
```

## Step 6: Deploy

```bash
cd /Users/zero/Documents/Projects/Atlas/readinConnect_app/frontend/functions
npm install @google-cloud/text-to-speech
npm run deploy
```

## Step 7: Update Frontend

Replace imports in game files:

**OLD:**
```typescript
import { speakCVCWord, speakPhoneme } from '@/lib/audio/ttsPhonics';
```

**NEW:**
```typescript
import { speakCVCWord, speakPhoneme } from '@/lib/audio/googleTTS';
```

## Free Tier Limits

- **4 million characters/month** = FREE
- This equals approximately:
  - 60,000 words/month
  - 2,000 words/day
  - More than enough for typical classroom use

## Voice Used

- **en-US-Wavenet-D** - Male, neutral voice
- Speaking rate: 0.85 (slightly slower for children)
- High quality WaveNet voice

## Costs (if you exceed free tier)

- WaveNet voices: $16 per 1 million characters
- Example: 100,000 extra characters = $1.60

## Testing

After setup, test with:
```typescript
import { speakText } from '@/lib/audio/googleTTS';

// Should play high-quality audio
speakText('Hello, this is a test');
```

---

## Need Help?

Run into issues? The most common problems:
1. API not enabled (Step 1)
2. Wrong service account permissions (Step 2)
3. Credentials not set properly (Step 4)
