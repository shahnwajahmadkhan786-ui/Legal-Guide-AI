# NyayaSahay - Legal Rights Platform for Indians

A free AI-powered legal assistant helping Indians understand their constitutional rights and legal options when facing injustice, police harassment, landlord disputes, employment issues, and other common problems.

## Mission

Empower ordinary Indians with accurate, crisp legal information at their moment of crisis. Most Indians don't know their rights — this platform is their first point of contact.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase account (free tier)
- NVIDIA API key (free tier available)

### Local Development

```bash
# 1. Clone and setup
git clone <your-repo>
cd Legal-Guide-AI

# 2. Install dependencies
npm install
cd functions && npm install && cd ..

# 3. Create environment file
cp .env.example .env.local

# 4. Add your Firebase config to .env.local
# See Firebase Console → Project Settings → Web App

# 5. Add NVIDIA API key to .env.local
# Get from: https://build.nvidia.com/nvidia/nvidia-nemotron-4-340b-instruct

# 6. Start local Firebase emulator (optional)
firebase emulators:start

# 7. Run development server
npm run dev
```

Visit http://localhost:5173

---

## 📋 Full Setup Instructions

### Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project" → Name it "legal-ai-india" (or your preferred name)
3. Accept defaults, click "Create project"

### Step 2: Enable Firebase Services

**Authentication:**
- Go to Build → Authentication
- Click "Get Started"
- Enable "Email/Password" provider
- ✅ Done

**Firestore Database:**
- Go to Build → Firestore Database
- Click "Create database"
- Choose region: **asia-south1** (Mumbai - closest to India)
- Start in "Test mode" (we'll set security rules)
- Click "Create"

**Cloud Functions:**
- Go to Build → Functions
- Click "Get Started" (may take 2-3 minutes)
- ✅ Done

### Step 3: Get Firebase Credentials

1. Go to Project Settings (gear icon, top left)
2. Click "Your apps" → Web app (</> icon)
3. Copy the config object:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

4. Add these to your `.env.local`:

```env
VITE_FIREBASE_API_KEY=<your_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<your_auth_domain>
VITE_FIREBASE_PROJECT_ID=<your_project_id>
VITE_FIREBASE_STORAGE_BUCKET=<your_storage_bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your_sender_id>
VITE_FIREBASE_APP_ID=<your_app_id>
```

### Step 4: Get NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up (free)
3. Go to "Nemotron" → "Nemotron 4 340B Instruct"
4. Click "Get API Key"
5. Copy the API key
6. Add to `.env.local`:

```env
NVIDIA_API_KEY=<your_nvidia_key>
```

### Step 5: Deploy to Firebase

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase in project
firebase init

# 4. Deploy everything
npm run build
firebase deploy

# Monitor deployment:
firebase deploy --debug
```

---

## 🔒 Security Features

✅ **API Key Protection:** NVIDIA key stored in Firebase Secret Manager, NOT exposed to frontend

✅ **Authentication:** Real Firebase Auth with secure session management

✅ **Database Security:** Firestore rules ensure users can only access their own conversations

✅ **Rate Limiting:** Built-in protection against API abuse (20 requests/min per user)

✅ **Encryption:** All data transmitted over HTTPS

---

## 📊 Cost Breakdown (Monthly)

| Service | Free Tier | Cost at Scale |
|---------|-----------|---------------|
| **Firebase Hosting** | 10GB storage | ~$0.15/GB |
| **Firestore Reads** | 50k/day | $0.06 per 100k |
| **Firestore Writes** | 20k/day | $0.18 per 100k |
| **Cloud Functions** | 2M invocations | $0.40 per 1M |
| **NVIDIA API** | Pay-as-you-go | ~$0.02 per 1M tokens |

**Expected cost for 1000 users:** $5-15/month (mostly NVIDIA)
**For 10,000 users:** $50-150/month

---

## 🎯 Production Checklist

Before launching publicly:

- [ ] Set Firestore to production mode (not test mode)
- [ ] Add custom domain (optional)
- [ ] Enable monitoring alerts
- [ ] Test end-to-end with real users
- [ ] Set up analytics
- [ ] Configure Firestore backups
- [ ] Create admin dashboard (optional)

### Set Firestore to Production Mode

1. Firestore → Settings
2. Change "Rules" tab
3. Update the security rules to production (provided in `firestore.rules`)
4. Deploy:

```bash
firebase deploy --only firestore:rules
```

---

## 🐛 Troubleshooting

### "Firebase config not found"
→ Check `.env.local` has correct `VITE_FIREBASE_*` variables

### "API key missing"
→ Add `NVIDIA_API_KEY` to `functions/.env.local` (for local testing)

### "Can't send message"
→ Check Cloud Functions deployed: `firebase functions:list`

### "Messages not saving"
→ Check Firestore rules: `firebase deploy --only firestore:rules`

---

## 📱 Using the App

1. **Sign up** with email/password
2. **Ask a legal question** - describe your situation in Hindi or English
3. **Get actionable guidance** - with specific laws, sections, and next steps
4. **Take action** - armed with knowledge of your rights

Examples:
- "Police mujhe bina reason detain kar rahe hain"
- "Landlord ne 3 mahine salary nahi di"
- "Neighbor ne meri property par kabza kar liya"

---

## 🤝 Contributing

This is an open-source project for social good. Contributions welcome:

1. Report bugs via GitHub Issues
2. Submit PRs for improvements
3. Help us add more legal knowledge base
4. Translate to more Indian languages

---

## 📖 Legal Knowledge Base

The platform currently covers:
- 🚔 Police encounters & arrest rights
- 🏠 Tenant-landlord disputes
- 💼 Employment & wages
- 👩 Women's safety & harassment
- 🏥 Consumer rights
- 📋 Constitution of India basics

More topics coming!

---

## ⚖️ Disclaimer

**This is NOT legal advice.** NyayaSahay provides general legal information only. For specific cases, always consult a qualified lawyer. Free legal aid is available from:

- **NALSA**: 1800-180-1111
- **Local DLSA**: Call your district court

---

## 📞 Support

- Report issues: [GitHub Issues](your-repo/issues)
- Email: contact@nyayasahay.org (when set up)
- Twitter: [@NyayaSahay](your-twitter-when-set-up)

---

## 📄 License

MIT License - Free for everyone, forever.

Built with ❤️ for India.
