"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import {
  ArrowLeft,
  Calendar,
  Copy,
  Loader2,
  Lock,
  Mail,
  UserCheck,
  Video,
  Waves,
} from "lucide-react";
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
  const [audience, setAudience] = useState<"anyone" | "authenticated">("anyone");
  const [guestName, setGuestName] = useState("");
  const [coHosts, setCoHosts] = useState<string[]>([]);
  const [coHostInput, setCoHostInput] = useState("");
  const [scheduledFor, setScheduledFor] = useState(format(new Date(Date.now() + 1000 * 60 * 60), "yyyy-MM-dd'T'HH:mm"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetingId = useMemo(() => nanoid(10).toLowerCase(), []);
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/meeting/${meetingId}?title=${encodeURIComponent(title)}&mode=${roomMode}`
      : "";

  const addCoHost = () => {
    const email = coHostInput.trim().toLowerCase();
    if (!email || coHosts.includes(email)) return;
    setCoHosts((current) => [...current, email]);
    setCoHostInput("");
  };

  const navigateToMeeting = (target: string) => {
    router.push(target);
    window.location.href = target;
  };

  const handleCreateMeeting = async () => {
    setIsSubmitting(true);

    try {
      const hostName = user?.name || guestName || "Host";
      const meetingParams = new URLSearchParams({
        title,
        mode: roomMode,
        scheduleType,
        audience,
        hostName,
        coHosts: coHosts.join(","),
      });

      if (!user) {
        if (!guestName.trim()) {
          toast.error("Enter your name to create a guest-hosted meeting.");
          setIsSubmitting(false);
          return;
        }

        if (scheduleType === "scheduled") {
          meetingParams.set("scheduledFor", new Date(scheduledFor).toISOString());
        }

        navigateToMeeting(`/meeting/${meetingId}?${meetingParams.toString()}&guestHost=true`);
        return;
      }

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
        audience,
        co_hosts: coHosts,
      };

      const { data, error } = await supabase.from("meetings").upsert(payload, { onConflict: "id" });
      console.log({ error })

      if (error) {
        toast.error(`${error.message} The room link still works, so opening it directly now.`);
        throw new Error(error.message);
      }

      navigateToMeeting(`/meeting/${meetingId}?${meetingParams.toString()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-6 py-8 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {user ? "Back to dashboard" : "Back to home"}
          </Link>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Create room
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-2xl shadow-cyan-950/10 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-teal-600">Room setup</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight font-heading">
              Create a Meet-style room
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Authenticated hosts get dashboard persistence. Guest hosts can still create, share, and run a room instantly from the browser.
            </p>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label>Meeting title</Label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 rounded-2xl" />
              </div>

              {!user && (
                <div className="space-y-2">
                  <Label>Host display name</Label>
                  <Input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Enter your name to host as guest"
                    className="h-12 rounded-2xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Agenda or context</Label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 rounded-2xl" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setRoomMode("video")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "video" ? "border-teal-400 bg-secondary" : "border-border hover:border-teal-300"}`}
                >
                  <Video className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Video meeting</p>
                  <p className="mt-1 text-sm text-muted-foreground">Camera-first room with screen sharing.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomMode("audio")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "audio" ? "border-cyan-400 bg-secondary" : "border-border hover:border-cyan-300"}`}
                >
                  <Waves className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Audio room</p>
                  <p className="mt-1 text-sm text-muted-foreground">Quick syncs with lighter bandwidth.</p>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("instant")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${scheduleType === "instant" ? "border-cyan-400/70 bg-secondary shadow-2xs" : "border-border hover:border-cyan-300"}`}
                >
                  <p className="font-semibold">Start instantly</p>
                  <p className="mt-1 text-sm text-muted-foreground">Open the room right away.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType("scheduled")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${scheduleType === "scheduled" ? "border-cyan-400/70 bg-secondary shadow-2xs" : "border-border hover:border-cyan-300"}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="font-semibold">Schedule for later</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Share before the room starts.</p>
                </button>
              </div>

              {scheduleType === "scheduled" && (
                <div className="space-y-2">
                  <Label>Scheduled time</Label>
                  <Input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAudience("anyone")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${audience === "anyone" ? "border-teal-400 bg-secondary" : "border-border hover:border-teal-300"}`}
                >
                  <UserCheck className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Anyone with link</p>
                  <p className="mt-1 text-sm text-muted-foreground">Authenticated and guest invitees can join.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAudience("authenticated")}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${audience === "authenticated" ? "border-cyan-400 bg-secondary" : "border-border hover:border-cyan-300"}`}
                >
                  <Lock className="h-5 w-5" />
                  <p className="mt-3 font-semibold">Authenticated only</p>
                  <p className="mt-1 text-sm text-muted-foreground">Invitees must sign in before joining.</p>
                </button>
              </div>

              <div className="space-y-3">
                <Label>Co-hosts</Label>
                <div className="flex gap-2">
                  <Input
                    value={coHostInput}
                    onChange={(event) => setCoHostInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCoHost();
                      }
                    }}
                    placeholder="Add co-host email"
                    className="h-12 rounded-2xl"
                  />
                  <Button type="button" onClick={addCoHost} className="rounded-2xl">
                    Add
                  </Button>
                </div>
                {coHosts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {coHosts.map((email) => (
                      <div key={email} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-sm">
                        <Mail className="h-3.5 w-3.5" />
                        {email}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-2xl shadow-slate-950/10 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-600">Invite preview</p>
            <h2 className="mt-3 text-2xl font-bold font-heading">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-border bg-secondary p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Room ID</p>
                <p className="mt-2 font-semibold">{meetingId}</p>
              </div>
              <div className="rounded-3xl border border-border bg-secondary p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Invite link</p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="truncate text-sm">{inviteLink}</code>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full"
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

            <div className="mt-8 rounded-[1.5rem] border border-border bg-secondary p-5">
              <p className="text-sm font-medium">Host controls included</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Switch between open or scheduled meeting behavior</li>
                <li>Share by link now, and by email when authenticated scheduling is used</li>
                <li>Allow either anyone or authenticated-only attendees</li>
                <li>Add co-host emails for shared meeting ownership</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button className="h-12 rounded-2xl text-base" onClick={handleCreateMeeting} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : user ? "Create and open room" : "Create guest room"}
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl"
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
