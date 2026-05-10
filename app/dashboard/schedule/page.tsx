import { redirect } from "next/navigation";
import { ScheduleClient } from "@/components/dashboard/schedule-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SchedulePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: meetings }, { data: integrations }] = await Promise.all([
    supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    supabase
      .from("meetings")
      .select("id, title, description, scheduled_for, room_mode, visibility, auto_record_enabled, auto_transcript_enabled, meeting_invites(email, status)")
      .eq("created_by", user.id)
      .order("scheduled_for", { ascending: true, nullsFirst: false }),
    supabase.from("calendar_connections").select("provider, status").eq("user_id", user.id),
  ]);

  return (
    <ScheduleClient
      meetings={(meetings ?? []) as never[]}
      defaultTimezone={profile?.timezone ?? "Africa/Lagos"}
      integrations={integrations ?? []}
    />
  );
}
