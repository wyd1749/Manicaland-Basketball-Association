import Link from "next/link"
import { Trophy, Users, Sprout, Star } from "lucide-react"

/*
  Hero in the style of concept design 2.
  Put a player photo at /public/hero.jpg (landscape, dark background works best).
  If the file is missing the hero still looks fine: you just get the dark gradient and orange stripes.
*/

const stats = [
  { icon: Users, title: "12 teams", note: "Competing for glory" },
  { icon: Trophy, title: "League and cup", note: "Multiple competitions" },
  { icon: Sprout, title: "Youth development", note: "Building the next generation" },
  { icon: Star, title: "Community impact", note: "Basketball for a better tomorrow" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Photo */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-full bg-cover bg-[position:70%_center] opacity-50 md:w-3/5 md:opacity-100"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      />
      {/* Fade the photo into the page on the left and bottom */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent md:via-background/60"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
      />
      {/* Diagonal orange accents */}
      <div
        aria-hidden
        className="absolute -right-24 top-0 hidden h-full w-40 -skew-x-[24deg] bg-primary/90 md:block"
      />
      <div
        aria-hidden
        className="absolute right-24 top-0 hidden h-full w-6 -skew-x-[24deg] bg-primary/40 md:block"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col px-4 pb-10 pt-14 md:min-h-[34rem] md:pt-20 lg:px-8">
        <p className="mb-4 font-sans text-sm tracking-[0.3em] text-primary">2026 Season</p>

        <h1 className="font-sans text-6xl font-bold uppercase leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
          Manicaland
          <span className="block text-primary">Basketball</span>
        </h1>

        <p className="mt-6 font-sans text-xl font-semibold uppercase tracking-[0.2em] text-foreground">
          More than a game
        </p>
        <p className="mt-3 max-w-md font-serif text-base leading-relaxed text-muted-foreground">
          The Manicaland Basketball Association brings together teams, players and fans in a shared
          passion for basketball.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/teams"
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore teams
          </Link>
          <Link
            href="/standings"
            className="inline-flex items-center rounded-md border border-foreground/40 bg-background/40 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            League standings
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-border bg-card/80 backdrop-blur">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-5 lg:grid-cols-4 lg:px-8">
          {stats.map(({ icon: Icon, title, note }) => (
            <li key={title} className="flex items-center gap-3">
              <Icon className="size-8 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-sans text-sm font-semibold uppercase tracking-wide text-foreground">
                  {title}
                </p>
                <p className="font-serif text-xs text-muted-foreground">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}