import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: integrations }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("calendar_connections")
      .select("provider, status, external_email, last_sync_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return <SettingsClient profile={profile} integrations={integrations ?? []} />;
}
