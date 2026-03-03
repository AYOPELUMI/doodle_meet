"use client"

import { X, Mic, MicOff, VideoIcon, VideoOff, Hand, MoreHorizontal, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import type { Participant } from "./participant-grid"

interface ParticipantsPanelProps {
  participants: Participant[]
  onClose: () => void
}

export function ParticipantsPanel({ participants, onClose }: ParticipantsPanelProps) {
  const [search, setSearch] = useState("")

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">
          Participants ({participants.length})
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close participants</span>
        </Button>
      </div>

      {/* Search */}
      <div className="border-b border-border px-4 py-2">
        <Input
          placeholder="Search participants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {/* List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {p.isSpeaking && (
                    <div className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{p.name}</span>
                    {i === 0 && <Crown className="h-3 w-3 text-accent" />}
                    {p.isHandRaised && <Hand className="h-3 w-3 text-accent" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {i === 0 ? "Host" : "Participant"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {p.isMuted ? (
                  <MicOff className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <Mic className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                {p.isVideoOn ? (
                  <VideoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <VideoOff className="h-3.5 w-3.5 text-destructive" />
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="border-t border-border p-3">
        <Button variant="outline" className="w-full text-sm" size="sm">
          Invite People
        </Button>
      </div>
    </div>
  )
}
