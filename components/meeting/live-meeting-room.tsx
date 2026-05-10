"use client";

import { useEffect, useMemo, useState } from "react";
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
  Copy,
  LayoutGrid,
  Loader2,
  MessageSquare,
  PanelsTopLeft,
  PhoneOff,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StreamChatPanel } from "@/components/meeting/stream-chat-panel";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";

type MeetingRecord = {
  id: string;
  title?: string | null;
  description?: string | null;
  room_mode?: string | null;
};

type StreamTokenResponse = {
  apiKey: string;
  token: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
};

async function fetchStreamAuth() {
  const response = await fetch("/api/stream/token", { cache: "no-store" });
  const data = (await response.json()) as StreamTokenResponse | { error: string };

  if (!response.ok || "error" in data) {
    throw new Error("error" in data ? data.error : "Unable to connect Stream.");
  }

  return data;
}

function formatMeetingCode(meetingId: string) {
  if (meetingId.includes("-")) return meetingId;
  return meetingId.match(/.{1,3}/g)?.join("-") ?? meetingId;
}

function MeetingLobby({
  meetingId,
  meeting,
  onJoin,
  isJoining,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  onJoin: () => Promise<void>;
  isJoining: boolean;
}) {
  const meetingLink = `${typeof window !== "undefined" ? window.location.origin : ""}/meeting/${meetingId}`;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.12),_transparent_30%),linear-gradient(135deg,_#020617,_#0f172a_45%,_#111827)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
            Ready room
          </div>
        </div>

        <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-2xl shadow-cyan-950/20 backdrop-blur">
            <VideoPreview className="h-full min-h-[360px] overflow-hidden rounded-[1.5rem]" />
            <div className="mt-4 flex items-center justify-center gap-3">
              <ToggleAudioPreviewButton />
              <ToggleVideoPreviewButton />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-teal-300/80">Live meeting</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight font-heading">
              {meeting?.title || "Quick team huddle"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {meeting?.description ||
                "Set your camera and microphone exactly how you want them before joining the room."}
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Meeting code</p>
                <p className="mt-2 text-xl font-semibold">{formatMeetingCode(meetingId)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/45">Meeting link</p>
                <div className="mt-2 flex items-center gap-3">
                  <code className="truncate text-sm text-white/75">{meetingLink}</code>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full bg-white/10 text-white hover:bg-white/20"
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
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
}) {
  const router = useRouter();
  const call = useCall();
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const participantCount = useParticipantCount();
  const callingState = useCallCallingState();
  const [layout, setLayout] = useState<"grid" | "speaker">("grid");
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  const meetingLink = `${typeof window !== "undefined" ? window.location.origin : ""}/meeting/${meetingId}`;

  if (!call || callingState !== CallingState.JOINED) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#020617] text-white">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#061224] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-200">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{meeting?.title || "Live meeting"}</p>
            <p className="text-xs text-white/50">{participantCount} people in the room</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white"
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "speaker" ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-full text-white hover:bg-white/10 hover:text-white"
            onClick={() => setLayout("speaker")}
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

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 p-4">
            <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#08111f] shadow-2xl shadow-cyan-950/10">
              {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout participantsBarPosition="right" />}
              <ParticipantsAudio />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#061224] px-4 py-4">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3">
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
                  router.push("/dashboard");
                }}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                Leave
              </Button>
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

function MeetingScene({
  meetingId,
  meeting,
  call,
  videoClient,
  chatClient,
  channel,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  call: Call;
  videoClient: StreamVideoClient;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
}) {
  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <StreamTheme className="doodlw-stream-theme">
          <MeetingStateRouter meetingId={meetingId} meeting={meeting} call={call} chatClient={chatClient} channel={channel} />
        </StreamTheme>
      </StreamCall>
    </StreamVideo>
  );
}

function MeetingStateRouter({
  meetingId,
  meeting,
  call,
  chatClient,
  channel,
}: {
  meetingId: string;
  meeting: MeetingRecord | null;
  call: Call;
  chatClient: StreamChat | null;
  channel: StreamChannel | null;
}) {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [isJoining, setIsJoining] = useState(false);

  const joinMeeting = async () => {
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
    return <ActiveMeeting meetingId={meetingId} meeting={meeting} chatClient={chatClient} channel={channel} />;
  }

  return <MeetingLobby meetingId={meetingId} meeting={meeting} onJoin={joinMeeting} isJoining={isJoining} />;
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackTitle = searchParams.get("title");
  const roomMode = useMemo(() => searchParams.get("mode") ?? "video", [searchParams]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) router.push("/login");
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (!user) return;

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

    ping();
    intervalId = window.setInterval(ping, 45_000);

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [meetingId, user]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const supabase = createSupabaseClient();
    let nextCall: Call | null = null;
    let nextVideoClient: StreamVideoClient | null = null;
    let nextChatClient: StreamChat | null = null;

    async function initializeRoom() {
      setIsLoading(true);
      setError(null);

      try {
        const [{ data: meetingRecord }, streamAuth] = await Promise.all([
          supabase
            .from("meetings")
            .select("id, title, description, room_mode")
            .eq("id", meetingId)
            .maybeSingle(),
          fetchStreamAuth(),
        ]);

        const tokenProvider = async () => {
          const data = await fetchStreamAuth();
          return data.token;
        };

        nextVideoClient = new StreamVideoClient({
          apiKey: streamAuth.apiKey,
          user: streamAuth.user,
          tokenProvider,
        });

        nextChatClient = StreamChat.getInstance(streamAuth.apiKey);
        await nextChatClient.connectUser(streamAuth.user, streamAuth.token);

        nextCall = nextVideoClient.call(roomMode === "audio" ? "audio_room" : "default", meetingId);
        await nextCall.getOrCreate({
          data: {
            created_by_id: user.id,
            custom: {
              title: meetingRecord?.title || fallbackTitle || "Quick meeting",
              room_mode: roomMode,
            },
          },
        });

        const nextChannel = nextChatClient.channel("livestream", meetingId, {
          name: meetingRecord?.title || fallbackTitle || "Meeting chat",
          created_by_id: user.id,
        });
        await nextChannel.watch();

        if (!mounted) return;

        setMeeting(
          meetingRecord || {
            id: meetingId,
            title: fallbackTitle || "Quick meeting",
            room_mode: roomMode,
          },
        );
        setVideoClient(nextVideoClient);
        setChatClient(nextChatClient);
        setCall(nextCall);
        setChannel(nextChannel);
      } catch (error) {
        if (!mounted) return;
        setError(error instanceof Error ? error.message : "Unable to prepare the meeting.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeRoom();

    return () => {
      mounted = false;
      nextCall?.leave().catch(() => undefined);
      nextVideoClient?.disconnectUser().catch(() => undefined);
      nextChatClient?.disconnectUser().catch(() => undefined);
    };
  }, [fallbackTitle, meetingId, roomMode, user]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3">
          <Loader2 className="h-5 w-5 animate-spin" />
          Connecting your meeting space...
        </div>
      </div>
    );
  }

  if (error || !videoClient || !call) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold font-heading">We couldn&apos;t open this meeting.</h1>
          <p className="mt-3 text-sm leading-6 text-white/65">{error || "The room is missing required configuration."}</p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Return to dashboard</Link>
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
    />
  );
}
