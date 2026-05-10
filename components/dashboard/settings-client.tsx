"use client";

import { useState } from "react";
import { Bell, CalendarDays, Mail, Save, Shield, User, Waves } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type IntegrationRow = {
  provider: string;
  status?: string | null;
  external_email?: string | null;
  last_sync_at?: string | null;
};

type SettingsClientProps = {
  profile: Record<string, unknown> | null;
  integrations: IntegrationRow[];
};

const timezones = [
  "Africa/Lagos",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Tokyo",
];

export function SettingsClient({ profile, integrations }: SettingsClientProps) {
  const [fullName, setFullName] = useState(String(profile?.full_name ?? ""));
  const [timezone, setTimezone] = useState(String(profile?.timezone ?? "Africa/Lagos"));
  const [preferredCalendarProvider, setPreferredCalendarProvider] = useState(
    String(profile?.preferred_calendar_provider ?? "none"),
  );
  const [notifyMeetingReminders, setNotifyMeetingReminders] = useState(Boolean(profile?.notify_meeting_reminders ?? true));
  const [notifyChatMessages, setNotifyChatMessages] = useState(Boolean(profile?.notify_chat_messages ?? true));
  const [notifyRecordingReady, setNotifyRecordingReady] = useState(Boolean(profile?.notify_recording_ready ?? true));
  const [notifyTranscriptReady, setNotifyTranscriptReady] = useState(Boolean(profile?.notify_transcript_ready ?? true));
  const [inviteOneClickJoin, setInviteOneClickJoin] = useState(Boolean(profile?.invite_one_click_join ?? true));
  const [autoSyncCalendar, setAutoSyncCalendar] = useState(Boolean(profile?.auto_sync_calendar ?? false));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          timezone,
          preferredCalendarProvider,
          notifyMeetingReminders,
          notifyChatMessages,
          notifyRecordingReady,
          notifyTranscriptReady,
          inviteOneClickJoin,
          autoSyncCalendar,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save settings.");
      toast.success("Settings updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40">
        <p className="text-sm uppercase tracking-[0.25em] text-teal-700">Account orchestration</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl">
          Presence, sync, and delivery settings
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Control how your profile appears, how calendar providers sync, and whether invite emails, transcripts, and recordings reach people automatically.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-heading)]">
                <User className="h-4 w-4" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium">Presence status</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Last seen: {profile?.last_seen_at ? new Date(String(profile.last_seen_at)).toLocaleString() : "Not tracked yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-heading)]">
                <Bell className="h-4 w-4" />
                Notification preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Meeting reminders", "Before a scheduled meeting starts", notifyMeetingReminders, setNotifyMeetingReminders],
                ["Chat messages", "When someone pings you in a room", notifyChatMessages, setNotifyChatMessages],
                ["Recording ready", "When a recording ingestion finishes", notifyRecordingReady, setNotifyRecordingReady],
                ["Transcript ready", "When transcript processing completes", notifyTranscriptReady, setNotifyTranscriptReady],
                ["One-click join invites", "Embed secure quick-join links in invite emails", inviteOneClickJoin, setInviteOneClickJoin],
              ].map(([label, desc, value, setter]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{String(label)}</p>
                    <p className="text-xs text-muted-foreground">{String(desc)}</p>
                  </div>
                  <Switch checked={Boolean(value)} onCheckedChange={setter as (checked: boolean) => void} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-heading)]">
                <CalendarDays className="h-4 w-4" />
                Calendar providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred provider</Label>
                <Select value={preferredCalendarProvider} onValueChange={setPreferredCalendarProvider}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Auto-sync scheduled meetings</p>
                  <p className="text-xs text-muted-foreground">Queue outbound calendar jobs when a meeting is created.</p>
                </div>
                <Switch checked={autoSyncCalendar} onCheckedChange={setAutoSyncCalendar} />
              </div>
              <div className="space-y-3">
                {integrations.length ? (
                  integrations.map((integration) => (
                    <div key={`${integration.provider}-${integration.external_email ?? "local"}`} className="rounded-[1.25rem] border border-slate-200 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{integration.provider}</p>
                        <span className="text-xs text-muted-foreground">{integration.status || "available"}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {integration.external_email || "No external address stored yet"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No provider links yet. Saving a preferred provider seeds the sync table.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-heading)]">
                <Waves className="h-4 w-4" />
                Automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium">Recordings and transcripts</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Meeting jobs now support recording ingestion and transcript persistence via Supabase queue tables and Stream webhook processing.
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-medium">Invite email delivery</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Invite rows create pending email jobs with one-click tokens that a worker or edge function can send later.
                </p>
              </div>
              <Button className="w-full rounded-xl" size="lg" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save settings"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-[family-name:var(--font-heading)]">
                <Shield className="h-4 w-4" />
                Delivery model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Frontend persists invite, sync, transcript, and recording intents to Supabase tables.</p>
              <p>Edge functions or workers can safely process those queues later without changing the UI contract.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
