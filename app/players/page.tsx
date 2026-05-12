"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { getPlayers, getTeams } from "@/lib/api"

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

const positions = ["All", "PG", "SG", "SF", "PF", "C"]

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<"All" | "Men" | "Women">("All")
  const [posFilter, setPosFilter] = useState("All")
  const [sortBy, setSortBy] = useState<"ppg" | "rpg" | "apg">("ppg")

  useEffect(() => {
    Promise.all([getPlayers(), getTeams()]).then(([p, t]) => {
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
      setLoading(false)
    })
  }, [])


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="font-sans text-lg font-bold uppercase text-muted-foreground">
            Loading...
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
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <img src="/logo13.png" alt="" className="h-full w-full object-contain" />
        </div>

        <section className="border-b border-border bg-secondary py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">MBA</p>
            <h1 className="mt-1 font-sans text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Players
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Browse the complete roster of MBA players and their stats.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row flex-wrap items-end gap-4">
              <div className="min-w-[250px] flex-1">
                <Input
                  placeholder="Search players by name..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-1">
                {(["All", "Men", "Women"] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setGenderFilter(gender)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors",
                      genderFilter === gender
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {positions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors",
                      posFilter === pos
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {(["ppg", "rpg", "apg"] as const).map((stat) => (
                  <button
                    key={stat}
                    onClick={() => setSortBy(stat)}
                    className={cn(
                      "rounded-md px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors",
                      sortBy === stat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {stat}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Player</th>
                      <th className="px-4 py-3 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                      <th className="px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Pos</th>
                      <th className="px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">#</th>
                      <th className="hidden px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Age</th>
                      <th className="hidden px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">Height</th>
                      <th className="px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-primary">PPG</th>
                      <th className="px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-primary">RPG</th>
                      <th className="px-4 py-3 text-center font-sans text-xs font-bold uppercase tracking-wider text-primary">APG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((player) => {
                      const team = getTeam(player.teamId)
                      return (
                        <tr key={player.id} className="bg-card transition-colors hover:bg-secondary">
                          <td className="px-4 py-3">
                            <span className="font-sans text-sm font-bold text-foreground">{player.name}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team?.color }} />
                              <span className="text-sm text-muted-foreground">{team?.abbreviation}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-muted-foreground">{player.position}</td>
                          <td className="px-4 py-3 text-center text-sm text-muted-foreground">{player.number}</td>
                          <td className="hidden px-4 py-3 text-center text-sm text-muted-foreground sm:table-cell">{player.age}</td>
                          <td className="hidden px-4 py-3 text-center text-sm text-muted-foreground md:table-cell">{player.height}</td>
                          <td className={cn("px-4 py-3 text-center font-sans text-sm font-bold", sortBy === "ppg" ? "text-primary" : "text-foreground")}>{player.ppg}</td>
                          <td className={cn("px-4 py-3 text-center font-sans text-sm font-bold", sortBy === "rpg" ? "text-primary" : "text-foreground")}>{player.rpg}</td>
                          <td className={cn("px-4 py-3 text-center font-sans text-sm font-bold", sortBy === "apg" ? "text-primary" : "text-foreground")}>{player.apg}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}