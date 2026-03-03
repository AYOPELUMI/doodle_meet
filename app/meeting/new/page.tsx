"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Video,
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  Settings,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewMeetingPage() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [copied, setCopied] = useState(false)
  const meetingCode = "abc-defg-hij"
  const meetingLink = `https://villeto.app/m/${meetingCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Video className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-[family-name:var(--font-heading)]">Villeto</span>
        </Link>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          {/* Video Preview */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-secondary">
              {isVideoOff ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground">
                    JD
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-bold text-muted-foreground">
                    JD
                  </div>
                </div>
              )}

              {/* Pre-call controls overlay */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 p-4">
                <Button
                  variant={isMuted ? "destructive" : "secondary"}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isVideoOff ? "destructive" : "secondary"}
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-4 w-4" />
                  ) : (
                    <VideoIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Microphone</Label>
                <Select defaultValue="default">
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Built-in Microphone</SelectItem>
                    <SelectItem value="headset">Headset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Camera</Label>
                <Select defaultValue="default">
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Built-in Camera</SelectItem>
                    <SelectItem value="external">External Camera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Meeting Info */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-3xl">
                Ready to join?
              </h1>
              <p className="mt-2 text-muted-foreground">
                Set up your audio and video before joining the meeting
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Meeting Name</Label>
              <Input
                defaultValue="Quick Meeting"
                className="h-11"
                placeholder="Enter meeting name..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Meeting Link</Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5">
                <code className="flex-1 truncate text-sm text-muted-foreground">
                  {meetingLink}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button size="lg" className="h-12 text-base" asChild>
                <Link href={`/meeting/${meetingCode}`}>
                  <VideoIcon className="mr-2 h-5 w-5" />
                  Join Meeting
                </Link>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You can invite others after joining
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
