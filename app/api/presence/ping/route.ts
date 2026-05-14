import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { meetingId } = (await request?.json()) as { meetingId?: string };
  const now = new Date().toISOString();

  await supabase
    .from("profiles")
    .update({ last_seen_at: now, presence_status: "online" })
    .eq("id", user.id);

  if (meetingId) {
    await supabase.from("meeting_members").upsert(
      {
        meeting_id: meetingId,
        user_id: user.id,
        role: "participant",
        joined_at: now,
        last_seen_at: now,
      },
      { onConflict: "meeting_id,user_id" },
    );
  }

  return NextResponse.json({ ok: true, timestamp: now });
}
