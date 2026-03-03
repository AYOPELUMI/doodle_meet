"use client"

import {
  Mic,
  MicOff,
  VideoIcon,
  VideoOff,
  MonitorUp,
  MessageSquare,
  Users,
  Hand,
  MoreHorizontal,
  PhoneOff,
  Settings,
  Smile,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MeetingControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  isHandRaised: boolean
  isChatOpen: boolean
  isParticipantsOpen: boolean
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleScreenShare: () => void
  onToggleHand: () => void
  onToggleChat: () => void
  onToggleParticipants: () => void
  onOpenSettings: () => void
  onOpenBackgroundFilters: () => void
  onLeave: () => void
}

export function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isHandRaised,
  isChatOpen,
  isParticipantsOpen,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onOpenSettings,
  onOpenBackgroundFilters,
  onLeave,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 md:px-6">
      {/* Left - Meeting Info */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">1:23:45</span>
        <span className="text-xs text-border">|</span>
        <span className="text-xs text-muted-foreground">Product Standup</span>
      </div>

      {/* Center - Main Controls */}
      <div className="flex flex-1 items-center justify-center gap-2 md:gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="icon"
              className={cn("h-11 w-11 rounded-full", isMuted && "bg-destructive/90 hover:bg-destructive text-destructive-foreground")}
              onClick={onToggleMute}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="icon"
              className={cn("h-11 w-11 rounded-full", isVideoOff && "bg-destructive/90 hover:bg-destructive text-destructive-foreground")}
              onClick={onToggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isVideoOff ? "Turn on camera" : "Turn off camera"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={onToggleScreenShare}
            >
              <MonitorUp className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isScreenSharing ? "Stop sharing" : "Share screen"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isHandRaised ? "default" : "secondary"}
              size="icon"
              className={cn("h-11 w-11 rounded-full", isHandRaised && "bg-accent text-accent-foreground")}
              onClick={onToggleHand}
            >
              <Hand className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isHandRaised ? "Lower hand" : "Raise hand"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isChatOpen ? "default" : "secondary"}
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={onToggleChat}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chat</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isParticipantsOpen ? "default" : "secondary"}
              size="icon"
              className="h-11 w-11 rounded-full"
              onClick={onToggleParticipants}
            >
              <Users className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Participants</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-11 w-11 rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="center" className="w-56">
            <DropdownMenuItem onClick={onOpenBackgroundFilters} className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Background & Filters
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Smile className="h-4 w-4" />
              Reactions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings} className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="h-11 w-14 rounded-full"
              onClick={onLeave}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Leave meeting</TooltipContent>
        </Tooltip>
      </div>

      {/* Right - Empty for balance */}
      <div className="hidden w-24 md:block" />
    </div>
  )
}
