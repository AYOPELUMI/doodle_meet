"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { createSupabaseClient } from "@/lib/supabase/client";
import { clearCookieUser, type CookieUser, writeCookieUser } from "@/lib/auth/cookies";
import { toCookieUser } from "@/lib/auth/profile";
import { useAuthStore } from "@/lib/store/auth-store";

type AppProvidersProps = {
  children: React.ReactNode;
  initialUser: CookieUser | null;
};

export function AppProviders({ children, initialUser }: AppProvidersProps) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser, setUser]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        clearCookieUser();
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .maybeSingle();

      const cookieUser = toCookieUser(session.user, profile);
      writeCookieUser(cookieUser);
      setUser(cookieUser);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}
