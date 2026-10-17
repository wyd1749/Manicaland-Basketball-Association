"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { getPlayers, getTeams } from "@/lib/api"

// Background image in the /public folder. Change the extension here if needed (.png or .webp).
const BG_IMAGE = "/players-bg.webp"

interface Player {
  id: string
  name: string
  teamId: string
  position: string
  number: number
  height: string
  weight: string
  age: number
  ppg: number
  rpg: number
  apg: number
}

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
}

const PAGE_SIZE = 10
const positions = ["All", "PG", "SG", "SF", "PF", "C"]

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}

const chipClass = (active: boolean) =>
  cn(
    "rounded-md border px-4 py-2 font-sans text-sm font-semibold uppercase tracking-wide transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
  )

const navButtonClass =
  "inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-2 font-sans text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-foreground"

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<"All" | "Men" | "Women">("All")
  const [posFilter, setPosFilter] = useState("All")
  const [sortBy, setSortBy] = useState<"ppg" | "rpg" | "apg">("ppg")
  const [page, setPage] = useState(1)

  useEffect(() => {
    Promise.all([getPlayers(), getTeams()])
      .then(([p, t]) => {
        // If api normalization didn’t cover it, normalize again defensively.
        setPlayers(
          (p as any[]).map((pl) => ({
            ...pl,
            teamId: pl.teamId ?? pl.team_id,
            ppg: pl.ppg ?? pl.ppg_points,
            rpg: pl.rpg ?? pl.rebounds,
            apg: pl.apg ?? pl.assists,
          }))
        )
        setTeams(t)
      })
      .catch((err) => {
        console.error("Failed to load players page data:", err)
        setError("Could not load players. Please refresh the page and try again.")
      })
      .finally(() => setLoading(false))
  }, [])

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

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  const filtered = players
    .filter((p) => p.teamId && p.name)
    .filter((p) => {
      const isWomen = p.teamId?.startsWith("w")
      if (genderFilter === "Men") return !isWomen
      if (genderFilter === "Women") return isWomen
      return true
    })
    .filter((p) => posFilter === "All" || p.position === posFilter)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0))

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const startIndex = (current - 1) * PAGE_SIZE
  const visible = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative isolate flex-1 bg-background">
        {/* Page background: file lives in /public (see BG_IMAGE at the top) */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />

        <section className="border-b border-primary/60">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <p className="font-sans text-2xl font-bold uppercase text-primary">MBA</p>
            <h1 className="font-sans text-6xl font-bold uppercase leading-none text-foreground sm:text-7xl">
              Players
            </h1>
            <p className="mt-3 max-w-md text-base text-foreground/80">
              Browse the complete roster of MBA players and their stats.
            </p>
            <div aria-hidden className="mt-5 h-0.5 w-16 bg-primary" />
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[250px] flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  className="bg-card pl-11"
                  placeholder="Search players by name..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <div className="flex gap-2">
                {(["All", "Men", "Women"] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => {
                      setGenderFilter(gender)
                      setPage(1)
                    }}
                    className={chipClass(genderFilter === gender)}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      setPosFilter(pos)
                      setPage(1)
                    }}
                    className={chipClass(posFilter === pos)}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {(["ppg", "rpg", "apg"] as const).map((stat) => (
                  <button
                    key={stat}
                    onClick={() => {
                      setSortBy(stat)
                      setPage(1)
                    }}
                    className={chipClass(sortBy === stat)}
                  >
                    {stat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="px-5 py-4 text-left font-sans text-sm font-semibold uppercase tracking-wide text-primary">Player</th>
                      <th className="px-4 py-4 text-left font-sans text-sm font-semibold uppercase tracking-wide text-primary">Team</th>
                      <th className="px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary">Pos</th>
                      <th className="px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary">#</th>
                      <th className="hidden px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary sm:table-cell">Age</th>
                      <th className="hidden px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary md:table-cell">Height</th>
                      <th className="px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary">PPG</th>
                      <th className="px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary">RPG</th>
                      <th className="px-4 py-4 text-center font-sans text-sm font-semibold uppercase tracking-wide text-primary">APG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visible.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">
                          No players match your filters.
                        </td>
                      </tr>
                    )}
                    {visible.map((player) => {
                      const team = getTeam(player.teamId)
                      return (
                        <tr key={player.id} className="transition-colors hover:bg-primary/5">
                          <td className="px-5 py-3.5">
                            <span className="font-sans text-base font-semibold text-foreground">{player.name}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team?.color }} />
                              <span className="text-sm text-foreground/90">{team?.abbreviation}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center text-sm text-foreground/80">{player.position}</td>
                          <td className="px-4 py-3.5 text-center text-sm text-foreground/80">{player.number}</td>
                          <td className="hidden px-4 py-3.5 text-center text-sm text-foreground/80 sm:table-cell">{player.age}</td>
                          <td className="hidden px-4 py-3.5 text-center text-sm text-foreground/80 md:table-cell">{player.height}</td>
                          <td className={cn("px-4 py-3.5 text-center font-sans text-base font-bold", sortBy === "ppg" ? "text-primary" : "text-foreground")}>{player.ppg ?? "–"}</td>
                          <td className={cn("px-4 py-3.5 text-center font-sans text-base font-bold", sortBy === "rpg" ? "text-primary" : "text-foreground")}>{player.rpg ?? "–"}</td>
                          <td className={cn("px-4 py-3.5 text-center font-sans text-base font-bold", sortBy === "apg" ? "text-primary" : "text-foreground")}>{player.apg ?? "–"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length} players
                </p>

                <nav aria-label="Players pages" className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(current - 1)}
                    disabled={current === 1}
                    className={navButtonClass}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                    Prev
                  </button>

                  {pageList(current, totalPages).map((item, i) =>
                    item === "…" ? (
                      <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        aria-current={item === current ? "page" : undefined}
                        className={cn(
                          "min-w-10 rounded-md border px-3 py-2 font-sans text-sm font-semibold transition-colors",
                          item === current
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage(current + 1)}
                    disabled={current === totalPages}
                    className={navButtonClass}
                  >
                    Next
                    <ChevronRight className="size-4" aria-hidden />
                  </button>
                </nav>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}