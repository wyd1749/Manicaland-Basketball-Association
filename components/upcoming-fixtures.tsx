"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
}

interface Game {
  id: string
  home_team_id: string
  away_team_id: string
  date: string
  status: string
}

export function UpcomingFixtures() {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    Promise.all([
      supabase
        .from("games")
        .select("id, home_team_id, away_team_id, date, status")
        .neq("status", "Final")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(4),
      supabase.from("teams").select("id, name, abbreviation, color"),
    ]).then(([g, t]) => {
      if (g.error) console.error("Supabase fixtures error:", g.error.message)
      if (t.error) console.error("Supabase teams error:", t.error.message)
      if (g.data) setGames(g.data)
      if (t.data) setTeams(t.data)
    })
  }, [])

  if (!games.length || !teams.length) return null

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <section className="pt-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-foreground">
            Upcoming fixtures
          </h2>
          <Link
            href="/schedule"
            className="font-sans text-sm font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
          >
            View all fixtures
          </Link>
        </div>

        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {games.map((game) => {
            const home = getTeam(game.home_team_id)
            const away = getTeam(game.away_team_id)
            if (!home || !away) return null
            const d = new Date(game.date)
            const hasTime = game.date.length > 10

            return (
              <li key={game.id}>
                <Link
                  href="/schedule"
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-secondary sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="sm:w-44">
                    <p className="text-sm font-semibold text-foreground">
                      {d.toLocaleDateString("en-ZW", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {hasTime && (
                      <p className="text-xs text-muted-foreground">
                        {d.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-1 items-center justify-center gap-4">
                    {[home, away].map((team, idx) => (
                      <span key={team.id} className="flex items-center gap-3">
                        {idx === 1 && <span className="text-xs text-muted-foreground">vs</span>}
                        <span
                          className="flex size-8 items-center justify-center rounded-full font-sans text-[10px] font-bold text-white"
                          style={{ backgroundColor: team.color }}
                          aria-hidden
                        >
                          {team.abbreviation}
                        </span>
                        <span className="text-sm font-medium text-foreground">{team.name}</span>
                      </span>
                    ))}
                  </div>

                  <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary sm:w-44 sm:text-right">
                    {game.status}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}