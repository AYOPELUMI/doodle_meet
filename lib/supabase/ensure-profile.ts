

import type { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";

export async function ensureProfile(user: User) {
  try {

    const supabase = createSupabaseClient();
    console.log("i got here", { user })
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Teammate",
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  } catch (error) {
    console.log({ error })
  }
}
