# NyayaSahay - System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet Users (India)                    │
│                  (Web, Mobile, Tablets)                      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Firebase Hosting (asia-south1)                  │
│                   (React App - Dist)                         │
│                                                              │
│  - Fast global CDN                                          │
│  - Automatic SSL/TLS                                        │
│  - Auto-scaling                                             │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Firebase Auth    │  │  Cloud Functions │
        │ (Secure Sessions)│  │  (Backend Logic) │
        └──────────────────┘  └────────┬─────────┘
                                       │
                              ┌────────┼────────┐
                              ▼                 ▼
                     ┌──────────────────┐  ┌──────────────┐
                     │ Firestore        │  │  Secret Mgr  │
                     │ (Data Persistence)  │  (API Keys)   │
                     └──────────────────┘  └──────────────┘
                                                 │
                                                 ▼
                                       ┌──────────────────┐
                                       │  NVIDIA API      │
                                       │  (LLM inference) │
                                       └──────────────────┘
```

## Components

### 1. Frontend (React + Vite)
**Location:** `client/src/`

- **Framework:** React 18 with TypeScript
- **UI Library:** Radix UI + Tailwind CSS
- **Routing:** Wouter (lightweight)
- **State Management:** React Hooks + Context API

**Key Files:**
- `App.tsx` - Main app shell with routing
- `hooks/use-auth.tsx` - Firebase Authentication
- `hooks/use-legal-chat.ts` - Firestore realtime chat
- `hooks/use-gemini.ts` - Cloud Function calls
- `components/` - Reusable UI components

### 2. Cloud Functions (Node.js + Firebase)
**Location:** `functions/src/index.ts`

**Deployed Functions:**
1. `sendMessage()` - Process user query + call NVIDIA + save to Firestore
2. `generateThreadTitle()` - Generate conversation title
3. `createThread()` - Create new consultation thread
4. `deleteThread()` - Delete thread with all messages
5. `getThreads()` - Fetch user's threads

**Features:**
- ✅ Rate limiting (20 req/min per user)
- ✅ Authentication required
- ✅ Firestore write operations
- ✅ API key stored in Secret Manager
- ✅ Error handling with proper logging

### 3. Database (Firestore)
**Location:** `firestore.rules`

**Schema:**
```
threads/
  ├── {threadId}/
  │   ├── userId: string (user who owns this thread)
  │   ├── title: string
  │   ├── createdAt: timestamp
  │   ├── lastMessageAt: timestamp
  │   ├── messageCount: number
  │   └── messages/ (subcollection)
  │       ├── {messageId}/
  │       │   ├── role: "user" | "assistant"
  │       │   ├── content: string
  │       │   ├── createdAt: timestamp
  │       │   └── userId: string
```

**Security Rules:**
- Users can only read/write their own threads
- Firestore enforces authentication on all operations
- No public read access

### 4. Authentication (Firebase Auth)
- Email/Password authentication
- Session persistence using browser local storage (secure)
- No third-party OAuth (privacy-first)
- Optional: Can add Aadhar/SMS OTP later

### 5. External APIs
- **NVIDIA API** - LLM inference for legal guidance
- Key stored in Firebase Secret Manager
- Called server-side only (not exposed to frontend)

---

## Security Architecture

### Data Flow Security

```
User Input
    ↓
[Frontend - HTTPS]
    ↓
Firebase Auth Check
    ↓
Cloud Function (Auth Required)
    ↓
Rate Limit Check
    ↓
Firestore Security Rules Check
    ↓
Call NVIDIA (with secured API key)
    ↓
Store in Firestore (user's thread only)
    ↓
Return to Frontend via HTTPS
```

### Secrets Management

```
NVIDIA_API_KEY
    ↓
Firebase Secret Manager
    ↓
Cloud Functions load at runtime
    ↓
NEVER exposed to frontend
    ↓
NEVER logged or cached
```

### Firestore Access Control

```
User A → Can access threads owned by User A only
User B → Can access threads owned by User B only
Admin → (Can be added later with custom claims)
Anonymous → Access denied
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend (npm run dev)
├── Functions (firebase emulators:start)
├── Firestore (local emulator)
└── Env: .env.local
```

### Production Environment
```
Firebase Project (asia-south1)
├── Cloud Functions v2 (auto-scaling)
├── Firestore (multi-region replicas)
├── Authentication (managed)
├── Hosting (CDN globally)
└── Secret Manager (encrypted keys)
```

---

## API Endpoints

### Cloud Functions (HTTPS Callables)

All functions require Firebase authentication token.

**sendMessage**
```typescript
Request: {
  userMessage: string,
  history: ChatMessage[],
  threadId: string
}
Response: {
  success: boolean,
  assistantMessage: string
}
```

**generateThreadTitle**
```typescript
Request: {
  content: string,
  threadId: string
}
Response: {
  title: string
}
```

**createThread**
```typescript
Request: {}
Response: {
  threadId: string
}
```

---

## Performance Metrics

### Target Metrics
- ⚡ Page load: < 3s (first load), < 500ms (cached)
- ⚡ Message send-to-response: 3-5 seconds
- ⚡ 99.9% uptime
- ⚡ <100ms latency from India

### Optimization Techniques
1. React code splitting (Vite)
2. Firestore realtime subscriptions (no polling)
3. CDN via Firebase Hosting
4. India region for Firestore (asia-south1)
5. LRU cache for law knowledge base
6. Function warming via scheduled tasks (optional)

---

## Scalability

### Current Architecture Supports
- ✅ Up to 100,000 concurrent users (Firestore limits)
- ✅ 1M+ messages per day
- ✅ Unlimited threads per user
- ✅ Geographic distribution (CDN)

### Scaling Beyond
1. **Firestore sharding** for higher write rate
2. **Read replicas** in multiple regions
3. **Cache layer** (Redis) for frequently asked questions
4. **Multi-region functions** for lower latency
5. **Queue system** for background processing

---

## Cost Optimization

### Current Cost: ~$0/month (free tier)
- Hosting: 10GB storage free
- Firestore: 50k reads, 20k writes free
- Functions: 2M invocations free
- Auth: 50k users free

### At 1,000 Users (est. $10-15/month)
- NVIDIA API: Primary cost (~$8-12)
- Firestore: $1-2
- Functions: $0-1
- Hosting: Free

### Cost Reduction Strategies
1. Cache popular answers (reduce API calls by 40%)
2. Use NVIDIA free tier (up to 1000 calls/month)
3. Batch process overnight queries
4. Implement local search for FAQ

---

## Monitoring & Maintenance

### Alerting
- Firestore quota exceeded
- Cloud Functions error rate > 5%
- Cold start time > 10s
- API rate limiting triggered

### Logs
```bash
firebase functions:log              # Recent logs
firebase open firestore             # Firestore usage
firebase open hosting:analytics     # User analytics
```

### Backups
- Firestore: Automatic snapshots (daily)
- Manual export: `firebase firestore:export gs://bucket/backups/2024-01-01`

---

## Future Enhancements

🔮 **Phase 2 (Later):**
- Aadhar/SMS OTP authentication
- Multi-language support (Tamil, Telugu, Marathi, etc.)
- Audio input for illiterate users
- PDF report generation
- Connect with real lawyers
- Offline support (PWA)
- WhatsApp bot integration
- SMS gateway for low-data users

---

## Support & Documentation

- **Setup:** See `SETUP_GUIDE.md`
- **Deployment:** See `DEPLOY.md`
- **Code:** See inline comments and JSDoc
- **Issues:** Open GitHub issues

---

**Architecture designed for scale, security, and social impact. 🚀**
