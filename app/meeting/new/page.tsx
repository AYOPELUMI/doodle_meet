"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { ArrowLeft, Calendar, Copy, Loader2, Video, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";

export default function NewMeetingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const supabase = createSupabaseClient();
  const [title, setTitle] = useState("Weekly sync");
  const [description, setDescription] = useState("Quick alignment on priorities, blockers, and next steps.");
  const [roomMode, setRoomMode] = useState<"video" | "audio">("video");
  const [scheduleType, setScheduleType] = useState<"instant" | "scheduled">("instant");
  const [scheduledFor, setScheduledFor] = useState(format(new Date(Date.now() + 1000 * 60 * 60), "yyyy-MM-dd'T'HH:mm"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetingId = useMemo(() => nanoid(10).toLowerCase(), []);
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/meeting/${meetingId}?title=${encodeURIComponent(title)}&mode=${roomMode}`
      : "";
  const handleCreateMeeting = async () => {

    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        id: meetingId,
        title,
        description,
        room_mode: roomMode,
        status: scheduleType === "instant" ? "live" : "scheduled",
        scheduled_for: scheduleType === "scheduled" ? new Date(scheduledFor).toISOString() : null,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("meetings").upsert(payload, { onConflict: "id" });

      if (error) {
        toast.error(`${error.message} The room link still works for frontend testing.`);
      }

      router.push(`/meeting/${meetingId}?title=${encodeURIComponent(title)}&mode=${roomMode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className=" px-6 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
            Create room
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-teal-600">Room setup</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight font-heading">
              Create a Meet-style room
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Set the room name, choose whether this is a video or audio-first session,
              and generate the invite link you&apos;ll share with the group.
            </p>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label className="">Meeting title</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35" />
              </div>

              <div className="space-y-2">
                <Label className="">Agenda or context</Label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRoomMode("video")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "video" ? "border-teal-400 bg-card" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                >
                  <Video className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Video meeting</p>
                  <p className="mt-1 text-sm text-muted-foreground">Camera-first room with chat and screen sharing.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomMode("audio")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "audio" ? "border-cyan-400 bg-card" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                >
                  <Waves className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Audio room</p>
                  <p className="mt-1 text-sm text-muted-foreground">Quick standups or low-bandwidth calls without video.</p>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("instant")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${scheduleType === "instant" ? "border-cyan-400/70 bg-white/10 shadow-2xs" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                >
                  <p className="font-semibold">Start instantly</p>
                  <p className="mt-1 text-sm text-muted-foreground">Use the room right away.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType("scheduled")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${scheduleType === "scheduled" ? "border-cyan-400/70 bg-white/10 shadow-2xs" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="font-semibold">Schedule for later</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Keep it on the dashboard first.</p>
                </button>
              </div>

              {scheduleType === "scheduled" && (
                <div className="space-y-2">
                  <Label className="">Scheduled time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="h-12 rounded-2xl border-white/10 "
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">Invite preview</p>
            <h2 className="mt-3 text-2xl font-bold font-heading">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] ">Room ID</p>
                <p className="mt-2 font-semibold">{meetingId}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Invite link</p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="truncate text-sm text">{inviteLink}</code>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success("Invite link copied.");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-card">
              <p className="text-sm font-medium">What you get</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Stream-powered video, audio, and screen sharing</li>
                <li>Linked in-call chat using the same room ID</li>
                <li>Supabase-backed meeting records for dashboard recall</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button className="h-12 rounded-2xl text-base" onClick={handleCreateMeeting} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create and open room"}
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  toast.success("Invite link copied.");
                }}
              >
                Copy invite first
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
