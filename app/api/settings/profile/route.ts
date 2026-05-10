import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/schemas/meeting-enhancements";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const input = parsed.data;
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      timezone: input.timezone,
      preferred_calendar_provider:
        input.preferredCalendarProvider === "none" ? null : input.preferredCalendarProvider,
      notify_meeting_reminders: input.notifyMeetingReminders,
      notify_chat_messages: input.notifyChatMessages,
      notify_recording_ready: input.notifyRecordingReady,
      notify_transcript_ready: input.notifyTranscriptReady,
      invite_one_click_join: input.inviteOneClickJoin,
      auto_sync_calendar: input.autoSyncCalendar,
      updated_at: now,
    })
    .eq("id", user.id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (input.preferredCalendarProvider !== "none") {
    await supabase.from("calendar_connections").upsert(
      {
        user_id: user.id,
        provider: input.preferredCalendarProvider,
        status: input.autoSyncCalendar ? "connected" : "available",
        scopes: ["calendar.events", "calendar.readonly"],
        updated_at: now,
      },
      { onConflict: "user_id,provider" },
    );
  }

  return NextResponse.json({ ok: true });
}
