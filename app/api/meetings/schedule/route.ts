import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scheduleMeetingSchema } from "@/lib/schemas/meeting-enhancements";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = scheduleMeetingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid meeting payload." }, { status: 400 });
  }

  const input = parsed.data;
  const meetingId = nanoid(10).toLowerCase();
  const now = new Date().toISOString();

  const meetingPayload = {
    id: meetingId,
    created_by: user.id,
    title: input.title,
    description: input.description || null,
    room_mode: input.roomMode,
    status: "scheduled",
    scheduled_for: new Date(input.scheduledFor).toISOString(),
    created_at: now,
    updated_at: now,
    visibility: input.visibility,
    audience: input.audience,
    waiting_room_enabled: input.enableWaitingRoom,
    auto_record_enabled: input.enableRecording,
    auto_transcript_enabled: input.enableTranscription,
    duration_minutes: input.durationMinutes,
    calendar_provider: input.calendarProvider === "none" ? null : input.calendarProvider,
    co_hosts: input.coHosts,
  };

  const { error: meetingError } = await supabase.from("meetings").upsert(meetingPayload, {
    onConflict: "id",
  });

  if (meetingError) {
    return NextResponse.json({ error: meetingError.message }, { status: 500 });
  }

  const inviteRows = input.invitees.map((email) => ({
    meeting_id: meetingId,
    email,
    status: "queued",
    one_click_token: nanoid(24),
    created_at: now,
    updated_at: now,
  }));

  if (inviteRows.length) {
    await supabase.from("meeting_invites").upsert(inviteRows, {
      onConflict: "meeting_id,email",
    });

    await supabase.from("invite_email_jobs").insert(
      inviteRows.map((invite) => ({
        meeting_id: meetingId,
        email: invite.email,
        one_click_token: invite.one_click_token,
        status: "pending",
        provider: "supabase_queue",
        created_at: now,
      })),
    );
  }

  if (input.coHosts.length) {
    await supabase.from("meeting_events").insert(
      input.coHosts.map((email) => ({
        meeting_id: meetingId,
        actor_id: user.id,
        event_type: "co_host_invited",
        payload: { email },
        created_at: now,
      })),
    );
  }

  if (input.calendarProvider !== "none") {
    await supabase.from("calendar_sync_jobs").insert({
      user_id: user.id,
      meeting_id: meetingId,
      provider: input.calendarProvider,
      direction: "outbound",
      status: "pending",
      payload: {
        title: input.title,
        scheduled_for: input.scheduledFor,
        duration_minutes: input.durationMinutes,
      },
      created_at: now,
    });
  }

  return NextResponse.json({
    meetingId,
    redirectTo: `/meeting/${meetingId}?title=${encodeURIComponent(input.title)}&mode=${input.roomMode}`,
  });
}
