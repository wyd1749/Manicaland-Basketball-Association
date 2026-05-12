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

export function StandingsPreview() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("teams")
      .select("id, name, abbreviation, wins, losses, league, color")
      .then(({ data }) => {
        if (data) {
          const sorted = [...data].sort(
            (a, b) =>
              b.wins / (b.wins + b.losses || 1) -
              a.wins / (a.wins + a.losses || 1)
          )
          setTeams(sorted)
        }
      })
  }, [])

  if (!teams.length) return null

  const mutareLeague = teams.filter((t) => t.league === "mutare").slice(0, 4)
  const majorLeague = teams.filter((t) => t.league === "major").slice(0, 4)

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Standings
            </p>
            <h2 className="mt-1 font-sans text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              League Title Race
            </h2>
          </div>
          <Link
            href="/standings"
            className="hidden font-sans text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary/80 md:block"
          >
            {"Full Standings >"}
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[
            { title: "Major League", teams: majorLeague },
            { title: "Mutare League", teams: mutareLeague },
          ].map((conf) => (
            <div key={conf.title} className="rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
                  {conf.title}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {conf.teams.map((team, i) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-sm font-bold text-foreground">
                        {team.wins}-{team.losses}
                      </span>
                      <span className="w-12 text-right text-xs text-muted-foreground">
                        {((team.wins / (team.wins + team.losses || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
