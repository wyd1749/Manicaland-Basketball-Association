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
  home_score: number | null
  away_score: number | null
  date: string
  status: string
}

export function ScoresTicker() {
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase
        .from("games")
        .select("id, home_team_id, away_team_id, home_score, away_score, date, status")
        .eq("status", "Final")
        .order("date", { ascending: false })
        .limit(3),
      supabase.from("teams").select("id, name, abbreviation, color"),
    ]).then(([g, t]) => {
      if (g.error) console.error("Supabase games error:", g.error.message)
      if (t.error) console.error("Supabase teams error:", t.error.message)
      if (g.data) setGames(g.data)
      if (t.data) setTeams(t.data)
    })
  }, [])

  if (!games.length || !teams.length) return null

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <section className="border-b border-border bg-secondary py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-sans text-xl font-bold uppercase tracking-wide text-foreground">
            Latest results
          </h2>
          <Link
            href="/schedule"
            className="font-sans text-sm font-semibold uppercase tracking-wider text-primary hover:text-primary/80"
          >
            View all results
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {games.map((game) => {
            const home = getTeam(game.home_team_id)
            const away = getTeam(game.away_team_id)
            if (!home || !away) return null
            const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0)
            const awayWon = (game.away_score ?? 0) > (game.home_score ?? 0)

            return (
              <Link
                key={game.id}
                href="/schedule"
                className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <p className="text-xs text-muted-foreground">
                  {new Date(game.date).toLocaleDateString("en-ZW", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                {[
                  { team: home, score: game.home_score, won: homeWon },
                  { team: away, score: game.away_score, won: awayWon },
                ].map(({ team, score, won }) => (
                  <div key={team.id} className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-8 items-center justify-center rounded-full font-sans text-[10px] font-bold text-white"
                        style={{ backgroundColor: team.color }}
                        aria-hidden
                      >
                        {team.abbreviation}
                      </span>
                      <span
                        className={
                          won
                            ? "text-sm font-semibold text-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {team.name}
                      </span>
                    </div>
                    <span
                      className={
                        won
                          ? "font-sans text-2xl font-bold text-foreground"
                          : "font-sans text-2xl font-bold text-muted-foreground"
                      }
                    >
                      {score}
                    </span>
                  </div>
                ))}

                <p className="mt-3 text-right font-sans text-[11px] font-bold uppercase tracking-wider text-primary">
                  {game.status}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}