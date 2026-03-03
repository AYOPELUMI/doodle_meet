"use client"

import Image from "next/image"
import { Mic, MicOff, Pin, Hand } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Participant {
  id: string
  name: string
  avatar: string
  isMuted: boolean
  isVideoOn: boolean
  isSpeaking: boolean
  isHandRaised: boolean
  isPinned: boolean
}

interface ParticipantGridProps {
  participants: Participant[]
  layout: "grid" | "spotlight"
  localVideoOff: boolean
}

function ParticipantTile({
  participant,
  isLarge = false,
}: {
  participant: Participant
  isLarge?: boolean
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-secondary transition-all",
        participant.isSpeaking && "ring-2 ring-accent ring-offset-2 ring-offset-background",
        isLarge ? "aspect-video" : "aspect-video"
      )}
    >
      {participant.isVideoOn ? (
        <Image
          src={participant.avatar}
          alt={participant.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-secondary">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground md:h-20 md:w-20">
            {participant.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      )}

      {/* Overlay - Name & Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/60 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-card md:text-sm">{participant.name}</span>
            {participant.isHandRaised && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                <Hand className="h-3 w-3 text-accent-foreground" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {participant.isMuted ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/80">
                <MicOff className="h-3 w-3 text-card" />
              </div>
            ) : (
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                participant.isSpeaking ? "bg-success" : "bg-foreground/30"
              )}>
                <Mic className="h-3 w-3 text-card" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pin button on hover */}
      <button
        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/30 text-card opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Pin participant"
      >
        <Pin className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function ParticipantGrid({
  participants,
  layout,
  localVideoOff,
}: ParticipantGridProps) {
  if (layout === "spotlight" && participants.length > 1) {
    const speaker = participants.find((p) => p.isSpeaking) || participants[0]
    const others = participants.filter((p) => p.id !== speaker.id)

    return (
      <div className="flex h-full flex-col gap-3 p-3 lg:flex-row">
        {/* Main Speaker */}
        <div className="flex-1">
          <ParticipantTile participant={speaker} isLarge />
        </div>
        {/* Sidebar */}
        <div className="flex gap-3 overflow-auto lg:w-52 lg:flex-col">
          {others.map((p) => (
            <div key={p.id} className="w-40 shrink-0 lg:w-full">
              <ParticipantTile participant={p} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const gridCols =
    participants.length <= 1
      ? "grid-cols-1"
      : participants.length <= 4
        ? "grid-cols-1 md:grid-cols-2"
        : participants.length <= 9
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"

  return (
    <div className={cn("grid h-full gap-3 p-3", gridCols)}>
      {participants.map((p) => (
        <ParticipantTile key={p.id} participant={p} />
      ))}
    </div>
  )
}
