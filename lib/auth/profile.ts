import type { User } from "@supabase/supabase-js";
import type { CookieUser } from "@/lib/auth/cookies";

type ProfileRecord = {
  full_name?: string | null;
  avatar_url?: string | null;
} | null;

export function getDisplayName(user: User, profile?: ProfileRecord) {
  return (
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Teammate"
  );
}

export function toCookieUser(user: User, profile?: ProfileRecord): CookieUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: getDisplayName(user, profile),
    avatar:
      profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };
}
