"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MapPin, Users, Trophy, X, User, Award, Building2 } from "lucide-react"

interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  color: string
  logo?: string
  wins: number
  losses: number
  league: string
  coach: string
  captain: string
  chairperson: string
  founded: number
  arena: string
}

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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
    ]).then(([{ data: teamsData }, { data: playersData }]) => {
      if (teamsData) setTeams(teamsData)
      if (playersData) {
        setPlayers(playersData.map((p) => ({ ...p, teamId: p.team_id })))
      }
      setLoading(false)
    })
  }, [])

  const menTeams = teams.filter((t) => t.league !== "MWL")
  const womenTeams = teams.filter((t) => t.league === "MWL")

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

  function TeamCard({ team }: { team: Team }) {
    const rosterSize = players.filter((p) => p.teamId === team.id).length
    return (
      <div
        onClick={() => setSelectedTeam(team)}
        className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
      >
        <div className="h-2" style={{ backgroundColor: team.color }} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-sans text-3xl font-bold text-foreground/10">
                {team.abbreviation}
              </span>
              <h3 className="mt-1 font-sans text-xl font-bold uppercase text-foreground">
                {team.name}
              </h3>
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: team.color + "20", color: team.color }}
            >
              {team.abbreviation.charAt(0)}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{team.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>Coach: {team.coach}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" />
              <span>Record: {team.wins}-{team.losses}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">{team.league} Lg.</span>
            <span className="text-xs text-muted-foreground">{rosterSize} Players</span>
            <span className="text-xs text-muted-foreground">Est. {team.founded}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        {/* Background Logo */}
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <img src="/logo13.png" alt="" className="h-full w-full object-contain" />
        </div>

        {/* Hero */}
        <section className="border-b border-border bg-secondary py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              MBA
            </p>
            <h1 className="mt-1 font-sans text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              Teams
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              All teams competing in the {new Date().getFullYear()} MBA season.
            </p>
          </div>
        </section>

        {/* Men's Teams */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {menTeams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </div>
        </section>

        {/* Women's Teams */}
        <section className="py-12 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-8 font-sans text-3xl font-bold uppercase tracking-tight text-foreground">
              Women Teams
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {womenTeams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </div>
        </section>

        {/* Team Details Modal */}
        {selectedTeam && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
            style={{ "--team-color": selectedTeam.color } as React.CSSProperties}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-8 shadow-2xl border animate-in fade-in zoom-in duration-300 ease-out"
              style={{
                backgroundColor: `${selectedTeam.color}08`,
                borderColor: `${selectedTeam.color}30`,
                boxShadow: `0 25px 50px ${selectedTeam.color}25`,
              }}
            >
              <button
                onClick={() => setSelectedTeam(null)}
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                  style={{ backgroundColor: selectedTeam.color + "20", color: selectedTeam.color }}
                >
                  {selectedTeam.abbreviation.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold uppercase text-foreground">
                    {selectedTeam.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedTeam.city} · {selectedTeam.league}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Coach</p>
                    <p className="font-semibold">{selectedTeam.coach}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Captain</p>
                    <p className="font-semibold">{selectedTeam.captain}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Chairperson</p>
                    <p className="font-semibold">{selectedTeam.chairperson}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Record</p>
                    <p className="font-semibold">{selectedTeam.wins}-{selectedTeam.losses}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold uppercase">
                  <User className="h-4 w-4" />
                  Team Roster ({players.filter((p) => p.teamId === selectedTeam.id).length} players)
                </h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {players
                    .filter((p) => p.teamId === selectedTeam.id)
                    .map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                            style={{ backgroundColor: selectedTeam.color + "20", color: selectedTeam.color }}
                          >
                            {player.number}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {player.position} · {player.height}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>PPG: {player.ppg}</p>
                          <p>RPG: {player.rpg}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
