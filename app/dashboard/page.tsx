"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Video,
  Plus,
  Link2,
  Calendar,
  Clock,
  Users,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const upcomingMeetings = [
  {
    id: 1,
    title: "Product Standup",
    time: "10:00 AM",
    date: "Today",
    participants: 8,
    type: "recurring",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Design Review",
    time: "2:00 PM",
    date: "Today",
    participants: 5,
    type: "one-time",
    status: "upcoming",
  },
  {
    id: 3,
    title: "Sprint Planning",
    time: "9:00 AM",
    date: "Tomorrow",
    participants: 12,
    type: "recurring",
    status: "scheduled",
  },
  {
    id: 4,
    title: "Client Presentation",
    time: "3:30 PM",
    date: "Mar 5",
    participants: 6,
    type: "one-time",
    status: "scheduled",
  },
]

const recentMeetings = [
  { id: 1, title: "Team Sync", duration: "32 min", date: "Yesterday", participants: 6 },
  { id: 2, title: "1:1 with Sarah", duration: "25 min", date: "Yesterday", participants: 2 },
  { id: 3, title: "All Hands", duration: "58 min", date: "2 days ago", participants: 45 },
]

export default function DashboardPage() {
  const [joinCode, setJoinCode] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)
  const meetingLink = "https://villeto.app/m/abc-defg-hij"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-3xl">
          Good morning, John
        </h1>
        <p className="mt-1 text-muted-foreground">
          You have 2 meetings scheduled for today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group cursor-pointer transition-all hover:border-accent/40 hover:shadow-md">
          <Link href="/meeting/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">New Meeting</p>
                <p className="text-xs text-muted-foreground">Start an instant call</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="group cursor-pointer transition-all hover:border-accent/40 hover:shadow-md">
          <Link href="/dashboard/schedule">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform group-hover:scale-105">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Schedule</p>
                <p className="text-xs text-muted-foreground">Plan a future meeting</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="group transition-all hover:border-accent/40 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground transition-transform group-hover:scale-105">
              <Link2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Share Link</p>
              <div className="mt-1 flex items-center gap-1">
                <code className="truncate text-xs text-muted-foreground">
                  villeto.app/m/abc...
                </code>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Copy meeting link"
                >
                  {copiedLink ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-accent/40 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                <Video className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Join Meeting</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Enter code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="h-9 text-sm"
              />
              <Button size="sm" className="h-9 shrink-0" disabled={!joinCode} asChild>
                <Link href={joinCode ? `/meeting/${joinCode}` : "#"}>Join</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                Upcoming Meetings
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/schedule">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between rounded-xl border border-border p-4 transition-colors hover:bg-secondary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Video className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{meeting.title}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {meeting.time} - {meeting.date}
                          <span className="text-border">|</span>
                          <Users className="h-3 w-3" />
                          {meeting.participants} people
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.type === "recurring" && (
                        <Badge variant="secondary" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                      <Button size="sm" variant={meeting.date === "Today" ? "default" : "outline"} asChild>
                        <Link href={`/meeting/${meeting.id}`}>
                          {meeting.date === "Today" ? "Join" : "View"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Meetings */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                Recent Meetings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {recentMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting.duration} - {meeting.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {meeting.participants}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">12</p>
                  <p className="text-xs text-muted-foreground">Meetings</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">6.5h</p>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">34</p>
                  <p className="text-xs text-muted-foreground">Participants</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">3</p>
                  <p className="text-xs text-muted-foreground">Recordings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
