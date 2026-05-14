import z from "zod";

export const scheduleMeetingSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(500).optional().default(""),
  roomMode: z.enum(["video", "audio"]).default("video"),
  visibility: z.enum(["public", "private"]).default("private"),
  audience: z.enum(["anyone", "authenticated"]).default("anyone"),
  scheduledFor: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(15).max(240),
  enableWaitingRoom: z.boolean().default(true),
  enableRecording: z.boolean().default(false),
  enableTranscription: z.boolean().default(false),
  hostMode: z.enum(["open", "scheduled"]).default("scheduled"),
  coHosts: z.array(z.string().email()).default([]),
  invitees: z.array(z.string().email()).default([]),
  calendarProvider: z.enum(["none", "google", "outlook"]).default("none"),
});

export type ScheduleMeetingInput = z.infer<typeof scheduleMeetingSchema>;

export const updateMeetingSchema = z.object({
  title: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  audience: z.enum(["anyone", "authenticated"]).optional(),
  hostMode: z.enum(["open", "scheduled"]).optional(),
  scheduledFor: z.string().nullable().optional(),
  status: z.enum(["live", "scheduled", "ended", "cancelled"]).optional(),
  coHosts: z.array(z.string().email()).optional(),
});

export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;

export const settingsSchema = z.object({
  fullName: z.string().min(2).max(120),
  timezone: z.string().min(1),
  preferredCalendarProvider: z.enum(["none", "google", "outlook"]).default("none"),
  notifyMeetingReminders: z.boolean().default(true),
  notifyChatMessages: z.boolean().default(true),
  notifyRecordingReady: z.boolean().default(true),
  notifyTranscriptReady: z.boolean().default(true),
  inviteOneClickJoin: z.boolean().default(true),
  autoSyncCalendar: z.boolean().default(false),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
