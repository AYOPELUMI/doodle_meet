"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StreamChat } from "stream-chat";
import type { Channel as StreamChannel } from "stream-chat";
import {
  CallParticipantsList,
  CallingState,
  PaginatedGridLayout,
  ParticipantsAudio,
  ScreenShareButton,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  ToggleAudioPreviewButton,
  ToggleAudioPublishingButton,
  ToggleVideoPreviewButton,
  ToggleVideoPublishingButton,
  VideoPreview,
  useCall,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import {
  ArrowLeft,
  CalendarClock,
  Copy,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PanelsTopLeft,
  PhoneOff,
  Save,
  Settings2,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StreamChatPanel } from "@/components/meeting/stream-chat-panel";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { formatMeetingCode, toDateTimeLocalValue, formatScheduleLabel, scheduleParamsToStatus } from "@/lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";

type MeetingRecord = {
  id: string;
  title?: string | null;
  description?: string | null;
  room_mode?: string | null;
  audience?: string | null;
  co_hosts?: string[] | null;
  status?: string | null;
  scheduled_for?: string | null;
};

type StreamTokenResponse = {
  apiKey: string;
  token: string;
  user: {
    id: string;
    name: string;
    type?: "authenticated";
    image?: string;
  };
};

async function fetchStreamAuth(guestName?: string, guestId?: string) {
  const query =
    guestName && guestId
      ? `?${new URLSearchParams({ guestName, guestId }).toString()}`
      : "";
  const response = await fetch(`/api/stream/token${query}`, { cache: "no-store" });
  const data = (await response.json()) as StreamTokenResponse | { error: string };
  console.log({ data }, { response })
  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Unable to connect Stream.");
  }

  return data;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timer: number | undefined;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    console.log("i got here")
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
}


function useAudioLevel(mediaStream?: MediaStream) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!mediaStream) {
      setLevel(0);
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;

    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let frameId = 0;

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setLevel(Math.min(100, Math.round((average / 255) * 100)));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    };
  }, [mediaStream]);

  return level;
}

function GuestAccessGate({
  draftName,
  setDraftName,
  onContinue,
  meetingId,
  meetingTitle,
  audience,
}: {
  draftName: string;
  setDraftName: (value: string) => void;
  onContinue: () => void;
  meetingId: string;
  meetingTitle?: string | null;
  audience: string;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_50%,_#111827)] px-6 py-8 text-white lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
              Meeting access
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight font-heading">
              Join {meetingTitle || "this meeting"} with a quick setup
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Enter your name once, open the preview room, and test your camera and microphone before you join.
            </p>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <Label className="text-white">Your display name</Label>
              <Input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="How people will know it's you"
                className="mt-3 h-12 rounded-2xl border-white/15 bg-white/5 text-white placeholder:text-white/35"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onContinue();
                  }
                }}
              />
              <Button className="mt-5 h-12 rounded-2xl px-6" onClick={onContinue}>
                Continue to preview
              </Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-teal-300/80">Room summary</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Meeting code</p>
                <p className="mt-2 text-2xl font-semibold">{formatMeetingCode(meetingId)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Access policy</p>
                <p className="mt-2 text-sm text-white/80">
                  {audience === "authenticated" ? "Authenticated users only" : "Anyone with the link can join"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">What happens next</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>Preview yourself before entering</li>
                  <li>Check mic activity live on screen</li>
                  <li>Join with video or audio already set the way you want</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HostMeetingControls({
  meeting,
  canPersist,
  onSave,
}: {
  meeting: MeetingRecord | null;
  canPersist: boolean;
  onSave: (updates: {
    audience: "anyone" | "authenticated";
    hostMode: "open" | "scheduled";
    scheduledFor: string | null;
    status?: "live" | "scheduled" | "ended" | "cancelled";
    coHosts: string[];
  }) => Promise<void>;
}) {
  const [audience, setAudience] = useState<"anyone" | "authenticated">(
    meeting?.audience === "authenticated" ? "authenticated" : "anyone",
  );
  const [hostMode, setHostMode] = useState<"open" | "scheduled">(
    meeting?.status === "scheduled" || meeting?.scheduled_for ? "scheduled" : "open",
  );
  const [scheduledFor, setScheduledFor] = useState(toDateTimeLocalValue(meeting?.scheduled_for));
  const [coHosts, setCoHosts] = useState<string[]>(meeting?.co_hosts ?? []);
  const [coHostInput, setCoHostInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAudience(meeting?.audience === "authenticated" ? "authenticated" : "anyone");
    setHostMode(meeting?.status === "scheduled" || meeting?.scheduled_for ? "scheduled" : "open");
    setScheduledFor(toDateTimeLocalValue(meeting?.scheduled_for));
    setCoHosts(meeting?.co_hosts ?? []);
  }, [meeting]);

  const addCoHost = () => {
    const email = coHostInput.trim().toLowerCase();
    if (!email || coHosts.includes(email)) return;
    setCoHosts((current) => [...current, email]);
    setCoHostInput("");
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-teal-300" />
        <p className="text-sm font-semibold">Host controls</p>
      </div>
      <p className="mt-2 text-sm text-white/60">
        {canPersist
          ? "Adjust access, timing, and co-host ownership. Changes sync to Supabase."
          : "Adjust access and timing locally for this guest-hosted room."}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-white">Join access</Label>
          <Select value={audience} onValueChange={(value) => setAudience(value as "anyone" | "authenticated")}>
            <SelectTrigger className="h-11 rounded-xl border-white/15 bg-black/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyone">Anyone with link</SelectItem>
              <SelectItem value="authenticated">Authenticated only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Meeting mode</Label>
          <Select value={hostMode} onValueChange={(value) => setHostMode(value as "open" | "scheduled")}>
            <SelectTrigger className="h-11 rounded-xl border-white/15 bg-black/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open now</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hostMode === "scheduled" && (
        <div className="mt-4 space-y-2">
          <Label className="text-white">Scheduled time</Label>
          <Input
            type="datetime-local"
            value={scheduledFor}
            onChange={(event) => setScheduledFor(event.target.value)}
            className="h-11 rounded-xl border-white/15 bg-black/20 text-white"
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        <Label className="text-white">Co-hosts</Label>
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
            className="h-11 rounded-xl border-white/15 bg-black/20 text-white placeholder:text-white/35"
          />
          <Button type="button" variant="secondary" className="rounded-xl" onClick={addCoHost}>
            Add
          </Button>
        </div>
        {coHosts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {coHosts.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => setCoHosts((current) => current.filter((item) => item !== email))}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/80 transition hover:bg-white/10"
              >
                {email}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          className="rounded-full"
          disabled={isSaving || (hostMode === "scheduled" && !scheduledFor)}
          onClick={async () => {
            setIsSaving(true);
            try {
              await onSave({
                audience,
                hostMode,
                scheduledFor: hostMode === "scheduled" ? new Date(scheduledFor).toISOString() : null,
                status: hostMode === "scheduled" ? "scheduled" : "live",
                coHosts,
              });
              toast.success(canPersist ? "Meeting controls saved." : "Guest meeting controls updated.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to save host controls.");
            } finally {
              setIsSaving(false);
            }
          }}
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save controls
        </Button>
        <p className="text-xs text-white/45">
          {hostMode === "scheduled" && scheduledFor
            ? formatScheduleLabel(new Date(scheduledFor).toISOString())
            : "Room is open for joining"}
        </p>
      </div>
    </div>
  );
}

function DeviceReadinessPanel() {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const cameraState = useCameraState({ optimisticUpdates: true });
  const microphoneState = useMicrophoneState({ optimisticUpdates: true });
  const micLevel = useAudioLevel(microphoneState.mediaStream);

  const readinessCards = [
    {
      title: "Camera",
      icon: cameraState.optionsAwareIsMute ? VideoOff : Video,
      status: cameraState.optionsAwareIsMute ? "Camera is off" : "Camera is ready",
      meta: cameraState.hasBrowserPermission
        ? `${cameraState.devices.length || 0} device${cameraState.devices.length === 1 ? "" : "s"} detected`
        : "Permission needed",
    },
    {
      title: "Microphone",
      icon: microphoneState.optionsAwareIsMute ? MicOff : Mic,
      status: microphoneState.optionsAwareIsMute ? "Microphone is muted" : "Microphone is live",
      meta: microphoneState.hasBrowserPermission
        ? `${microphoneState.devices.length || 0} device${microphoneState.devices.length === 1 ? "" : "s"} detected`
        : "Permission needed",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {readinessCards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{card.title}</p>
                <p className="text-xs text-white/50">{card.status}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/55">{card.meta}</p>
            {card.title === "Microphone" && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-white/45">
                  <span>Mic activity</span>
                  <span>{micLevel}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-300 transition-all"
                    style={{ width: `${Math.max(6, micLevel)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PreMeetingLobby({
  meetingId,
  meeting,
  participantName,
  backgroundChoice,
  setBackgroundChoice,
  accentColor,
  setAccentColor,
  isHost,
  isGuest,
  canPersistControls,
  onSaveHostControls,
  onEditGuestName,
  onJoin,
  isJoining,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  participantName: string;
  backgroundChoice: string;
  setBackgroundChoice: (value: string) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  isHost: boolean;
  isGuest: boolean;
  canPersistControls: boolean;
  onSaveHostControls: (updates: {
    audience: "anyone" | "authenticated";
    hostMode: "open" | "scheduled";
    scheduledFor: string | null;
    status?: "live" | "scheduled" | "ended" | "cancelled";
    coHosts: string[];
  }) => Promise<void>;
  onEditGuestName: () => void;
  onJoin: () => Promise<void>;
  isJoining: boolean;
}) {
  const meetingLink = `${typeof window !== "undefined" ? window.location.origin : ""}/meeting/${meetingId}`;

  const previewBackground =
    backgroundChoice === "warm"
      ? "bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_42%),#1f2937]"
      : backgroundChoice === "studio"
        ? "bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.2),_transparent_42%),#111827]"
        : "bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.2),_transparent_40%),#0f172a]";

  const accentStyles: Record<string, string> = {
    teal: "linear-gradient(135deg, rgba(45,212,191,0.28), rgba(34,211,238,0.08))",
    amber: "linear-gradient(135deg, rgba(245,158,11,0.28), rgba(251,191,36,0.08))",
    rose: "linear-gradient(135deg, rgba(244,63,94,0.28), rgba(251,113,133,0.08))",
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
            Pre-meeting room
          </div>
        </div>

        <div className="grid flex-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="rounded-[1.5rem] p-1" style={{ background: accentStyles[accentColor] }}>
                <div className={`overflow-hidden rounded-[1.35rem] ${previewBackground}`}>
                  <VideoPreview className="h-full min-h-[380px] overflow-hidden rounded-[1.35rem]" />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <ToggleAudioPreviewButton />
                <ToggleVideoPreviewButton />
              </div>
            </div>

            <DeviceReadinessPanel />
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-teal-300/80">Ready to join</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight font-heading">
              {meeting?.title || "Quick team huddle"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {meeting?.description || "Preview your setup, personalize your appearance, and join when you are ready."}
            </p>

            <div className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">Joining as</p>
                  <p className="mt-2 text-lg font-semibold">{participantName}</p>
                  {isGuest && (
                    <button
                      type="button"
                      onClick={onEditGuestName}
                      className="mt-3 text-xs text-teal-300 transition hover:text-teal-200"
                    >
                      Change guest name
                    </button>
                  )}
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/45">Meeting access</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {meeting?.audience === "authenticated" ? "Authenticated only" : "Anyone with the link"}
                  </p>
                  <p className="mt-2 text-xs text-white/50">
                    {meeting?.scheduled_for ? formatScheduleLabel(meeting.scheduled_for) : "Open now"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white">Accent color</Label>
                  <Select value={accentColor} onValueChange={setAccentColor}>
                    <SelectTrigger className="h-11 rounded-xl border-white/15 bg-black/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teal">Teal</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="rose">Rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Preview background</Label>
                  <Select value={backgroundChoice} onValueChange={setBackgroundChoice}>
                    <SelectTrigger className="h-11 rounded-xl border-white/15 bg-black/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soft">Soft teal</SelectItem>
                      <SelectItem value="warm">Warm amber</SelectItem>
                      <SelectItem value="studio">Studio rose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Meeting link</p>
                    <code className="mt-2 block truncate text-sm text-white/75">{meetingLink}</code>
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={() => {
                      navigator.clipboard.writeText(meetingLink);
                      toast.success("Meeting link copied.");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 pt-2 sm:flex-row">
              <Button className="h-12 flex-1 rounded-2xl text-base" onClick={onJoin} disabled={isJoining}>
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join now"}
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-2xl border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);
                  toast.success("Invite link copied.");
                }}
              >
                Copy invite
              </Button>
            </div>

            {isHost && (
              <div className="mt-6">
                <HostMeetingControls
                  meeting={meeting}
                  canPersist={canPersistControls}
                  onSave={onSaveHostControls}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveMeeting({
  meetingId,
  meeting,
  chatClient,
  channel,
  isHost,
  canGuestJoin,
  onUpdateMeeting,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
  isHost: boolean;
  canGuestJoin: boolean;
  onUpdateMeeting: (updates: Partial<MeetingRecord>) => Promise<void>;
}) {
  const router = useRouter();
  const call = useCall();
  const {
    useCallCallingState,
    useParticipantCount,
    useHasOngoingScreenShare,
    useScreenShareState,
  } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();
  const hasOngoingScreenShare = useHasOngoingScreenShare();
  const screenShareState = useScreenShareState({ optimisticUpdates: true });
  const [layoutMode, setLayoutMode] = useState<"auto" | "grid" | "speaker">("auto");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  const meetingLink = `${typeof window !== "undefined" ? window.location.origin : ""}/meeting/${meetingId}`;
  const meetingState = meeting?.status === "cancelled" ? "cancelled" : meeting?.status === "ended" ? "ended" : "open";
  const isPresenting = screenShareState.isEnabled && !screenShareState.optionsAwareIsMute;
  const autoLayout: "grid" | "speaker" = hasOngoingScreenShare || participantCount <= 2 ? "speaker" : "grid";
  const activeLayout = layoutMode === "auto" ? autoLayout : layoutMode;

  if (!call || callingState !== CallingState.JOINED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (meetingState !== "open") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold font-heading">
            {meetingState === "ended" ? "This meeting has ended." : "This meeting was cancelled."}
          </h1>
          <p className="mt-3 text-sm text-white/65">
            {isHost ? "You can create another room any time." : "Ask the host for a new link if another session is planned."}
          </p>
          <Button className="mt-6" asChild>
            <Link href={isHost ? "/meeting/new" : "/"}>{isHost ? "Create another meeting" : "Back home"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#020617] text-white">
      <div className="border-b border-white/10 bg-[#061224] px-4 py-3">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-200">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{meeting?.title || "Live meeting"}</p>
              <p className="text-xs text-white/50">
                {participantCount} {participantCount === 1 ? "person" : "people"} in the room
                {" • "}
                {meeting?.scheduled_for ? formatScheduleLabel(meeting.scheduled_for) : "Open now"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {canGuestJoin ? "Guests allowed" : "Authenticated only"}
            </div>
            {participantCount <= 1 && (
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                Waiting for others
              </div>
            )}
            <Button
              variant={layoutMode === "auto" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => setLayoutMode("auto")}
            >
              Auto
            </Button>
            <Button
              variant={layoutMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => setLayoutMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layoutMode === "speaker" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => setLayoutMode("speaker")}
            >
              <PanelsTopLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-white hover:bg-white/10 hover:text-white"
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                toast.success("Meeting link copied.");
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </Button>
          </div>
        </div>

        {(hasOngoingScreenShare || isPresenting) && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            <MonitorUp className="h-4 w-4" />
            {isPresenting ? "You are sharing your screen." : "A participant is sharing their screen."}
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 p-4">
            <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f] shadow-2xl shadow-cyan-950/10">
              {activeLayout === "grid" ? (
                <PaginatedGridLayout />
              ) : (
                <SpeakerLayout participantsBarPosition={hasOngoingScreenShare ? "bottom" : "right"} />
              )}
              <ParticipantsAudio participants={[]} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#061224] px-4 py-4">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3">
              <ToggleAudioPublishingButton />
              <ToggleVideoPublishingButton />
              <ScreenShareButton />

              <Button
                variant={showChat ? "secondary" : "outline"}
                className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setShowChat((value) => !value);
                  if (!showChat) setShowParticipants(false);
                }}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Button>

              <Button
                variant={showParticipants ? "secondary" : "outline"}
                className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setShowParticipants((value) => !value);
                  if (!showParticipants) setShowChat(false);
                }}
              >
                <Users className="mr-2 h-4 w-4" />
                People
              </Button>

              <Button
                variant="destructive"
                className="rounded-full"
                onClick={async () => {
                  await call.leave();
                  router.push(isHost ? "/dashboard" : "/");
                }}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                Leave
              </Button>

              {isHost && (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    onClick={() => void onUpdateMeeting({ status: "ended" })}
                  >
                    End meeting
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-rose-400/30 bg-transparent text-rose-200 hover:bg-rose-500/10 hover:text-rose-100"
                    onClick={() => void onUpdateMeeting({ status: "cancelled" })}
                  >
                    Cancel meeting
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {showParticipants && (
          <div className="hidden w-[340px] border-l border-white/10 bg-[#08111f] p-3 lg:block">
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}

        {showChat && chatClient && channel && (
          <div className="hidden lg:block">
            <StreamChatPanel chatClient={chatClient} channel={channel} onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

function MeetingStateRouter({
  meetingId,
  meeting,
  call,
  chatClient,
  channel,
  participantName,
  backgroundChoice,
  setBackgroundChoice,
  accentColor,
  setAccentColor,
  isHost,
  isGuest,
  canGuestJoin,
  canPersistControls,
  onSaveHostControls,
  onEditGuestName,
  onUpdateMeeting,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  call: Call;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
  participantName: string;
  backgroundChoice: string;
  setBackgroundChoice: (value: string) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  isHost: boolean;
  isGuest: boolean;
  canGuestJoin: boolean;
  canPersistControls: boolean;
  onSaveHostControls: (updates: {
    audience: "anyone" | "authenticated";
    hostMode: "open" | "scheduled";
    scheduledFor: string | null;
    status?: "live" | "scheduled" | "ended" | "cancelled";
    coHosts: string[];
  }) => Promise<void>;
  onEditGuestName: () => void;
  onUpdateMeeting: (updates: Partial<MeetingRecord>) => Promise<void>;
}) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [isJoining, setIsJoining] = useState(false);

  const joinMeeting = async () => {
    if (!participantName.trim()) {
      toast.error("Add your display name before joining.");
      return;
    }

    setIsJoining(true);
    try {
      await call.join({ create: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to join meeting.");
    } finally {
      setIsJoining(false);
    }
  };

  if (callingState === CallingState.JOINED) {
    return (
      <ActiveMeeting
        meetingId={meetingId}
        meeting={meeting}
        chatClient={chatClient}
        channel={channel}
        isHost={isHost}
        canGuestJoin={canGuestJoin}
        onUpdateMeeting={onUpdateMeeting}
      />
    );
  }

  return (
    <PreMeetingLobby
      meetingId={meetingId}
      meeting={meeting}
      participantName={participantName}
      backgroundChoice={backgroundChoice}
      setBackgroundChoice={setBackgroundChoice}
      accentColor={accentColor}
      setAccentColor={setAccentColor}
      isHost={isHost}
      isGuest={isGuest}
      canPersistControls={canPersistControls}
      onSaveHostControls={onSaveHostControls}
      onEditGuestName={onEditGuestName}
      onJoin={joinMeeting}
      isJoining={isJoining}
    />
  );
}

function MeetingScene({
  meetingId,
  meeting,
  call,
  videoClient,
  chatClient,
  channel,
  participantName,
  backgroundChoice,
  setBackgroundChoice,
  accentColor,
  setAccentColor,
  isHost,
  isGuest,
  canGuestJoin,
  canPersistControls,
  onSaveHostControls,
  onEditGuestName,
  onUpdateMeeting,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  call: Call;
  videoClient: StreamVideoClient;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
  participantName: string;
  backgroundChoice: string;
  setBackgroundChoice: (value: string) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  isHost: boolean;
  isGuest: boolean;
  canGuestJoin: boolean;
  canPersistControls: boolean;
  onSaveHostControls: (updates: {
    audience: "anyone" | "authenticated";
    hostMode: "open" | "scheduled";
    scheduledFor: string | null;
    status?: "live" | "scheduled" | "ended" | "cancelled";
    coHosts: string[];
  }) => Promise<void>;
  onEditGuestName: () => void;
  onUpdateMeeting: (updates: Partial<MeetingRecord>) => Promise<void>;
}) {
  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <StreamTheme className="doodlw-stream-theme">
          <MeetingStateRouter
            meetingId={meetingId}
            meeting={meeting}
            call={call}
            chatClient={chatClient}
            channel={channel}
            participantName={participantName}
            backgroundChoice={backgroundChoice}
            setBackgroundChoice={setBackgroundChoice}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            isHost={isHost}
            isGuest={isGuest}
            canGuestJoin={canGuestJoin}
            canPersistControls={canPersistControls}
            onSaveHostControls={onSaveHostControls}
            onEditGuestName={onEditGuestName}
            onUpdateMeeting={onUpdateMeeting}
          />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

export function LiveMeetingRoom({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [meeting, setMeeting] = useState<MeetingRecord | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backgroundChoice, setBackgroundChoice] = useState("soft");
  const [accentColor, setAccentColor] = useState("teal");

  const fallbackTitle = searchParams.get("title");
  const roomMode = useMemo(() => searchParams.get("mode") ?? "video", [searchParams]);
  const scheduleType = useMemo(() => searchParams.get("scheduleType"), [searchParams]);
  const audience = searchParams.get("audience") ?? "anyone";
  const hostName = searchParams.get("hostName") ?? "Host";
  const guestHost = searchParams.get("guestHost") === "true";
  const scheduledForParam = searchParams.get("scheduledFor");
  const canGuestJoin = audience === "anyone";
  const initialGuestName = searchParams.get("hostName")?.trim() || "";
  const [draftGuestName, setDraftGuestName] = useState(initialGuestName);
  const [confirmedGuestName, setConfirmedGuestName] = useState<string | null>(
    user?.name ?? (initialGuestName || null),
  );
  const guestId = useMemo(() => `guest-${meetingId}-${Math.random().toString(36).slice(2, 8)}`, [meetingId]);
  const participantName = user?.name ?? confirmedGuestName ?? "";
  const isGuest = !user;
  const isHost = Boolean((user && user.name === hostName) || guestHost);
  const canPersistControls = Boolean(user && isHost);
  const identityName = user?.name ?? confirmedGuestName ?? "";
  const previousIdentityRef = useRef(identityName);

  const clientRef = useRef<StreamVideoClient | null>(null);
  const chatRef = useRef<StreamChat | null>(null);
  const callRef = useRef<Call | null>(null);

  const cleanupClients = async () => {
    const previousCall = callRef.current;
    const previousVideoClient = clientRef.current;
    const previousChatClient = chatRef.current;

    callRef.current = null;
    clientRef.current = null;
    chatRef.current = null;

    try {
      await previousCall?.leave();
    } catch {
      // Ignore teardown issues during navigation or reconnect.
    }

    try {
      await previousVideoClient?.disconnectUser();
    } catch {
      // Ignore teardown issues during navigation or reconnect.
    }

    try {
      await previousChatClient?.disconnectUser();
    } catch {
      // Ignore teardown issues during navigation or reconnect.
    }
  };

  const updateMeeting = async (updates: Partial<MeetingRecord>) => {
    if (canPersistControls) {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updates.title,
          description: updates.description,
          audience: updates.audience,
          coHosts: updates.co_hosts,
          status: updates.status,
          hostMode: updates.status === "scheduled" || updates.scheduled_for ? "scheduled" : "open",
          scheduledFor: updates.scheduled_for ?? null,
        }),
      });
      const data = (await response.json()) as { meeting?: MeetingRecord; error?: string };
      if (!response.ok || !data.meeting) {
        throw new Error(data.error || "Unable to update meeting.");
      }
      setMeeting(data.meeting);
      return;
    }

    setMeeting((current) => ({
      id: current?.id || meetingId,
      title: current?.title || fallbackTitle || "Quick meeting",
      room_mode: current?.room_mode || roomMode,
      audience: updates.audience ?? current?.audience ?? audience,
      co_hosts: updates.co_hosts ?? current?.co_hosts ?? [],
      description: current?.description ?? null,
      status: updates.status ?? current?.status ?? "live",
      scheduled_for: updates.scheduled_for ?? current?.scheduled_for ?? scheduledForParam,
    }));
  };

  const saveHostControls = async (updates: {
    audience: "anyone" | "authenticated";
    hostMode: "open" | "scheduled";
    scheduledFor: string | null;
    status?: "live" | "scheduled" | "ended" | "cancelled";
    coHosts: string[];
  }) => {
    await updateMeeting({
      audience: updates.audience,
      co_hosts: updates.coHosts,
      status: updates.status ?? (updates.hostMode === "scheduled" ? "scheduled" : "live"),
      scheduled_for: updates.scheduledFor,
    });
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user && !canGuestJoin) router.push("/login");
  }, [canGuestJoin, isAuthLoading, router, user]);

  useEffect(() => {
    if (!user || !meetingId) return;

    let intervalId: number | undefined;

    const ping = async () => {
      try {
        await fetch("/api/presence/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId }),
        });
      } catch {
        // Presence is non-blocking for the meeting experience.
      }
    };

    void ping();
    intervalId = window.setInterval(() => {
      void ping();
    }, 45_000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [meetingId, user]);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!user && !canGuestJoin) return;
    if (!identityName) return;

    let mounted = true;

    async function initializeRoom() {
      setIsLoading(true);
      setError(null);
      try {
        await cleanupClients();
        console.log("i got here")
        const { data: record, error: errorr } = await supabase
          .from("meetings")
          .select("id, title, description, room_mode, audience, co_hosts, status, scheduled_for")
          .eq("id", meetingId)
          .maybeSingle();
        console.log({ errorr }, { record })
        const auth = await fetchStreamAuth(user ? undefined : identityName, user ? undefined : guestId);

        console.log({ auth })
        const [{ data: meetingRecord }, streamAuth] = await
          Promise.all([
            supabase
              .from("meetings")
              .select("id, title, description, room_mode, audience, co_hosts, status, scheduled_for")
              .eq("id", meetingId)
              .maybeSingle(),
            fetchStreamAuth(user ? undefined : identityName, user ? undefined : guestId),
          ])
        console.log("i got here x1")

        const tokenProvider = async () => {
          const data = await fetchStreamAuth(user ? undefined : identityName, user ? undefined : guestId);
          return data.token;
        };

        const nextVideoClient = new StreamVideoClient({
          apiKey: streamAuth.apiKey,
          user: streamAuth.user,
          tokenProvider,
        });

        const nextChatClient = new StreamChat(streamAuth.apiKey);
        await withTimeout(
          nextChatClient.connectUser(streamAuth.user, streamAuth.token),
          12000,
          "Chat connection timed out. Please reload the meeting.",
        );

        const nextCall = nextVideoClient.call(roomMode === "audio" ? "audio_room" : "default", meetingId);
        await withTimeout(
          nextCall.getOrCreate({
            data: {
              // channel_cid: user?.id,
              custom: {
                title: meetingRecord?.title || fallbackTitle || "Quick meeting",
                room_mode: roomMode,
                audience: meetingRecord?.audience || audience,
                scheduled_for: meetingRecord?.scheduled_for || scheduledForParam,
              },
            },
          }),
          12000,
          "Video room setup timed out. Please reload the meeting.",
        );

        const nextChannel = nextChatClient.channel("livestream", meetingId, {
          team: meetingRecord?.title || fallbackTitle || "Meeting chat",
          created_by_id: user?.id,
        });
        await withTimeout(
          nextChannel.watch(),
          12000,
          "Meeting chat took too long to load. Please reload the meeting.",
        );
        console.log("i got here x2")

        if (!mounted) {
          console.log("i got here x3")

          await nextCall.leave().catch(() => undefined);
          await nextVideoClient.disconnectUser().catch(() => undefined);
          await nextChatClient.disconnectUser().catch(() => undefined);
          return;
        }
        console.log("i got here x4")

        previousIdentityRef.current = identityName;
        clientRef.current = nextVideoClient;
        chatRef.current = nextChatClient;
        callRef.current = nextCall;

        setMeeting(
          meetingRecord || {
            id: meetingId,
            title: fallbackTitle || "Quick meeting",
            room_mode: roomMode,
            audience,
            status: scheduleParamsToStatus(scheduleType),
            scheduled_for: scheduledForParam,
          },
        );
        setVideoClient(nextVideoClient);
        setChatClient(nextChatClient);
        setCall(nextCall);
        console.log("i got here x5")

        setChannel(nextChannel);
      } catch (nextError) {
        console.log({ nextError })
        if (!mounted) return;
        setError(nextError instanceof Error ? nextError.message : "Unable to prepare the meeting.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void initializeRoom();

    return () => {
      mounted = false;
    };
  }, [
    audience,
    canGuestJoin,
    fallbackTitle,
    guestId,
    identityName,
    meetingId,
    roomMode,
    scheduledForParam,
    scheduleType,
    user,
  ]);

  useEffect(() => {
    return () => {
      void cleanupClients();
    };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Preparing your meeting space...
        </div>
      </div>
    );
  }

  if (!user && canGuestJoin && !confirmedGuestName) {
    return (
      <GuestAccessGate
        draftName={draftGuestName}
        setDraftName={setDraftGuestName}
        onContinue={() => {
          if (!draftGuestName.trim()) {
            toast.error("Enter your name to continue.");
            return;
          }
          setConfirmedGuestName(draftGuestName.trim());
        }}
        meetingId={meetingId}
        meetingTitle={fallbackTitle}
        audience={audience}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting your meeting space...
        </div>
      </div>
    );
  }
  console.log({ error }, { videoClient }, { call }, { meetingId })
  if (error || !videoClient || !call) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold font-heading">We couldn&apos;t open this meeting.</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">{error || "The room is missing required configuration."}</p>
          <Button className="mt-6" asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MeetingScene
      meetingId={meetingId}
      meeting={meeting}
      call={call}
      videoClient={videoClient}
      chatClient={chatClient}
      channel={channel}
      participantName={participantName}
      backgroundChoice={backgroundChoice}
      setBackgroundChoice={setBackgroundChoice}
      accentColor={accentColor}
      setAccentColor={setAccentColor}
      isHost={isHost}
      isGuest={isGuest}
      canGuestJoin={canGuestJoin}
      canPersistControls={canPersistControls}
      onSaveHostControls={saveHostControls}
      onEditGuestName={() => {
        if (!isGuest) return;
        void cleanupClients();
        setVideoClient(null);
        setChatClient(null);
        setCall(null);
        setChannel(null);
        setMeeting(null);
        setError(null);
        setConfirmedGuestName(null);
      }}
      onUpdateMeeting={updateMeeting}
    />
  );
}
