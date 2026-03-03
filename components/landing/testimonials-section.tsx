import Image from "next/image"
import { Star } from "lucide-react"

const mosaicImages = [
  { src: "/images/mosaic-1.jpg", alt: "Team meeting in conference room" },
  { src: "/images/mosaic-2.jpg", alt: "Collaborative workspace" },
  { src: "/images/mosaic-3.jpg", alt: "Remote video call setup" },
  { src: "/images/mosaic-4.jpg", alt: "Creative office environment" },
  { src: "/images/mosaic-5.jpg", alt: "Business presentation" },
  { src: "/images/mosaic-6.jpg", alt: "Casual team discussion" },
]

const testimonials = [
  {
    quote:
      "Villeto completely transformed how our remote team communicates. The video quality is unmatched and the scheduling features save us hours every week.",
    name: "James David",
    role: "CEO, Banex Finances",
    avatar: "/images/testimonial-1.jpg",
  },
  {
    quote:
      "We switched from our previous provider and haven't looked back. The background filters are incredibly natural and the meeting controls are intuitive.",
    name: "Sarah Chen",
    role: "CTO, TechFlow Inc",
    avatar: "/images/testimonial-2.jpg",
  },
  {
    quote:
      "The enterprise security features give us confidence for sensitive discussions. End-to-end encryption and waiting rooms are exactly what we needed.",
    name: "Michael Torres",
    role: "VP Engineering, CloudSync",
    avatar: "/images/testimonial-3.jpg",
  },
]

function StarRating() {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-accent text-accent" />
      ))}
    </div>
  )
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Photo Mosaic */}
        <div className="mb-16 grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
          {mosaicImages.map((image, i) => (
            <div
              key={image.src}
              className={`overflow-hidden rounded-xl ${
                i % 3 === 1 ? "row-span-2" : ""
              } ${i >= 3 ? "hidden md:block" : ""}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={300}
                height={i % 3 === 1 ? 400 : 200}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>

        {/* Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">TESTIMONIALS</span>
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl lg:text-5xl">
            Trusted by Teams Everywhere
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            {"Don't just take our word for it, discover how Villeto helps businesses save time, reduce errors, and stay in control."}
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8"
            >
              <div>
                <StarRating />
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {`"${testimonial.quote}"`}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={44}
                  height={44}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
