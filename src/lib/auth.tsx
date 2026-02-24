import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionChange = async (nextSession: Session | null, setLoadingState = false) => {
      if (setLoadingState) setLoading(true);
      if (!nextSession) {
        setSession(null);
        setUser(null);
        if (setLoadingState) setLoading(false);
        return;
      }

      // Validate that the user still exists on Supabase (handles deleted users)
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } else {
        setSession(nextSession);
        setUser(data.user);
      }
      if (setLoadingState) setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // For token refreshes and normal auth changes, don't show the full-page loader
      void handleSessionChange(session, false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      // Initial load: show loader until we know the real state
      void handleSessionChange(session, true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
