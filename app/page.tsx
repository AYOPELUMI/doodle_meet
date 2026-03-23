import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import GoogleOneTap from "@/components/google/GoogleOneTap"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <GoogleOneTap />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
