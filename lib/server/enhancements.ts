import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, profile };
}

export async function getMeetingEnhancements(meetingId?: string) {
  const { supabase, user } = await getAuthenticatedProfile();
  if (!user) return null;

  const [integrations, invites, recordings, transcripts] = await Promise.all([
    supabase
      .from("calendar_connections")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    meetingId
      ? supabase.from("meeting_invites").select("*").eq("meeting_id", meetingId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    meetingId
      ? supabase.from("meeting_recordings").select("*").eq("meeting_id", meetingId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    meetingId
      ? supabase.from("meeting_transcripts").select("*").eq("meeting_id", meetingId).order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  return {
    integrations: integrations.data ?? [],
    invites: invites.data ?? [],
    recordings: recordings.data ?? [],
    transcripts: transcripts.data ?? [],
  };
}
