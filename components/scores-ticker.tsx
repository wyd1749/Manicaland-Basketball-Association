"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Team {
  id: string
  name: string
  abbreviation: string
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
        .limit(4),
      supabase.from("teams").select("id, name, abbreviation"),
    ]).then(([{ data: gamesData }, { data: teamsData }]) => {
      if (gamesData) setGames(gamesData)
      if (teamsData) setTeams(teamsData)
    })
  }, [])

  if (!games.length || !teams.length) return null

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <section className="border-b border-border bg-secondary">
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 lg:px-8">
        <div className="flex items-center gap-1 py-3">
          <span className="mr-4 shrink-0 font-sans text-xs font-bold uppercase tracking-wider text-primary">
            Scores
          </span>
          {games.map((game) => {
            const home = getTeam(game.home_team_id)
            const away = getTeam(game.away_team_id)
            if (!home || !away) return null
            return (
              <Link
                key={game.id}
                href="/schedule"
                className="flex shrink-0 items-center gap-4 rounded-md border border-border bg-background px-4 py-2 transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-sans text-xs font-bold text-foreground">
                    {home.abbreviation}
                  </span>
                  <span className="font-sans text-lg font-bold text-foreground">
                    {game.home_score}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">vs</span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-sans text-xs font-bold text-foreground">
                    {away.abbreviation}
                  </span>
                  <span className="font-sans text-lg font-bold text-foreground">
                    {game.away_score}
                  </span>
                </div>
                <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  {game.status}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
