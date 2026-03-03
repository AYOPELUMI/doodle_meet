import {
  Video,
  Calendar,
  Shield,
  Sparkles,
  Users,
  MonitorSmartphone,
} from "lucide-react"

const features = [
  {
    icon: Video,
    title: "Crystal-Clear HD Video",
    description:
      "Enjoy meetings with stunning video quality that adapts to your bandwidth. Smart compression ensures smooth calls even on slower connections.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Schedule public or private meetings with a single click. Integrated calendar with timezone detection and automatic reminders.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "End-to-end encryption, password-protected rooms, and waiting rooms keep your conversations private and secure.",
  },
  {
    icon: Sparkles,
    title: "AI Background Filters",
    description:
      "Blur, replace, or enhance your background in real-time. AI-powered filters that look natural and professional.",
  },
  {
    icon: Users,
    title: "Large Meetings",
    description:
      "Host up to 100 participants with breakout rooms, polls, and Q&A. Perfect for webinars, all-hands, and workshops.",
  },
  {
    icon: MonitorSmartphone,
    title: "Screen Sharing",
    description:
      "Share your entire screen, a window, or a specific tab. Annotate in real-time and collaborate seamlessly.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">FEATURES</span>
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl lg:text-5xl">
            Everything you need for{" "}
            <span className="text-accent">better meetings</span>
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to make every meeting productive, engaging, and effortless.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-accent/10">
                <feature.icon className="h-6 w-6 text-foreground transition-colors group-hover:text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
