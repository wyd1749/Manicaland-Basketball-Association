"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Calendar, MapPin, Radio } from "lucide-react" // Added Radio icon
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { getGames, getTeams } from "@/lib/api"
import { supabase } from "@/lib/supabase" // Make sure your path matches where supabase client is exported

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
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

export default function SchedulePage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeague, setSelectedLeague] = useState<"all" | "major" | "mutare" | "mwl">("all")

  // 1. Initial Data Fetching
  useEffect(() => {
    Promise.all([getGames(), getTeams()]).then(([g, t]) => {
      setGames(g)
      setTeams(t)
      setLoading(false)
    })
  }, [])

  // 2. Real-Time Listener via Supabase
  useEffect(() => {
    const channel = supabase
      .channel("live-schedule-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "games" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setGames((prev) =>
              prev.map((g) => (g.id === payload.new.id ? (payload.new as Game) : g))
            )
          } else if (payload.eventType === "INSERT") {
            setGames((prev) => [...prev, payload.new as Game])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="font-sans text-lg font-bold uppercase text-muted-foreground">Loading...</div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const getTeam = (id: string) => teams.find((t) => String(t.id) === String(id))

  const getLeagueDisplay = (league: string): string => {
    const map: Record<string, string> = { all: "All", major: "Major", mutare: "Mutare", mwl: "Women's" }
    return map[league] || league
  }

  const seasonGames = games.filter((g) => String(g.season) === "2026")

  // --- UPDATED STATUS FILTERS ---
  const allLive = seasonGames.filter(
    (g) => g.status === "Live" || g.status === "In Progress"
  )
  const allCompleted = seasonGames.filter((g) => g.status === "Final")
  const allUpcoming = seasonGames.filter((g) => g.status === "Scheduled")

  const filterByLeague = (list: Game[]) =>
    list.filter(
      (g) =>
        selectedLeague === "all" ||
        getTeam(g.homeTeamId)?.league === selectedLeague ||
        getTeam(g.awayTeamId)?.league === selectedLeague
    )

  const filteredLive = filterByLeague(allLive)
  const filteredCompleted = filterByLeague(allCompleted)
  const filteredUpcoming = filterByLeague(allUpcoming)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <img src="/logo13.png" alt="" className="h-full w-full object-contain" />
        </div>

        <section className="border-b border-border bg-secondary py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              {new Date().getFullYear()} Season
            </p>
            <h1 className="mt-1 font-sans text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Schedule
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Complete game schedule with results and upcoming fixtures.
            </p>
          </div>
        </section>

        <div className="py-8 bg-secondary/50">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <ToggleGroup
              type="single"
              value={selectedLeague}
              onValueChange={(value) => setSelectedLeague(value as "all" | "major" | "mutare" | "mwl")}
              className="justify-center"
            >
              {(["all", "major", "mutare", "mwl"] as const).map((lg) => (
                <ToggleGroupItem
                  key={lg}
                  value={lg}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-6 py-2 font-sans font-bold uppercase"
                >
                  {getLeagueDisplay(lg)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            
            {/* --- LIVE GAMES SECTION --- */}
            {filteredLive.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-red-500">
                    Live Games ({getLeagueDisplay(selectedLeague)})
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredLive.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    return (
                      <div key={game.id} className="rounded-lg border-2 border-red-500/40 bg-card p-5 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
                            <span className="font-bold text-red-500 uppercase text-xs">Live Now</span>
                          </div>
                          <span className="rounded bg-red-500/20 px-2.5 py-0.5 text-xs font-bold uppercase text-red-500">
                            IN PROGRESS
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: home.color }} />
                            <span className="font-sans text-lg font-bold text-foreground">{home.abbreviation}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-sans text-3xl font-extrabold text-foreground">{game.homeScore ?? 0}</span>
                            <span className="text-sm text-muted-foreground">-</span>
                            <span className="font-sans text-3xl font-extrabold text-foreground">{game.awayScore ?? 0}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-lg font-bold text-foreground">{away.abbreviation}</span>
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: away.color }} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{game.venue}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* UPCOMING GAMES SECTION */}
            {filteredUpcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-foreground">
                  Upcoming Games ({getLeagueDisplay(selectedLeague)})
                </h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {filteredUpcoming.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    return (
                      <div key={game.id} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(game.date).toLocaleDateString("en-ZW", { weekday: "short", month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: home.color }} />
                            <span className="font-sans text-lg font-bold text-foreground">{home.abbreviation}</span>
                          </div>
                          <span className="rounded bg-primary/20 px-3 py-1 font-sans text-xs font-bold uppercase text-primary">vs</span>
                          <div className="flex items-center gap-3">
                            <span className="font-sans text-lg font-bold text-foreground">{away.abbreviation}</span>
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: away.color }} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{game.venue}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* COMPLETED GAMES SECTION */}
            {filteredCompleted.length > 0 && (
              <div className="mb-12">
                <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-foreground mb-6">
                  Completed Games ({getLeagueDisplay(selectedLeague)})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredCompleted.map((game) => {
                    const home = getTeam(game.homeTeamId)
                    const away = getTeam(game.awayTeamId)
                    if (!home || !away) return null
                    const homeWon = game.homeScore !== null && game.awayScore !== null && game.homeScore > game.awayScore
                    return (
                      <div key={game.id} className="rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(game.date).toLocaleDateString("en-ZW", { weekday: "short", month: "short", day: "numeric" })}</span>
                          </div>
                          <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">Final</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: home.color }} />
                            <span className={cn("font-sans text-lg font-bold", homeWon ? "text-primary" : "text-foreground")}>{home.abbreviation}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn("font-sans text-2xl font-bold", homeWon ? "text-primary" : "text-foreground")}>{game.homeScore}</span>
                            <span className="text-sm text-muted-foreground">-</span>
                            <span className={cn("font-sans text-2xl font-bold", !homeWon ? "text-primary" : "text-foreground")}>{game.awayScore}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn("font-sans text-lg font-bold", !homeWon ? "text-primary" : "text-foreground")}>{away.abbreviation}</span>
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: away.color }} />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{game.venue}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {filteredLive.length === 0 && filteredUpcoming.length === 0 && filteredCompleted.length === 0 && (
              <div className="text-center py-20">
                <p className="font-sans text-xl font-bold uppercase text-muted-foreground">
                  No {getLeagueDisplay(selectedLeague)} games found
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