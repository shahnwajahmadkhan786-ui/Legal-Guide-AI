import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase, trackEvent } from "@/lib/supabase-client";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// ── Public user shape (used throughout the app) ──────────────────────────────

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone: string | null;
}

function mapUser(su: SupabaseUser | null): AppUser | null {
  if (!su) return null;
  return {
    uid: su.id,
    email: su.email || null,
    displayName:
      su.user_metadata?.full_name ||
      su.user_metadata?.name ||
      su.email?.split("@")[0] ||
      su.phone ||
      null,
    photoURL: su.user_metadata?.avatar_url || null,
    phone: su.phone || null,
  };
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
      if (session?.user) {
        trackEvent("session_start", {
          auth_method: session.user.app_metadata?.provider || "email",
        });
      }
    });

    // 2. Listen for auth state changes (login, logout, token refresh, OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        const newUser = mapUser(session?.user ?? null);
        setUser(newUser);
        setIsLoading(false);

        if (event === "SIGNED_IN" && newUser) {
          trackEvent("login", {
            auth_method: session?.user?.app_metadata?.provider || "email",
            email: newUser.email,
          });
        }
        if (event === "SIGNED_OUT") {
          trackEvent("logout");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
