import { redirect } from "next/navigation";
import { RecordingsClient } from "@/components/dashboard/recordings-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function RecordingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: recordings }, { data: transcripts }] = await Promise.all([
    supabase
      .from("meeting_recordings")
      .select("id, meeting_id, stream_call_cid, url, duration_seconds, started_at, ended_at, created_at, transcript_status, meeting:meetings(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("meeting_transcripts")
      .select("id, meeting_id, content, summary, language, status, created_at, meeting:meetings(title)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <RecordingsClient
      recordings={(recordings ?? []) as never[]}
      transcripts={(transcripts ?? []) as never[]}
    />
  );
}
