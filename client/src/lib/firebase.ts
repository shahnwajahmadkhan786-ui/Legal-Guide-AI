/**
 * firebase.ts – LOCAL AUTH SHIM
 *
 * Firebase is not configured (no env vars).  
 * This module re-exports a lightweight localStorage-based auth shim
 * so the rest of the app compiles and works without any cloud dependency.
 *
 * User objects are stored as JSON in localStorage under "legalai_auth_user".
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

type AuthObserver = (user: User | null) => void;

// ─── In-memory auth state ─────────────────────────────────────────────────────

const USER_KEY = "legalai_auth_user";
let _currentUser: User | null = null;
const _observers: Set<AuthObserver> = new Set();

function _loadFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function _persist(user: User | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

function _notify(user: User | null) {
  _observers.forEach((cb) => cb(user));
}

// ─── Fake Auth object ─────────────────────────────────────────────────────────

export const auth = {
  get currentUser() {
    return _currentUser;
  },
  onAuthStateChanged(observer: AuthObserver): () => void {
    _observers.add(observer);
    // Emit current state asynchronously (mimics Firebase behaviour)
    const stored = _loadFromStorage();
    _currentUser = stored;
    setTimeout(() => observer(_currentUser), 0);
    return () => _observers.delete(observer);
  },
};

export type Auth = typeof auth;

// ─── Fake Firestore / Functions (unused stubs) ────────────────────────────────
export const db: any = null;
export const functions: any = null;
export function getCallable(_name: string) {
  return async () => ({ data: null });
}

// ─── Password Hashing (C2 — never store plain text) ──────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "nyayasahay_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}


function _makeUser(uid: string, email: string, displayName?: string): User {
  return { uid, email, displayName: displayName || null, photoURL: null };
}

const ACCOUNTS_KEY = "legalai_accounts";

function _loadAccounts(): Record<string, { password: string; displayName: string }> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function _saveAccounts(accounts: Record<string, { password: string; displayName: string }>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function createUserWithEmailAndPassword(
  _auth: Auth,
  email: string,
  password: string
): Promise<{ user: User }> {
  const accounts = _loadAccounts();
  const key = email.toLowerCase();
  if (accounts[key]) {
    const err: any = new Error("email-already-in-use");
    err.code = "auth/email-already-in-use";
    throw err;
  }
  const uid = `uid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const hashedPassword = await hashPassword(password);
  accounts[key] = { password: hashedPassword, displayName: "" };
  _saveAccounts(accounts);

  const user = _makeUser(uid, email);
  _currentUser = user;
  _persist(user);
  _notify(user);
  return { user };
}

export async function signInWithEmailAndPassword(
  _auth: Auth,
  email: string,
  password: string
): Promise<{ user: User }> {
  const accounts = _loadAccounts();
  const key = email.toLowerCase();
  const account = accounts[key];
  if (!account) {
    const err: any = new Error("user-not-found");
    err.code = "auth/user-not-found";
    throw err;
  }
  const hashedPassword = await hashPassword(password);
  if (account.password !== hashedPassword) {
    const err: any = new Error("wrong-password");
    err.code = "auth/wrong-password";
    throw err;
  }
  const uid = `uid_${key.replace(/[^a-z0-9]/g, "_")}`;
  const user = _makeUser(uid, email, account.displayName);
  _currentUser = user;
  _persist(user);
  _notify(user);
  return { user };
}

export async function signOut(_auth: Auth): Promise<void> {
  _currentUser = null;
  _persist(null);
  _notify(null);
}

export async function updateProfile(user: User, profile: { displayName?: string }): Promise<void> {
  const accounts = _loadAccounts();
  const key = (user.email || "").toLowerCase();
  if (accounts[key] && profile.displayName) {
    accounts[key].displayName = profile.displayName;
    _saveAccounts(accounts);
    user.displayName = profile.displayName;
    _persist(user);
  }
}

// ─── Persistence stubs (no-ops) ───────────────────────────────────────────────
export const browserLocalPersistence = "LOCAL";

export async function setPersistence(_auth: Auth, _persistence: any): Promise<void> {
  // Already using localStorage — nothing to do.
}
