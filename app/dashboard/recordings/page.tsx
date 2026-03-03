"use client"

import { Video, Download, Play, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recordings = [
  {
    id: 1,
    title: "Product Standup",
    date: "Feb 28, 2026",
    duration: "32:15",
    participants: 8,
    size: "245 MB",
  },
  {
    id: 2,
    title: "Design Review Sprint 14",
    date: "Feb 27, 2026",
    duration: "58:02",
    participants: 5,
    size: "412 MB",
  },
  {
    id: 3,
    title: "All Hands February",
    date: "Feb 25, 2026",
    duration: "1:12:30",
    participants: 45,
    size: "620 MB",
  },
]

export default function RecordingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-3xl">
          Recordings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Access and download your past meeting recordings
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {recordings.map((recording) => (
          <Card key={recording.id} className="transition-all hover:border-accent/30">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Video className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{recording.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {recording.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {recording.duration}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {recording.size}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Play
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
