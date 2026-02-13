# Firebase Storage Setup Guide

## Enable Firebase Storage

Firebase Storage needs to be enabled in the Firebase Console (not via CLI).

### Step 1: Enable Storage

1. Go to: https://console.firebase.google.com/project/readingconnect-lit/storage
2. Click "Get Started"
3. Select Start in production mode (for free tier)
4. Wait for initialization

### Step 2: Deploy Storage Rules

The storage rules file has been created at:
`frontend/storage.rules`

To deploy manually via Firebase Console:
1. Go to: https://console.firebase.google.com/project/readingconnect-lit/storage/rules
2. Paste the contents of `storage.rules`
3. Click "Publish"

**Rules Summary:**
- ✅ Public read access for audio files (students can hear sounds)
- ✅ Authenticated write access (teachers can upload new audio/PDFs)

### Step 3: Create Storage Buckets (Optional)

The default bucket will work:
- `readingconnect-lit.appspot.com`

For custom buckets, use Firebase Console:
1. Storage → Buckets
2. Create bucket
3. Update security rules

## Free Tier Storage Limits

**Storage Free Tier:**
- 1GB total storage
- 5GB/month download bandwidth
- 20GB/day upload bandwidth

**Optimization for Free Tier:**
1. **Audio files**: Use compressed MP3 (96kbps for voice)
2. **Caching**: Browser caches audio automatically
3. **Batch uploads**: Upload multiple files in single session

## Storage Folder Structure (Recommended)

```
readingconnect-lit.appspot.com/
├── audio/                    # Jolly Phonics audio files
│   ├── cvc/                # CVC word pronunciations
│   │   ├── cat.mp3
│   │   ├── dog.mp3
│   │   └── ...
│   └── sight-words/       # Sight word audio
│       ├── the.mp3
│       └── ...
└── worksheets/               # Generated PDFs
    ├── kindergarten_2025-02-10.pdf
    └── ...
```

## Upload Audio Files (Manual for Now)

For MVP, use Firebase Console:
1. Storage → Files
2. Create folder `audio/cvc/`
3. Upload individual MP3 files for CVC words

**Sample file naming:**
- `cat.mp3` - /k/-/æ/-/t/
- `dog.mp3` - /d/ɒ/-/g/
- `sun.mp3` - /s/-/ʌ/

**Note:** For MVP, we'll use browser text-to-speech (Web Speech API) instead of pre-recorded audio files to stay within free tier limits.

## Alternative: Web Speech API

Instead of uploading audio files, we can use browser's built-in speech synthesis:

```javascript
const speak = (word: string) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
};
```

**Benefits of Web Speech API:**
- No storage costs
- No upload time
- Works offline after first load
- Infinite variety of pronunciations
- No file management overhead

---

## Next Steps

1. Enable Storage in Firebase Console
2. Deploy storage.rules manually (rules tab)
3. Test read/write access
4. Proceed to building features (Storage ready)
