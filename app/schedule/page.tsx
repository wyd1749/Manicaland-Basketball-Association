"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar, ChevronDown, MapPin, Radio, Trophy } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"
import { getGames } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { supabase } from "@/lib/supabase" // used for the real-time listener

// Page background image in the /public folder (change the extension here if needed)
const BANNER_IMAGE = "/schedule-banner.webp"
// Same public Supabase Storage bucket the Teams and Standings pages use for logos
const LOGO_BUCKET = "team-logos"

const currentSeason = "2026"

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
  logo?: string | null
  league?: string
}

interface Game {
  id: string
  homeTeamId: string
  awayTeamId: string
  homeScore: number | null
  awayScore: number | null
  date: string
  status: string
  venue: string
  season: string
}

type LeagueFilter = "all" | "major" | "mutare" | "mwl"

const LEAGUE_OPTIONS: { value: LeagueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "major", label: "Major" },
  { value: "mutare", label: "Mutare" },
  { value: "mwl", label: "Women's" },
]

/* A logo value can be: a full URL, a /public path like "/logos/cwb.png",
   or just a file name in the Supabase bucket like "cwb.png" (same as the Teams page). */
function logoUrl(logo?: string | null): string | null {
  if (!logo) return null
  if (/^https?:\/\//i.test(logo) || logo.startsWith("/")) return logo
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${logo}`
}

/* Accepts both camelCase rows (from lib/api) and snake_case rows (from Supabase real-time). */
function mapGame(row: Record<string, unknown>): Game {
  return {
    id: String(row.id),
    homeTeamId: String(row.home_team_id ?? row.homeTeamId ?? ""),
    awayTeamId: String(row.away_team_id ?? row.awayTeamId ?? ""),
    homeScore: (row.home_score ?? row.homeScore ?? null) as number | null,
    awayScore: (row.away_score ?? row.awayScore ?? null) as number | null,
    date: String(row.date ?? ""),
    status: String(row.status ?? "Scheduled"),
    venue: String(row.venue ?? ""),
    season: String(row.season ?? ""),
  }
}

function dayLabel(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
}

function monthLabel(key: string): string {
  const d = new Date(`${key}-01T12:00:00`)
  if (Number.isNaN(d.getTime())) return key
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

const teamColor = (team?: Team) => team?.color || "#f97316"

function cardStyle(color: string): React.CSSProperties {
  return {
    borderColor: color + "99",
    boxShadow: `0 0 18px ${color}30`,
    background: `linear-gradient(135deg, ${color}1f 0%, rgba(8,8,10,0.9) 55%)`,
  }
}

function TeamLogo({ team, size }: { team: Team; size: "md" | "lg" }) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl(team.logo)
  const color = teamColor(team)
  const box = size === "lg" ? "h-12 w-12" : "h-10 w-10"

  if (!src || failed) {
    return (
      <div
        className={`${box} flex shrink-0 items-center justify-center rounded-full font-sans text-sm font-bold`}
        style={{ backgroundColor: color + "30", color }}
      >
        {team.abbreviation?.charAt(0)}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${team.name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${box} shrink-0 object-contain`}
    />
  )
}

function SectionTitle({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        "mb-4 flex items-center gap-3 font-sans text-xl font-bold uppercase tracking-wide text-foreground",
        className
      )}
    >
      {icon}
      {children}
    </h2>
  )
}

function Venue({ venue }: { venue: string }) {
  if (!venue) return null
  return (
    <span className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
      {venue}
    </span>
  )
}

export default function SchedulePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedLeague, setSelectedLeague] = useState<LeagueFilter>("all")
  const [selectedMonth, setSelectedMonth] = useState("all")

  // 1. Initial data
  useEffect(() => {
    const client = createClient()
    Promise.all([getGames(), client.from("teams").select("*")])
      .then(([g, { data: teamsData, error: teamsError }]) => {
        if (teamsError) throw teamsError
        setGames((g as unknown as Record<string, unknown>[]).map(mapGame))
        setTeams(
          (teamsData ?? []).map((t) => ({
            id: String(t.id),
            name: t.name ?? "",
            abbreviation: t.abbreviation ?? "",
            color: t.color ?? "#f97316",
            logo: t.logo ?? t.logo_url ?? t.logo_path ?? null,
            league: t.league ?? "",
          }))
        )
      })
      .catch((err) => {
        console.error("Failed to load schedule:", err)
        setError("Could not load the schedule. Please refresh the page and try again.")
      })
      .finally(() => setLoading(false))
  }, [])

  // 2. Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("live-schedule-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "games" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const oldId = String((payload.old as Record<string, unknown>).id)
          setGames((prev) => prev.filter((g) => g.id !== oldId))
          return
        }
        const next = mapGame(payload.new as Record<string, unknown>)
        if (payload.eventType === "UPDATE") {
          setGames((prev) => prev.map((g) => (g.id === next.id ? next : g)))
        } else if (payload.eventType === "INSERT") {
          setGames((prev) => (prev.some((g) => g.id === next.id) ? prev : [...prev, next]))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const teamMap = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams])
  const getTeam = (id: string) => teamMap.get(String(id))

  const seasonGames = useMemo(() => games.filter((g) => g.season === currentSeason), [games])

  const months = useMemo(
    () => Array.from(new Set(seasonGames.map((g) => g.date.slice(0, 7)).filter(Boolean))).sort(),
    [seasonGames]
  )

  if (loading || error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 text-center">
          <div
            className={cn(
              "font-sans text-lg font-bold uppercase",
              error ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || "Loading..."}
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const leagueLabel = LEAGUE_OPTIONS.find((l) => l.value === selectedLeague)?.label ?? "All"

  const applyFilters = (list: Game[]) =>
    list.filter((g) => {
      if (selectedMonth !== "all" && g.date.slice(0, 7) !== selectedMonth) return false
      if (selectedLeague === "all") return true
      return [getTeam(g.homeTeamId), getTeam(g.awayTeamId)].some(
        (t) => t?.league?.toLowerCase() === selectedLeague
      )
    })

  const live = applyFilters(seasonGames.filter((g) => g.status === "Live" || g.status === "In Progress"))
  const upcoming = applyFilters(seasonGames.filter((g) => g.status === "Scheduled")).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
  const completed = applyFilters(seasonGames.filter((g) => g.status === "Final")).sort((a, b) =>
    b.date.localeCompare(a.date)
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative isolate flex-1 bg-background">
        {/* Page background: file lives in /public (see BANNER_IMAGE at the top) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] md:h-[46rem]"
        >
          <div
            className="absolute inset-0 bg-cover bg-[position:15%_top] bg-no-repeat md:bg-top"
            style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
        </div>

        {/* Title */}
        <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 lg:px-8">
          <p className="font-sans text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {currentSeason} Season
          </p>
          <h1 className="font-sans text-6xl font-bold uppercase italic leading-none tracking-tight text-foreground md:text-7xl">
            Schedule
          </h1>
          <p className="mt-3 max-w-sm text-base text-foreground/80">
            Catch all the action. Live games, upcoming fixtures and results from the {currentSeason} season.
          </p>
        </section>

        {/* Filter bar */}
        <section className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/70 p-3 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {LEAGUE_OPTIONS.map((lg) => (
                <button
                  key={lg.value}
                  type="button"
                  onClick={() => setSelectedLeague(lg.value)}
                  aria-pressed={selectedLeague === lg.value}
                  className={cn(
                    "rounded-full border px-5 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors",
                    selectedLeague === lg.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/60 text-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {lg.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Filter by month"
                className="appearance-none rounded-md border border-border bg-background/60 py-2 pl-9 pr-9 font-sans text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="all">All months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {monthLabel(m)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
            {/* LIVE */}
            {live.length > 0 && (
              <div>
                <SectionTitle
                  className="text-foreground"
                  icon={
                    <span className="relative flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                    </span>
                  }
                >
                  Live Games ({leagueLabel})
                </SectionTitle>
                <div className="space-y-4">
                  {live.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    return (
                      <div
                        key={game.id}
                        className="flex flex-col items-center gap-4 rounded-xl border-2 border-red-500/50 bg-gradient-to-r from-red-950/40 to-card/80 p-5 shadow-lg md:grid md:grid-cols-[1fr_auto_1fr]"
                      >
                        <div className="flex flex-col items-center gap-1 md:items-start">
                          <span className="flex items-center gap-2 font-sans text-sm font-bold uppercase text-red-500">
                            <Radio className="h-4 w-4 animate-pulse" aria-hidden />
                            Live Now
                          </span>
                          {game.venue && (
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {game.venue}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5">
                          <span
                            aria-hidden
                            className="hidden h-3 w-3 rounded-full sm:block"
                            style={{ backgroundColor: teamColor(home) }}
                          />
                          <TeamLogo team={home} size="lg" />
                          <span className="font-sans text-lg font-bold text-foreground">{home.abbreviation}</span>
                          <span className="font-sans text-3xl font-extrabold text-foreground">
                            {game.homeScore ?? 0}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="font-sans text-3xl font-extrabold text-foreground">
                            {game.awayScore ?? 0}
                          </span>
                          <span className="font-sans text-lg font-bold text-foreground">{away.abbreviation}</span>
                          <TeamLogo team={away} size="lg" />
                          <span
                            aria-hidden
                            className="hidden h-3 w-3 rounded-full sm:block"
                            style={{ backgroundColor: teamColor(away) }}
                          />
                        </div>

                        <div className="md:justify-self-end">
                          <span className="rounded-md bg-red-500/20 px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-red-500">
                            In Progress
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* UPCOMING */}
            {upcoming.length > 0 && (
              <div>
                <SectionTitle icon={<Calendar className="size-5 text-primary" aria-hidden />}>
                  Upcoming Games ({leagueLabel})
                </SectionTitle>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {upcoming.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    return (
                      <div
                        key={game.id}
                        className="rounded-xl border-2 p-4 transition-transform hover:-translate-y-0.5"
                        style={cardStyle(teamColor(home))}
                      >
                        <p className="flex items-center gap-2 text-xs text-foreground/80">
                          <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden />
                          {dayLabel(game.date)}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TeamLogo team={home} size="md" />
                            <span className="font-sans text-lg font-bold text-foreground">{home.abbreviation}</span>
                          </div>
                          <span className="font-sans text-sm font-bold uppercase text-primary">vs</span>
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-lg font-bold text-foreground">{away.abbreviation}</span>
                            <TeamLogo team={away} size="md" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Venue venue={game.venue} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* COMPLETED */}
            {completed.length > 0 && (
              <div>
                <SectionTitle icon={<Trophy className="size-5 text-primary" aria-hidden />}>
                  Completed Games ({leagueLabel})
                </SectionTitle>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {completed.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    const decided = game.homeScore !== null && game.awayScore !== null
                    const homeWon = decided && (game.homeScore as number) > (game.awayScore as number)
                    const awayWon = decided && (game.awayScore as number) > (game.homeScore as number)
                    return (
                      <div key={game.id} className="rounded-xl border-2 p-4" style={cardStyle(teamColor(home))}>
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-2 text-xs text-foreground/80">
                            <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden />
                            {dayLabel(game.date)}
                          </p>
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                            Final
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <TeamLogo team={home} size="md" />
                            <span
                              className={cn(
                                "font-sans text-lg font-bold",
                                homeWon ? "text-primary" : "text-foreground"
                              )}
                            >
                              {home.abbreviation}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-sans text-2xl font-bold">
                            <span className={homeWon ? "text-primary" : "text-foreground"}>{game.homeScore ?? "-"}</span>
                            <span className="text-sm text-muted-foreground">-</span>
                            <span className={awayWon ? "text-primary" : "text-foreground"}>{game.awayScore ?? "-"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "font-sans text-lg font-bold",
                                awayWon ? "text-primary" : "text-foreground"
                              )}
                            >
                              {away.abbreviation}
                            </span>
                            <TeamLogo team={away} size="md" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Venue venue={game.venue} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {live.length === 0 && upcoming.length === 0 && completed.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-sans text-xl font-bold uppercase text-muted-foreground">
                  No {leagueLabel} games found
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}