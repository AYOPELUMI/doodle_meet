const stats = [
  { value: "10M+", label: "Meetings hosted" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "150+", label: "Countries served" },
  { value: "4.9/5", label: "Average rating" },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-secondary/50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
