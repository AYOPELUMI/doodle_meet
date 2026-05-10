"use client";

import Link from "next/link";
import { Calendar, Clock, Download, FileText, Play, Radio, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RecordingRow = {
  id: number | string;
  meeting_id?: string | null;
  stream_call_cid?: string | null;
  url?: string | null;
  duration_seconds?: number | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
  transcript_status?: string | null;
  meeting?: {
    title?: string | null;
  } | null;
};

type TranscriptRow = {
  id: number | string;
  meeting_id?: string | null;
  content?: string | null;
  summary?: string | null;
  language?: string | null;
  status?: string | null;
  created_at?: string | null;
  meeting?: {
    title?: string | null;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "Unknown duration";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function RecordingsClient({
  recordings,
  transcripts,
}: {
  recordings: RecordingRow[];
  transcripts: TranscriptRow[];
}) {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/40">
        <p className="text-sm uppercase tracking-[0.25em] text-teal-700">Captured knowledge</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl">
          Recordings and transcripts
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review completed recordings, track ingestion state, and keep transcripts close to the meeting that produced them.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-heading)]">Recording library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recordings.length ? (
                recordings.map((recording) => (
                  <div key={recording.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Video className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{recording.meeting?.title || "Meeting recording"}</p>
                          <Badge variant="secondary" className="rounded-full">Recording</Badge>
                          {recording.transcript_status && (
                            <Badge variant="outline" className="rounded-full">{recording.transcript_status}</Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(recording.started_at || recording.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(recording.duration_seconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {recording.url ? (
                        <>
                          <Button variant="outline" size="sm" className="rounded-full" asChild>
                            <a href={recording.url} target="_blank" rel="noreferrer">
                              <Play className="mr-2 h-3.5 w-3.5" />
                              Watch
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-full" asChild>
                            <a href={recording.url} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-3.5 w-3.5" />
                              Download
                            </a>
                          </Button>
                        </>
                      ) : (
                        <Badge variant="secondary" className="rounded-full">Ingestion pending</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <Radio className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-sm font-medium">No recordings yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Turn on auto-record for scheduled meetings and completed captures will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-xl shadow-slate-200/40">
            <CardHeader>
              <CardTitle className="font-[family-name:var(--font-heading)]">Transcript feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transcripts.length ? (
                transcripts.map((transcript) => (
                  <div key={transcript.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-cyan-700" />
                      <p className="font-medium">{transcript.meeting?.title || "Meeting transcript"}</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {transcript.language || "en"} • {transcript.status || "processing"} • {formatDate(transcript.created_at)}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">
                      {transcript.summary || transcript.content || "Transcript content will appear here after ingestion completes."}
                    </p>
                    {transcript.meeting_id && (
                      <Button variant="ghost" size="sm" className="mt-3 rounded-full px-0" asChild>
                        <Link href={`/meeting/${transcript.meeting_id}`}>Open related room</Link>
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Transcript summaries will appear here once meeting transcription jobs finish.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
