"use client"

import { useState } from "react"
import {
  Mic,
  VideoIcon,
  Volume2,
  Sun,
  ImageIcon,
  Sparkles,
  Check,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab?: string
}

const backgrounds = [
  { id: "none", label: "None", color: "bg-muted" },
  { id: "blur-light", label: "Light Blur", color: "bg-muted" },
  { id: "blur-heavy", label: "Heavy Blur", color: "bg-secondary" },
  { id: "office", label: "Office", color: "bg-accent/20" },
  { id: "nature", label: "Nature", color: "bg-success/20" },
  { id: "abstract", label: "Abstract", color: "bg-primary/10" },
]

export function SettingsDialog({ open, onOpenChange, activeTab = "audio" }: SettingsDialogProps) {
  const [selectedBg, setSelectedBg] = useState("none")
  const [noiseSuppression, setNoiseSuppression] = useState(true)
  const [hdVideo, setHdVideo] = useState(true)
  const [autoFraming, setAutoFraming] = useState(true)
  const [mirrorVideo, setMirrorVideo] = useState(true)
  const [brightness, setBrightness] = useState([50])
  const [touchUpLevel, setTouchUpLevel] = useState([30])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-heading)]">
            Meeting Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audio" className="gap-1.5">
              <Mic className="h-3.5 w-3.5" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5">
              <VideoIcon className="h-3.5 w-3.5" />
              Video
            </TabsTrigger>
            <TabsTrigger value="background" className="gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />
              Background
            </TabsTrigger>
          </TabsList>

          {/* Audio Tab */}
          <TabsContent value="audio" className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Microphone</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default - Built-in Microphone</SelectItem>
                  <SelectItem value="headset">Headset Microphone</SelectItem>
                  <SelectItem value="external">External USB Microphone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Speaker</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default - Built-in Speakers</SelectItem>
                  <SelectItem value="headset">Headset Audio</SelectItem>
                  <SelectItem value="bluetooth">Bluetooth Speaker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Label>Speaker Volume</Label>
              </div>
              <Slider defaultValue={[75]} max={100} step={1} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">AI Noise Suppression</p>
                  <p className="text-xs text-muted-foreground">
                    Automatically remove background noise
                  </p>
                </div>
              </div>
              <Switch
                checked={noiseSuppression}
                onCheckedChange={setNoiseSuppression}
              />
            </div>
          </TabsContent>

          {/* Video Tab */}
          <TabsContent value="video" className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Camera</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default - Built-in Camera</SelectItem>
                  <SelectItem value="external">External USB Camera</SelectItem>
                  <SelectItem value="virtual">Virtual Camera</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Camera Preview */}
            <div className="aspect-video overflow-hidden rounded-xl bg-secondary">
              <div className="flex h-full items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                  JD
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">HD Video</p>
                  <p className="text-xs text-muted-foreground">Use high-definition video quality</p>
                </div>
                <Switch checked={hdVideo} onCheckedChange={setHdVideo} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Auto-Framing</p>
                  <p className="text-xs text-muted-foreground">Keep you centered in the frame</p>
                </div>
                <Switch checked={autoFraming} onCheckedChange={setAutoFraming} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Mirror Video</p>
                  <p className="text-xs text-muted-foreground">Show mirrored self-view</p>
                </div>
                <Switch checked={mirrorVideo} onCheckedChange={setMirrorVideo} />
              </div>
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="mt-4 flex flex-col gap-5">
            {/* Preview */}
            <div className="aspect-video overflow-hidden rounded-xl bg-secondary">
              <div className="flex h-full items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
                  JD
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold">Virtual Background</Label>
              <div className="grid grid-cols-3 gap-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id)}
                    className={cn(
                      "relative flex h-16 items-center justify-center rounded-lg border transition-all",
                      bg.color,
                      selectedBg === bg.id
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-border hover:border-accent/30"
                    )}
                  >
                    <span className="text-xs font-medium">{bg.label}</span>
                    {selectedBg === bg.id && (
                      <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                        <Check className="h-2.5 w-2.5 text-accent-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Label>Brightness Adjustment</Label>
              </div>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                max={100}
                step={1}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <Label>Touch Up Appearance</Label>
              </div>
              <Slider
                value={touchUpLevel}
                onValueChange={setTouchUpLevel}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
