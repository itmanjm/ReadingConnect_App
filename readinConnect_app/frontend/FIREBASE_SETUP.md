# ReadinConnect - Firebase Configuration Instructions

## Firebase Auth Setup Required

The app is deployed but Firebase Authentication is not yet configured. Follow these steps:

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/readingconnect-lit/authentication

### 2. Enable Email/Password Authentication
1. Click "Get Started" under "Email/Password" sign-in method
2. Enable the provider
3. Click "Save"

### 3. (Optional) Enable Google Sign-In
1. Click "Add new provider"
2. Select "Google"
3. Click "Enable"
4. Add your domain to authorized domains if needed

### 4. Configure Authorized Domains
Make sure these domains are authorized:
- `readingconnect-lit.firebaseapp.com`
- `readingconnect-lit.web.app`

### 5. After Configuration
Once configured:
- Wait 1-2 minutes for changes to propagate
- Refresh https://readingconnect-lit.web.app
- Test auth by clicking "Start Your Adventure" → "Sign In"

---

## Current Firebase Configuration (from .env.local)
```
Project ID: readingconnect-lit
Auth Domain: readingconnect-lit.firebaseapp.com
Storage Bucket: readingconnect-lit.firebasestorage.app
App ID: 1:302745627563:web:38799530a09e1ca54f00ee
```

---

## Testing the Deployment

After configuring Firebase Auth:
1. Visit: https://readingconnect-lit.web.app
2. Expected: Landing page with "ReadinConnect" title
3. Current state: "Loading..." (waiting for Firebase Auth init)

## Known Issue
The app shows "Loading..." because Firebase Auth initialization blocks the app render. This is expected with static exports on Firebase Hosting.

### Workaround (Temporary)
The app will still load after 3 seconds (timeout), but Firebase Auth features won't work until you configure Firebase Authentication in the console.

---

## Next Steps
1. Configure Firebase Auth using instructions above
2. Test the site after configuration
3. For full functionality, consider deploying to Vercel instead (better Next.js support)
