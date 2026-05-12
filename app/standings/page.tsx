"use client"

import { useEffect, useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getTeams, getGames } from "@/lib/api"

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
  wins: number
  losses: number
  league: string
  city: string
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

function ConferenceTable({ title, teams }: { title: string; teams: Team[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-secondary px-4 py-3">
        <h2 className="font-sans text-lg font-bold uppercase tracking-wider text-foreground">
          {title}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Rank</th>
              <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</th>
              <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">W</th>
              <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">L</th>
              <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">PCT</th>
              <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">GB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((team, i) => {
              const pct = team.wins / (team.wins + team.losses)
              const leaderPct = teams[0].wins / (teams[0].wins + teams[0].losses)
              const gb = i === 0 ? "-" : (((leaderPct - pct) * (team.wins + team.losses)) / 2).toFixed(1)
              return (
                <tr key={team.id} className="bg-card transition-colors hover:bg-secondary">
                  <td className="px-4 py-3 font-sans text-sm font-bold text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <div>
                        <span className="font-sans text-sm font-bold text-foreground">{team.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{team.city}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-sans text-sm font-bold text-foreground">{team.wins}</td>
                  <td className="px-4 py-3 text-center font-sans text-sm font-bold text-foreground">{team.losses}</td>
                  <td className="px-4 py-3 text-center font-sans text-sm font-bold text-primary">{(pct * 1000).toFixed(0)}</td>
                  <td className="px-4 py-3 text-center text-sm text-muted-foreground">{gb}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function StandingsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const currentSeason = "2026"

  useEffect(() => {
    Promise.all([getTeams(), getGames()]).then(([t, g]) => {
      setTeams(t)
      setGames(g)
      setLoading(false)
    })
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

  const finalGames = games.filter((g) => g.season === currentSeason && g.status === "Final")

  const getTeamStats = (teamId: string) => {
    const teamGames = finalGames.filter((g) => g.homeTeamId === teamId || g.awayTeamId === teamId)
    let wins = 0
    teamGames.forEach((g) => {
      if (g.homeScore !== null && g.awayScore !== null) {
        if (g.homeTeamId === teamId && g.homeScore > g.awayScore) wins++
        if (g.awayTeamId === teamId && g.awayScore > g.homeScore) wins++
      }
    })
    return { wins, losses: teamGames.length - wins }
  }

  const teamsWithStats = teams.map((t) => ({ ...t, ...getTeamStats(t.id) }))
  const sorted = [...teamsWithStats].sort(
    (a, b) => (b.wins / (b.wins + b.losses) || 0) - (a.wins / (a.wins + a.losses) || 0)
  )

  const mwlTeams = sorted.filter((t) => t.league === "MWL")
  const mutareLeague = sorted.filter((t) => t.league === "mutare")
  const majorLeague = sorted.filter((t) => t.league === "major")

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
              {currentSeason} League Standings
            </p>
            <h1 className="mt-1 font-sans text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Standings
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Current league title race standings and win percentages.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <ConferenceTable title="Manicaland Women League" teams={mwlTeams} />
              <ConferenceTable title="Major League" teams={majorLeague} />
              <ConferenceTable title="Mutare League" teams={mutareLeague} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}