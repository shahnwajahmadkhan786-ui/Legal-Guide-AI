# 🚀 Deployment Checklist - Next Steps

Follow this step-by-step to deploy NyayaSahay to production:

## Phase 1: Local Setup & Testing (30 mins)

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Firebase config from your Firebase Console
- [ ] Add NVIDIA API key to `.env.local`
- [ ] Run `npm install && npm run build`
- [ ] Test build: `npm run preview`
- [ ] (Optional) Test with Firebase emulator: `firebase emulators:start`

## Phase 2: Firebase Setup (15 mins)

```bash
# 1. Install Firebase CLI globally
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize (if not already done)
firebase init

# Select:
# - Firestore
# - Functions (TypeScript)
# - Hosting
# - Use existing project
```

## Phase 3: Deploy Backend (Cloud Functions)

```bash
# 1. Update functions environment
cd functions
npm install
cd ..

# 2. Add NVIDIA key to Firebase Secret Manager
firebase functions:config:set nvidia.api_key="YOUR_KEY_HERE"

# 3. Deploy functions
firebase deploy --only functions

# Watch deployment:
firebase functions:log
```

**Status Check:** Visit [Firebase Console](https://console.firebase.google.com) → Functions → Should see 5 functions ✓

## Phase 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Phase 5: Deploy Frontend to Hosting

```bash
npm run build
firebase deploy --only hosting
```

**Your app is live!** 🎉

Firebase will show you the hosting URL:
```
Hosting URL: https://your-project.web.app
```

---

## 🔧 One-Time Setup: Firebase Secret Manager

To securely store your NVIDIA API key:

```bash
# Install gcloud CLI (if not already installed)
# Then run:

gcloud secrets create nvidia-api-key \
  --data-file=- <<< "YOUR_NVIDIA_API_KEY"

# Grant Cloud Functions permission
gcloud secrets add-iam-policy-binding nvidia-api-key \
  --member="serviceAccount:YOUR_PROJECT@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Then update `functions/src/index.ts` to load from Secret Manager (advanced setup).

---

## ✅ Verify Deployment

1. **Frontend**: Visit your hosting URL
2. **Auth**: Try signing up with email/password
3. **Chat**: Send a test message
4. **Firestore**: Check Console → Firestore → Collections (should see "threads")
5. **Functions**: Check Console → Functions → Logs (no errors)

---

## 📊 Monitor Live

```bash
# Watch function logs in real-time
firebase functions:log

# View Firestore usage
firebase open firestore

# View hosting analytics
firebase open hosting
```

---

## 🐛 If Something Goes Wrong

### Functions not deploying?
```bash
cd functions
npm run build  # Check for TypeScript errors
firebase deploy --only functions --debug
```

### Can't send messages?
1. Check if Cloud Functions are running: `firebase functions:list`
2. Check logs: `firebase functions:log`
3. Verify Firebase config in `.env.local`
4. Try signing out and back in

### Messages not appearing?
1. Firestore rules might be rejecting writes
2. Check Firestore Rules tab in Console
3. Ensure you're on right Cloud Functions region (asia-south1)

---

## 🌍 Global CDN Deployment (Optional)

For even faster loading globally:

```bash
# Enable multi-region hosting
firebase hosting:channel:deploy preview-1
```

---

## 📱 Post-Launch Checklist

- [ ] Set up analytics to track usage
- [ ] Monitor cost in Firebase Console
- [ ] Set up alerts for quota limits
- [ ] Enable automatic backups in Firestore
- [ ] Create admin user for moderation (if needed)
- [ ] Test on mobile devices
- [ ] Share link with beta users

---

## 💰 Cost Monitoring

Check daily costs in Firebase Console:

1. Go to Project Settings → Billing
2. Set up email alerts for spending

**First month should be $0** (free tier)
**Expected: $5-50/month** at scale depending on usage

---

## 🎯 Success! 🎉

Your platform is now live and accessible to all Indians!

**Next steps:**
1. Test with real users
2. Gather feedback
3. Add more legal knowledge base
4. Promote on social media

Questions? Check `SETUP_GUIDE.md` or open an issue on GitHub.

---

**Built with ❤️ to empower India with legal knowledge.**
