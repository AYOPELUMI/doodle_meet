"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Lock,
  Users,
  Video,
  Copy,
  Check,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"

const scheduledMeetings = [
  {
    id: 1,
    title: "Product Standup",
    date: "Mar 3, 2026",
    time: "10:00 AM",
    duration: "30 min",
    visibility: "private",
    participants: 8,
    recurring: true,
  },
  {
    id: 2,
    title: "Design Review",
    date: "Mar 3, 2026",
    time: "2:00 PM",
    duration: "1 hour",
    visibility: "public",
    participants: 5,
    recurring: false,
  },
  {
    id: 3,
    title: "Sprint Planning",
    date: "Mar 4, 2026",
    time: "9:00 AM",
    duration: "1.5 hours",
    visibility: "private",
    participants: 12,
    recurring: true,
  },
  {
    id: 4,
    title: "Client Presentation",
    date: "Mar 5, 2026",
    time: "3:30 PM",
    duration: "45 min",
    visibility: "private",
    participants: 6,
    recurring: false,
  },
  {
    id: 5,
    title: "Open Office Hours",
    date: "Mar 6, 2026",
    time: "4:00 PM",
    duration: "1 hour",
    visibility: "public",
    participants: 20,
    recurring: true,
  },
]

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [visibility, setVisibility] = useState<"public" | "private">("private")
  const [enableWaitingRoom, setEnableWaitingRoom] = useState(true)
  const [enableRecording, setEnableRecording] = useState(false)
  const [invitees, setInvitees] = useState<string[]>([])
  const [newInvitee, setNewInvitee] = useState("")
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const addInvitee = () => {
    if (newInvitee.trim() && !invitees.includes(newInvitee.trim())) {
      setInvitees([...invitees, newInvitee.trim()])
      setNewInvitee("")
    }
  }

  const removeInvitee = (email: string) => {
    setInvitees(invitees.filter((i) => i !== email))
  }

  const handleCopy = (id: number) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-3xl">
          Schedule Meetings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create and manage your upcoming meetings
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create Meeting</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({scheduledMeetings.length})</TabsTrigger>
        </TabsList>

        {/* Create Meeting Tab */}
        <TabsContent value="create">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-[family-name:var(--font-heading)]">
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="title">Meeting Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Weekly Team Standup"
                        className="h-11"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add meeting agenda or notes..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label>Date</Label>
                        <Button
                          variant="outline"
                          className="h-11 w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }) : "Select date"}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Time</Label>
                        <Select defaultValue="10:00">
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i % 12 === 0 ? 12 : i % 12
                              const period = i < 12 ? "AM" : "PM"
                              return [`${hour}:00 ${period}`, `${hour}:30 ${period}`]
                            })
                              .flat()
                              .map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>Duration</Label>
                      <Select defaultValue="30">
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Visibility */}
                    <div className="flex flex-col gap-4">
                      <Label className="text-base font-semibold">Meeting Visibility</Label>
                      <div className="grid gap-3 md:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setVisibility("public")}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            visibility === "public"
                              ? "border-accent bg-accent/5 ring-1 ring-accent"
                              : "border-border hover:border-accent/30"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            visibility === "public" ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                          }`}>
                            <Globe className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Public</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Anyone with the link can join
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVisibility("private")}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            visibility === "private"
                              ? "border-accent bg-accent/5 ring-1 ring-accent"
                              : "border-border hover:border-accent/30"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            visibility === "private" ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                          }`}>
                            <Lock className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Private</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Only invited participants can join
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Invitees */}
                    <div className="flex flex-col gap-3">
                      <Label className="text-base font-semibold">Invite Participants</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email address"
                          value={newInvitee}
                          onChange={(e) => setNewInvitee(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInvitee())}
                          className="h-10"
                        />
                        <Button type="button" size="sm" className="h-10" onClick={addInvitee}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {invitees.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {invitees.map((email) => (
                            <Badge
                              key={email}
                              variant="secondary"
                              className="gap-1.5 py-1 pl-3 pr-1.5"
                            >
                              {email}
                              <button
                                type="button"
                                onClick={() => removeInvitee(email)}
                                className="rounded-full p-0.5 hover:bg-foreground/10"
                                aria-label={`Remove ${email}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Settings */}
                    <div className="flex flex-col gap-4">
                      <Label className="text-base font-semibold">Meeting Settings</Label>
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Waiting Room</p>
                            <p className="text-xs text-muted-foreground">
                              Approve participants before they join
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={enableWaitingRoom}
                          onCheckedChange={setEnableWaitingRoom}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Auto-Record</p>
                            <p className="text-xs text-muted-foreground">
                              Automatically record this meeting
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={enableRecording}
                          onCheckedChange={setEnableRecording}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button className="flex-1" size="lg">
                        Schedule Meeting
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link href="/dashboard">Cancel</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-[family-name:var(--font-heading)]">
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming">
          <div className="flex flex-col gap-4">
            {scheduledMeetings.map((meeting) => (
              <Card key={meeting.id} className="transition-all hover:border-accent/30">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Video className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{meeting.title}</p>
                        {meeting.recurring && (
                          <Badge variant="secondary" className="text-xs">Recurring</Badge>
                        )}
                        <Badge
                          variant={meeting.visibility === "public" ? "outline" : "secondary"}
                          className="gap-1 text-xs"
                        >
                          {meeting.visibility === "public" ? (
                            <Globe className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {meeting.visibility === "public" ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.time} ({meeting.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.participants} invited
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(meeting.id)}
                      aria-label="Copy meeting link"
                    >
                      {copiedId === meeting.id ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/meeting/${meeting.id}`}>Join</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
