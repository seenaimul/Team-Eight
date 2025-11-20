import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: any;

    const init = async () => {
      // Load session once
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }

      // Subscribe once
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });

      subscription = data.subscription;
    };

    init();

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
