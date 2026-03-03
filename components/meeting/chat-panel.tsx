"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  sender: string
  text: string
  time: string
  isOwn: boolean
}

const initialMessages: Message[] = [
  { id: "1", sender: "Sarah Chen", text: "Hey everyone, let me share my screen for the demo", time: "1:15 PM", isOwn: false },
  { id: "2", sender: "You", text: "Sounds good! Ready when you are", time: "1:16 PM", isOwn: true },
  { id: "3", sender: "Michael Torres", text: "Can everyone see the slides?", time: "1:17 PM", isOwn: false },
  { id: "4", sender: "Sarah Chen", text: "Yes, looks great on my end. The new design is looking really clean", time: "1:18 PM", isOwn: false },
  { id: "5", sender: "You", text: "Looking great! Love the new color palette", time: "1:19 PM", isOwn: true },
]

interface ChatPanelProps {
  onClose: () => void
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return
    const msg: Message = {
      id: String(messages.length + 1),
      sender: "You",
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      isOwn: true,
    }
    setMessages([...messages, msg])
    setNewMessage("")
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">In-Call Chat</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
            >
              {!msg.isOwn && (
                <span className="mb-1 text-xs font-medium text-muted-foreground">
                  {msg.sender}
                </span>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  msg.isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {msg.text}
              </div>
              <span className="mt-1 text-[10px] text-muted-foreground">{msg.time}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" type="button">
            <Smile className="h-4 w-4" />
            <span className="sr-only">Emoji</span>
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="h-9 text-sm"
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!newMessage.trim()}
            type="submit"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
