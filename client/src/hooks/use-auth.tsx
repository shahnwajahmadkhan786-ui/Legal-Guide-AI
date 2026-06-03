import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as localSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  type User as LocalUser,
} from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function localUserToAuthUser(u: LocalUser): AuthUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

/**
 * AuthProvider – wraps the entire app so all components share one auth state.
 * Uses the local-storage auth shim (no Firebase required).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // setPersistence is a no-op in the shim; we call it for API compatibility.
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = auth.onAuthStateChanged((localUser) => {
          setUser(localUser ? localUserToAuthUser(localUser) : null);
          setIsLoading(false);
        });
        return unsubscribe;
      })
      .catch(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName?: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(newUser, { displayName });
      setUser(localUserToAuthUser({ ...newUser, displayName }));
    }
  }, []);

  const logout = useCallback(async () => {
    await localSignOut(auth);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth state – must be used inside <AuthProvider> */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
