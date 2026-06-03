// Shared types used across the application
// These replace the Drizzle schema now that we use Firestore

export interface Thread {
  id: string;
  title: string | null;
  createdAt: Date | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | null;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
