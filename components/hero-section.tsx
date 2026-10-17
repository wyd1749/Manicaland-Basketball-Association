import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, Star, Trophy, Users } from "lucide-react"

function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20" />
      <path d="M4.5 4.5c3.5 3 3.5 12 0 15M19.5 4.5c-3.5 3-3.5 12 0 15" />
    </svg>
  )
}

const stats = [
  { icon: BasketballIcon, title: "12 teams", note: "Competing for glory" },
  { icon: Trophy, title: "League & cup", note: "Multiple competitions" },
  { icon: Users, title: "Youth development", note: "Building the next generation" },
  { icon: Star, title: "Community impact", note: "Basketball for a better tomorrow" },
]

const values = ["Discipline", "Talent", "Unity"]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Player photo: file lives in /public/hero.png */}
      <div className="absolute inset-y-0 right-0 w-full opacity-40 md:w-[62%] md:opacity-100">
        <Image
          src="/hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 62vw, 100vw"
          className="object-cover object-[70%_center]"
        />
      </div>

      {/* Fade the photo into the page on the left and bottom */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent md:via-background/40 md:to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-background/90 to-transparent"
      />

      {/* Discipline / Talent / Unity */}
      <div className="absolute right-8 top-16 z-10 hidden xl:block">
        <ul className="space-y-1">
          {values.map((word) => (
            <li
              key={word}
              className="font-sans text-3xl font-bold uppercase leading-none tracking-wide text-foreground"
            >
              <span className="text-primary">{word[0]}</span>
              {word.slice(1)}
            </li>
          ))}
        </ul>
        <div className="mt-4 h-0.5 w-28 bg-primary" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-12 pt-14 md:min-h-[34rem] md:pt-20 lg:px-8">
        <div className="mb-4 flex items-center gap-4">
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary">2026 Season</p>
          <span aria-hidden className="hidden h-0.5 w-24 bg-primary sm:block" />
        </div>

        <h1 className="font-sans text-6xl font-bold uppercase leading-[0.9] sm:text-7xl lg:text-8xl">
          <span className="block bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Manicaland
          </span>
          <span className="block bg-gradient-to-b from-primary to-orange-600 bg-clip-text text-transparent">
            Basketball
          </span>
        </h1>

        <p className="mt-6 font-sans text-xl font-semibold uppercase tracking-[0.2em] text-foreground">
          More than a game
        </p>
        <p className="mt-3 max-w-md font-serif text-base leading-relaxed text-foreground/80">
          The Manicaland Basketball Association brings together teams, players and fans in a shared
          passion for basketball.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/teams"
            className="inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore teams
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/standings"
            className="inline-flex items-center gap-3 rounded-md border border-foreground/40 bg-background/60 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <BarChart3 className="size-4" aria-hidden />
            League standings
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 border-t border-border bg-background/90 backdrop-blur">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 lg:px-8">
          {stats.map(({ icon: Icon, title, note }) => (
            <li
              key={title}
              className="flex items-center gap-4 px-4 py-5 lg:border-l lg:border-border lg:first:border-l-0 lg:first:pl-0"
            >
              <Icon className="size-10 shrink-0 text-primary" aria-hidden />
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