"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Trophy, Target, Users } from "lucide-react"

interface Player {
  id: string
  name: string
  teamId: string
  position: string
  number: number
  ppg: number
  rpg: number
  apg: number
}

interface Team {
  id: string
  name: string
  color: string
}

export function FeaturedPlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("players").select("id, name, team_id, position, number, ppg, rpg, apg"),
      supabase.from("teams").select("id, name, color"),
    ]).then(([{ data: playersData }, { data: teamsData }]) => {
      if (playersData) {
        setPlayers(playersData.map((p) => ({ ...p, teamId: p.team_id })))
      }
      if (teamsData) setTeams(teamsData)
    })
  }, [])

  if (!players.length || !teams.length) return null

  const getTeam = (id: string) => teams.find((t) => t.id === id)

  const topScorer = [...players].sort((a, b) => b.ppg - a.ppg)[0]
  const topRebounder = [...players].sort((a, b) => b.rpg - a.rpg)[0]
  const topAssist = [...players].sort((a, b) => b.apg - a.apg)[0]

  const leaders = [
    { label: "Scoring Leader", player: topScorer, stat: `${topScorer.ppg} PPG`, icon: Trophy },
    { label: "Rebound Leader", player: topRebounder, stat: `${topRebounder.rpg} RPG`, icon: Target },
    { label: "Assist Leader", player: topAssist, stat: `${topAssist.apg} APG`, icon: Users },
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Leaders
            </p>
            <h2 className="mt-1 font-sans text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              Season Leaders
            </h2>
          </div>
          <Link
            href="/players"
            className="hidden font-sans text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary/80 md:block"
          >
            {"Full Roster >"}
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {leaders.map((leader) => {
            const team = getTeam(leader.player.teamId)
            const Icon = leader.icon
            return (
              <div
                key={leader.label}
                className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider">
                    {leader.label}
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-sans text-2xl font-bold uppercase text-foreground">
                      {leader.player.name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      #{leader.player.number} | {leader.player.position} | {team?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-3xl font-bold text-primary">
                      {leader.stat.split(" ")[0]}
                    </p>
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {leader.stat.split(" ")[1]}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
