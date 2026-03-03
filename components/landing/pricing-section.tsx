import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal use and small teams getting started.",
    features: [
      "Up to 40-minute meetings",
      "Up to 10 participants",
      "HD video quality",
      "Screen sharing",
      "Chat messaging",
    ],
    cta: "Get Started",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per user/month",
    description: "For growing teams that need more power and flexibility.",
    features: [
      "Unlimited meeting duration",
      "Up to 100 participants",
      "4K video quality",
      "Background filters & effects",
      "Meeting recordings",
      "Custom branding",
      "Calendar integrations",
    ],
    cta: "Start Free Trial",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact sales",
    description: "For organizations with advanced security and compliance needs.",
    features: [
      "Everything in Pro",
      "Up to 500 participants",
      "SSO & SAML",
      "Advanced analytics",
      "Dedicated support",
      "99.99% uptime SLA",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">PRICING</span>
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Choose the plan that works best for your team. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.popular
                  ? "border-accent bg-card shadow-lg shadow-accent/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1">
                  <span className="text-xs font-semibold text-accent-foreground">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight font-[family-name:var(--font-heading)]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} className="w-full" asChild>
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
