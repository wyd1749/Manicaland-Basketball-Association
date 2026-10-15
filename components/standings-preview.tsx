"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Team {
  id: string
  name: string
  abbreviation: string
  wins: number
  losses: number
  league: string
  color: string
}

interface FinalGame {
  home_team_id: string
  away_team_id: string
  home_score: number | null
  away_score: number | null
}

type Form = Record<string, ("W" | "L")[]>

// Last 5 results per team, oldest first. Games must be passed newest first.
function buildForm(games: FinalGame[]): Form {
  const form: Form = {}
  for (const g of games) {
    if (g.home_score == null || g.away_score == null) continue
    const homeWon = g.home_score > g.away_score
    const add = (id: string, won: boolean) => {
      form[id] = form[id] ?? []
      if (form[id].length < 5) form[id].push(won ? "W" : "L")
    }
    add(g.home_team_id, homeWon)
    add(g.away_team_id, !homeWon)
  }
  for (const id of Object.keys(form)) form[id].reverse()
  return form
}

export function StandingsPreview() {
  const [teams, setTeams] = useState<Team[]>([])
  const [form, setForm] = useState<Form>({})

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("teams").select("id, name, abbreviation, wins, losses, league, color"),
      supabase
        .from("games")
        .select("home_team_id, away_team_id, home_score, away_score")
        .eq("status", "Final")
        .order("date", { ascending: false })
        .limit(200),
    ]).then(([t, g]) => {
      if (t.error) console.error("Supabase teams error:", t.error.message)
      if (g.error) console.error("Supabase games error:", g.error.message)
      if (t.data) {
        const sorted = [...t.data].sort(
          (a, b) =>
            b.wins / (b.wins + b.losses || 1) - a.wins / (a.wins + a.losses || 1)
        )
        setTeams(sorted)
      }
      if (g.data) setForm(buildForm(g.data))
    })
  }, [])

  if (!teams.length) return null

  const tables = [
    { title: "Major League", teams: teams.filter((t) => t.league === "major").slice(0, 5) },
    { title: "Mutare League", teams: teams.filter((t) => t.league === "mutare").slice(0, 5) },
  ]

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-foreground">
            League standings
          </h2>
          <Link
            href="/standings"
            className="font-sans text-sm font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
          >
            View full standings
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {tables.map((table) => (
            <div key={table.title} className="overflow-hidden rounded-lg border border-border bg-card">
              <h3 className="border-b border-border px-4 py-3 font-sans text-sm font-bold uppercase tracking-wider text-foreground">
                {table.title}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[26rem] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="w-10 px-4 py-2 font-medium">#</th>
                      <th className="py-2 font-medium">Team</th>
                      <th className="px-2 py-2 text-center font-medium">P</th>
                      <th className="px-2 py-2 text-center font-medium">W</th>
                      <th className="px-2 py-2 text-center font-medium">L</th>
                      <th className="px-2 py-2 text-center font-medium">Win %</th>
                      <th className="px-4 py-2 text-right font-medium">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {table.teams.map((team, i) => {
                      const played = team.wins + team.losses
                      return (
                        <tr key={team.id} className="transition-colors hover:bg-secondary">
                          <td className="px-4 py-3 font-bold text-muted-foreground">{i + 1}</td>
                          <td className="py-3">
                            <span className="flex items-center gap-3">
                              <span
                                className="flex size-7 items-center justify-center rounded-full font-sans text-[9px] font-bold text-white"
                                style={{ backgroundColor: team.color }}
                                aria-hidden
                              >
                                {team.abbreviation}
                              </span>
                              <span className="font-medium text-foreground">{team.name}</span>
                            </span>
                          </td>
                          <td className="px-2 py-3 text-center text-muted-foreground">{played}</td>
                          <td className="px-2 py-3 text-center font-semibold text-foreground">{team.wins}</td>
                          <td className="px-2 py-3 text-center text-muted-foreground">{team.losses}</td>
                          <td className="px-2 py-3 text-center text-muted-foreground">
                            {((team.wins / (played || 1)) * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex justify-end gap-1">
                              {(form[team.id] ?? []).map((r, idx) => (
                                <span
                                  key={idx}
                                  title={r === "W" ? "Win" : "Loss"}
                                  className={
                                    r === "W"
                                      ? "flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400"
                                      : "flex size-5 items-center justify-center rounded-full bg-destructive/20 text-[10px] font-bold text-destructive"
                                  }
                                >
                                  {r}
                                </span>
                              ))}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}