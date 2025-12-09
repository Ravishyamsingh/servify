import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = (() => {
  const envBase = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envBase) return envBase;

  // Local dev: point to Vercel dev default port so /api routes exist.
  if (import.meta.env.DEV) return "http://localhost:3000";

  // Prod: same-origin serverless functions.
  return "";
})();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: "admin" | "vendor" | "customer" | null;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"admin" | "vendor" | "customer" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole("customer"); // Default to customer
        return;
      }

      setUserRole(data?.role as "admin" | "vendor" | "customer" || "customer");
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setUserRole("customer");
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = "customer") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        // If the user already exists, attempt a direct sign-in to avoid blocking signup flow.
        if (error.message?.toLowerCase().includes("already registered")) {
          const { error: signInExisting } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInExisting) {
            toast({
              title: "Welcome back!",
              description: "Signed you in to your existing account.",
            });
            return { error: null };
          }
        }

        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Mark user confirmed on backend (best-effort); do not block signup if this fails
      try {
        const res = await fetch(`${API_BASE_URL}/api/confirm-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to confirm user");
        }
      } catch (confirmErr) {
        console.warn("Auto-confirm user failed (continuing):", confirmErr);
        // We continue without showing a blocking toast to avoid breaking signup if the API is unreachable.
      }

      // Directly sign in after confirmation
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        toast({
          title: "Sign in failed",
          description: signInError.message,
          variant: "destructive",
        });
        return { error: signInError };
      }

      toast({
        title: "Account created!",
        description: "You are now signed in.",
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        userRole,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
