"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addMinutes, format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  Copy,
  Globe,
  Lock,
  Mail,
  Mic,
  Plus,
  Trash2,
  Users,
  Video,
  Waves,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScheduleMeetingInput } from "@/lib/schemas/meeting-enhancements";

type ScheduleMeetingRow = {
  id: string;
  title: string | null;
  description: string | null;
  scheduled_for: string | null;
  room_mode: string | null;
  visibility?: string | null;
  auto_record_enabled?: boolean | null;
  auto_transcript_enabled?: boolean | null;
  meeting_invites?: { email: string; status?: string | null }[];
};

const durationOptions = [15, 30, 45, 60, 90, 120];
const timezoneOptions = [
  "Africa/Lagos",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Tokyo",
];

function formatMeetingDate(value?: string | null) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ScheduleClient({
  meetings,
  defaultTimezone,
  integrations,
}: {
  meetings: ScheduleMeetingRow[];
  defaultTimezone: string;
  integrations: { provider: string; status?: string | null }[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState("Cross-functional planning");
  const [description, setDescription] = useState("Align on launches, blockers, and owner handoffs.");
  const [roomMode, setRoomMode] = useState<"video" | "audio">("video");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true);
  const [enableRecording, setEnableRecording] = useState(true);
  const [enableTranscription, setEnableTranscription] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState("45");
  const [calendarProvider, setCalendarProvider] = useState<"none" | "google" | "outlook">("none");
  const [timezone, setTimezone] = useState(defaultTimezone || "Africa/Lagos");
  const [newInvitee, setNewInvitee] = useState("");
  const [invitees, setInvitees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scheduledForValue = useMemo(() => {
    const base = selectedDate ?? new Date();
    return addMinutes(base, 60);
  }, [selectedDate]);

  const connectedProviders = useMemo(
    () => new Set(integrations.filter((item) => item.status === "connected").map((item) => item.provider)),
    [integrations],
  );

  const addInvitee = () => {
    const email = newInvitee.trim().toLowerCase();
    if (!email) return;
    if (invitees.includes(email)) return;
    invitees.length < 25 && setInvitees((current) => [...current, email]);
    setNewInvitee("");
  };

  const removeInvitee = (email: string) => {
    setInvitees((current) => current.filter((item) => item !== email));
  };

  const handleScheduleMeeting = async () => {
    setIsSubmitting(true);

    const payload: ScheduleMeetingInput = {
      title,
      description,
      roomMode,
      visibility,
      durationMinutes: Number(durationMinutes),
      enableWaitingRoom,
      enableRecording,
      enableTranscription,
      invitees,
      calendarProvider,
      scheduledFor: scheduledForValue.toISOString(),
    };

    try {
      const response = await fetch("/api/meetings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to schedule meeting.");
      }

      toast.success("Meeting scheduled.");
      router.push(data.redirectTo);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to schedule meeting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyMeetingLink = async (meetingId: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    setCopiedId(meetingId);
    toast.success("Meeting link copied.");
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40">
        <p className="text-sm uppercase tracking-[0.25em] text-teal-700">Calendar + invites</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl">
          Schedule smarter meetings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Turn every planned call into a synced calendar event, queued invite email, and ready-to-record room with optional transcript capture.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6 rounded-2xl">
          <TabsTrigger value="create">Create Meeting</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({meetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
              <CardHeader>
                <CardTitle className="font-[family-name:var(--font-heading)]">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Meeting title</Label>
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-28 rounded-2xl" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setRoomMode("video")}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "video" ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white hover:border-teal-200"}`}
                  >
                    <Video className="h-5 w-5 text-teal-700" />
                    <p className="mt-3 font-semibold">Video room</p>
                    <p className="mt-1 text-sm text-muted-foreground">For screenshare, face time, and transcripts.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoomMode("audio")}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${roomMode === "audio" ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white hover:border-cyan-200"}`}
                  >
                    <Waves className="h-5 w-5 text-cyan-700" />
                    <p className="mt-3 font-semibold">Audio room</p>
                    <p className="mt-1 text-sm text-muted-foreground">Lightweight syncs with transcript-friendly capture.</p>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value} minutes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calendar sync</Label>
                    <Select value={calendarProvider} onValueChange={(value) => setCalendarProvider(value as "none" | "google" | "outlook")}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No calendar push</SelectItem>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Outlook Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezoneOptions.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setVisibility("public")}
                    className={`flex items-start gap-3 rounded-[1.5rem] border p-4 text-left transition ${visibility === "public" ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-200"}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Public link</p>
                      <p className="text-sm text-muted-foreground">Anyone with the link can join.</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility("private")}
                    className={`flex items-start gap-3 rounded-[1.5rem] border p-4 text-left transition ${visibility === "private" ? "border-cyan-400 bg-cyan-50" : "border-slate-200 hover:border-cyan-200"}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Invite only</p>
                      <p className="text-sm text-muted-foreground">Great for one-click join emails.</p>
                    </div>
                  </button>
                </div>

                <div className="space-y-3">
                  <Label>Invite people</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newInvitee}
                      onChange={(event) => setNewInvitee(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addInvitee();
                        }
                      }}
                      placeholder="name@company.com"
                      className="h-11 rounded-xl"
                    />
                    <Button type="button" className="h-11 rounded-xl" onClick={addInvitee}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                  {invitees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {invitees.map((email) => (
                        <Badge key={email} variant="secondary" className="rounded-full gap-2 px-3 py-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {email}
                          <button type="button" onClick={() => removeInvitee(email)} aria-label={`Remove ${email}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  {[
                    {
                      label: "Waiting room",
                      description: "Approve late joiners before they enter the call.",
                      checked: enableWaitingRoom,
                      onCheckedChange: setEnableWaitingRoom,
                    },
                    {
                      label: "Auto-record",
                      description: "Queue a recording ingestion job as soon as the call starts.",
                      checked: enableRecording,
                      onCheckedChange: setEnableRecording,
                    },
                    {
                      label: "Auto-transcribe",
                      description: "Capture transcript records for summaries and follow-ups.",
                      checked: enableTranscription,
                      onCheckedChange: setEnableTranscription,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 rounded-xl" size="lg" onClick={handleScheduleMeeting} disabled={isSubmitting}>
                    {isSubmitting ? "Scheduling..." : "Schedule meeting"}
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-xl" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
                <CardHeader>
                  <CardTitle className="text-base font-[family-name:var(--font-heading)]">Date preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md" />
                  <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-medium">Scheduled for</p>
                    <p className="mt-1 text-muted-foreground">{formatMeetingDate(scheduledForValue.toISOString())}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
                <CardHeader>
                  <CardTitle className="text-base font-[family-name:var(--font-heading)]">Integration state</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["google", "outlook"].map((provider) => (
                    <div key={provider} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 px-4 py-3">
                      <div>
                        <p className="capitalize font-medium">{provider} Calendar</p>
                        <p className="text-xs text-muted-foreground">
                          {connectedProviders.has(provider) ? "Ready to sync scheduled meetings" : "Connect from Settings to enable sync"}
                        </p>
                      </div>
                      <Badge variant={connectedProviders.has(provider) ? "default" : "secondary"} className="rounded-full">
                        {connectedProviders.has(provider) ? "Connected" : "Not linked"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <div className="flex flex-col gap-4">
            {meetings.length ? (
              meetings.map((meeting) => (
                <Card key={meeting.id} className="rounded-[1.5rem] border-slate-200 bg-white/90 shadow-lg shadow-slate-200/40">
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        {meeting.room_mode === "audio" ? <Mic className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{meeting.title || "Untitled meeting"}</p>
                          <Badge variant="secondary" className="rounded-full text-xs">{meeting.room_mode || "video"}</Badge>
                          {meeting.auto_record_enabled && <Badge variant="outline" className="rounded-full text-xs">Recording</Badge>}
                          {meeting.auto_transcript_enabled && <Badge variant="outline" className="rounded-full text-xs">Transcript</Badge>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {formatMeetingDate(meeting.scheduled_for)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {meeting.meeting_invites?.length || 0} invited
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => copyMeetingLink(meeting.id)}>
                        {copiedId === meeting.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href={`/meeting/${meeting.id}?title=${encodeURIComponent(meeting.title || "Meeting")}&mode=${meeting.room_mode || "video"}`}>
                          Open room
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="rounded-[2rem] border-dashed border-slate-300 bg-white/80">
                <CardContent className="p-10 text-center">
                  <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium">No scheduled meetings yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create one above and it will show invite state, sync readiness, and capture preferences here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
