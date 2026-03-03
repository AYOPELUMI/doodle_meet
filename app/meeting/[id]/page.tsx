"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MeetingControls } from "@/components/meeting/meeting-controls"
import { ParticipantGrid } from "@/components/meeting/participant-grid"
import type { Participant } from "@/components/meeting/participant-grid"
import { ChatPanel } from "@/components/meeting/chat-panel"
import { ParticipantsPanel } from "@/components/meeting/participants-panel"
import { SettingsDialog } from "@/components/meeting/settings-dialog"
import { LayoutGrid, GalleryHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "John Doe",
    avatar: "/images/participant-1.jpg",
    isMuted: false,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: "/images/participant-2.jpg",
    isMuted: false,
    isVideoOn: true,
    isSpeaking: true,
    isHandRaised: false,
    isPinned: false,
  },
  {
    id: "3",
    name: "Michael Torres",
    avatar: "/images/participant-3.jpg",
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: true,
    isPinned: false,
  },
  {
    id: "4",
    name: "Emily Park",
    avatar: "/images/participant-4.jpg",
    isMuted: false,
    isVideoOn: true,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
  },
  {
    id: "5",
    name: "David Kim",
    avatar: "",
    isMuted: true,
    isVideoOn: false,
    isSpeaking: false,
    isHandRaised: false,
    isPinned: false,
  },
]

export default function MeetingPage() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState("audio")
  const [layout, setLayout] = useState<"grid" | "spotlight">("grid")

  const handleOpenSettings = () => {
    setSettingsTab("audio")
    setIsSettingsOpen(true)
  }

  const handleOpenBackgroundFilters = () => {
    setSettingsTab("background")
    setIsSettingsOpen(true)
  }

  const handleLeave = () => {
    router.push("/dashboard")
  }

  const handleToggleChat = () => {
    setIsChatOpen(!isChatOpen)
    if (!isChatOpen) setIsParticipantsOpen(false)
  }

  const handleToggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen)
    if (!isParticipantsOpen) setIsChatOpen(false)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">Product Standup</h1>
            <span className="text-xs text-muted-foreground">
              {mockParticipants.length} participants
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={layout === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLayout("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={layout === "spotlight" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setLayout("spotlight")}
                >
                  <GalleryHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Spotlight view</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1 overflow-auto">
            <ParticipantGrid
              participants={mockParticipants}
              layout={layout}
              localVideoOff={isVideoOff}
            />
          </div>

          {/* Side Panels */}
          {isChatOpen && <ChatPanel onClose={() => setIsChatOpen(false)} />}
          {isParticipantsOpen && (
            <ParticipantsPanel
              participants={mockParticipants}
              onClose={() => setIsParticipantsOpen(false)}
            />
          )}
        </div>

        {/* Controls */}
        <MeetingControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isHandRaised={isHandRaised}
          isChatOpen={isChatOpen}
          isParticipantsOpen={isParticipantsOpen}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleVideo={() => setIsVideoOff(!isVideoOff)}
          onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
          onToggleHand={() => setIsHandRaised(!isHandRaised)}
          onToggleChat={handleToggleChat}
          onToggleParticipants={handleToggleParticipants}
          onOpenSettings={handleOpenSettings}
          onOpenBackgroundFilters={handleOpenBackgroundFilters}
          onLeave={handleLeave}
        />

        {/* Settings Dialog */}
        <SettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          activeTab={settingsTab}
        />
      </div>
    </TooltipProvider>
  )
}
