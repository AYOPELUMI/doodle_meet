import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Link2,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayName } from "@/lib/auth/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type MeetingRow = {
  id: string;
  title: string | null;
  description: string | null;
  scheduled_for: string | null;
  room_mode: string | null;
  created_at: string | null;
};

function formatMeetingDate(dateValue?: string | null) {
  if (!dateValue) return "Instant";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: meetings } = await supabase
    .from("meetings")
    .select("id, title, description, scheduled_for, room_mode, created_at")
    .eq("created_by", user.id)
    .order("scheduled_for", { ascending: true, nullsFirst: false })
    .limit(12);

  const [{ data: integrations }, { data: latestRecording }, { data: latestTranscript }] = await Promise.all([
    supabase.from("calendar_connections").select("provider, status").eq("user_id", user.id),
    supabase
      .from("meeting_recordings")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("meeting_transcripts")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const list = (meetings ?? []) as MeetingRow[];
  const upcomingMeetings = list.slice(0, 6);
  const recentMeetings = [...list]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 4);
  const lastMeetingLink = list[0]
    ? `/meeting/${list[0].id}?title=${encodeURIComponent(list[0].title || "Quick meeting")}`
    : "/meeting/new";
  const displayName = getDisplayName(user, profile);
  const connectedCalendars = (integrations ?? []).filter((item) => item.status === "connected").length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.08),_transparent_26%),linear-gradient(180deg,_transparent,_rgba(148,163,184,0.05))] p-6 lg:p-8">
      <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/50 backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-teal-700">Workspace overview</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Launch a room instantly, keep chat attached to each call, and jump back into meetings without
              rebuilding context.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Upcoming rooms", value: String(upcomingMeetings.length || 0) },
                { label: "Calendars linked", value: String(connectedCalendars) },
                { label: "Auth mode", value: "Cookie SSR" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-2xl font-bold">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="group overflow-hidden rounded-[1.75rem] border-0 bg-[linear-gradient(135deg,_#0f172a,_#0f766e)] text-white shadow-xl shadow-teal-950/20">
          <Link href="/meeting/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">New Meeting</p>
                <p className="text-xs text-white/70">Start or schedule a room</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
          <Link href="/dashboard/schedule">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Schedule</p>
                <p className="text-xs text-muted-foreground">Plan future sessions</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
          <Link href={lastMeetingLink}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Open Last Room</p>
                <p className="text-xs text-muted-foreground">Continue where chat left off</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="rounded-[1.75rem] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
          <Link href="/meeting/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Join with Setup</p>
                <p className="text-xs text-muted-foreground">Preview mic and camera first</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
              Upcoming Meetings
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/meeting/new">
                Start a new one <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {upcomingMeetings.length ? (
                upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{meeting.title || "Untitled meeting"}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatMeetingDate(meeting.scheduled_for)}
                          <span className="text-slate-300">|</span>
                          <Users className="h-3 w-3" />
                          Stream room ready
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                        {meeting.room_mode || "video"}
                      </Badge>
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href={`/meeting/${meeting.id}?title=${encodeURIComponent(meeting.title || "Quick meeting")}`}>
                          Open room
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="text-sm font-medium">No meetings yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create your first room and it will appear here for quick re-entry.
                  </p>
                  <Button className="mt-4 rounded-full" asChild>
                    <Link href="/meeting/new">Create a meeting</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {recentMeetings.length ? (
                  recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Check className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{meeting.title || "Untitled meeting"}</p>
                        <p className="text-xs text-muted-foreground">{formatMeetingDate(meeting.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Your recent sessions will appear here.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-0 bg-[linear-gradient(160deg,_#082f49,_#164e63,_#0f766e)] text-white shadow-xl shadow-cyan-950/20">
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                Collaboration Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[
                { label: "Auth", value: "Supabase" },
                { label: "Calls", value: "Stream" },
                { label: "Chat", value: "Live" },
                { label: "UX", value: "Meet-style" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">{item.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                Capture Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Latest recording:{" "}
                {latestRecording?.created_at
                  ? new Date(latestRecording.created_at).toLocaleString()
                  : "No ingested recordings yet"}
              </p>
              <p>
                Latest transcript:{" "}
                {latestTranscript?.created_at
                  ? new Date(latestTranscript.created_at).toLocaleString()
                  : "No transcripts yet"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
