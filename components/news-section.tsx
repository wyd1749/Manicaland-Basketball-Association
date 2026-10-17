import Link from "next/link"

const news = [
  {
    title: "2026 season is underway",
    date: "October 2026",
    summary: "Teams across Manicaland are back on court. Follow fixtures and results as the season unfolds.",
    href: "/standings",
  },
  {
    title: "League standings updated",
    date: "October 2026",
    summary: "See who leads the table after the latest round of matches.",
    href: "/standings",
  },
  {
    title: "Meet the teams",
    date: "October 2026",
    summary: "Browse all 12 teams competing this season, with their players and results.",
    href: "/teams",
  },
]

export function NewsSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h2 className="font-sans text-3xl font-bold uppercase tracking-wide text-foreground">
          Latest <span className="text-primary">news</span>
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.title}
              className="rounded-md border border-border bg-card p-5"
            >
              <p className="font-sans text-xs uppercase tracking-widest text-primary">
                {item.date}
              </p>
              <h3 className="mt-2 font-sans text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
                {item.summary}
              </p>
              <Link
                href={item.href}
                className="mt-4 inline-block font-sans text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}