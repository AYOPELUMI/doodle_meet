import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateMeetingSchema } from "@/lib/schemas/meeting-enhancements";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateMeetingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid meeting update payload." }, { status: 400 });
  }

  const input = parsed.data;
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof input.title !== "undefined") updatePayload.title = input.title;
  if (typeof input.description !== "undefined") updatePayload.description = input.description;
  if (typeof input.audience !== "undefined") updatePayload.audience = input.audience;
  if (typeof input.coHosts !== "undefined") updatePayload.co_hosts = input.coHosts;

  if (typeof input.status !== "undefined") {
    updatePayload.status = input.status;
  }

  if (typeof input.hostMode !== "undefined") {
    updatePayload.status = input.hostMode === "scheduled" ? "scheduled" : input.status ?? "live";
  }

  if (typeof input.scheduledFor !== "undefined") {
    updatePayload.scheduled_for = input.scheduledFor ? new Date(input.scheduledFor).toISOString() : null;
  }

  const { data, error } = await supabase
    .from("meetings")
    .update(updatePayload)
    .eq("id", id)
    .eq("created_by", user.id)
    .select("id, title, description, room_mode, audience, co_hosts, status, scheduled_for")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Meeting not found." }, { status: 404 });
  }

  return NextResponse.json({ meeting: data });
}
