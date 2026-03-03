import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Now with AI-powered noise cancellation
            </span>
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-6xl lg:text-7xl">
            Video meetings{" "}
            <span className="text-accent">made simple</span>{" "}
            for everyone
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Connect with anyone, anywhere. Crystal-clear HD video, smart scheduling,
            background filters, and seamless collaboration tools — all in one place.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Start Free Meeting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="#features">
                <Play className="mr-2 h-4 w-4" />
                See How It Works
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Up to 100 participants
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              HD video quality
            </div>
          </div>
        </div>

        <div className="relative mt-16 lg:mt-20">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-foreground/5">
            <Image
              src="/images/hero-meeting.jpg"
              alt="Villeto video meeting interface showing a grid of participants in a professional call"
              width={1200}
              height={675}
              className="w-full"
              priority
            />
          </div>
          <div className="absolute -bottom-4 -left-4 -right-4 h-24 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}
