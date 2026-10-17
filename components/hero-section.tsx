"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, Star, Trophy, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

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

const staticStats = [
  { icon: Trophy, title: "League & cup", note: "Multiple competitions" },
  { icon: Users, title: "Youth development", note: "Building the next generation" },
  { icon: Star, title: "Community impact", note: "Basketball for a better tomorrow" },
]

const values = ["Discipline", "Talent", "Unity"]

export function HeroSection() {
  // Real number of teams from the database (null while loading)
  const [teamCount, setTeamCount] = useState<number | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          console.error("Supabase teams count error:", error.message)
          return
        }
        setTeamCount(count ?? 0)
      })
  }, [])

  const stats = [
    {
      icon: BasketballIcon,
      title: teamCount === null ? "Teams" : `${teamCount} ${teamCount === 1 ? "team" : "teams"}`,
      note: "Competing for glory",
    },
    ...staticStats,
  ]

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Player photo: file lives in /public/hero.png.
          Mobile: shown in full above the text. Desktop: fills the right side behind the text. */}
      <div className="relative w-full overflow-hidden md:absolute md:inset-y-0 md:right-0 md:w-[62%]">
        <Image
          src="/hero.png"
          alt="Manicaland Basketball Association player with the ball"
          width={1600}
          height={900}
          priority
          sizes="(min-width: 768px) 62vw, 100vw"
          className="hero-zoom h-auto w-full md:h-full md:object-cover md:object-[70%_center]"
        />
        {/* Mobile only: fade the bottom of the photo into the page */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent md:hidden"
        />
      </div>

      {/* Desktop only: fade the photo into the page on the left and bottom */}
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-background via-background/40 to-transparent md:block"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 hidden h-1/5 bg-gradient-to-t from-background/90 to-transparent md:block"
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
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-4 pb-12 pt-4 md:min-h-[34rem] md:pt-20 lg:px-8">
        <div className="mb-4 flex items-center gap-4">
          <p className="font-sans text-sm uppercase tracking-[0.3em] text-primary">2026/27 Season</p>
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