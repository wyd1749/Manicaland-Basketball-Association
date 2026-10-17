"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import {
  Award,
  Building2,
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  SlidersHorizontal,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react"

// Banner image in the /public folder (change the extension here if needed)
const BANNER_IMAGE = "/teams-banner.webp"
// Name of the public Supabase Storage bucket that holds the team logos
const LOGO_BUCKET = "team-logos"

interface Team {
  id: string
  name: string
  city: string
  abbreviation: string
  color: string
  logo?: string | null
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

/* A logo value can be: a full URL, a /public path like "/logos/cwb.png",
   or just a file name in the Supabase bucket like "cwb.png". */
function logoUrl(logo?: string | null): string | null {
  if (!logo) return null
  if (/^https?:\/\//i.test(logo) || logo.startsWith("/")) return logo
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${logo}`
}

const teamColor = (team: Team) => team.color || "#f97316"

function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20" />
      <path d="M4.5 4.5c3.5 3 3.5 12 0 15M19.5 4.5c-3.5 3-3.5 12 0 15" />
    </svg>
  )
}

function TeamLogo({ team, size }: { team: Team; size: "card" | "modal" }) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl(team.logo)
  const color = teamColor(team)
  const box = size === "card" ? "h-24 w-24" : "h-20 w-20"

  if (!src || failed) {
    return (
      <div
        className={`${box} flex shrink-0 items-center justify-center rounded-full font-sans text-3xl font-bold`}
        style={{ backgroundColor: color + "20", color }}
      >
        {team.abbreviation?.charAt(0)}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${team.name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${box} shrink-0 object-contain`}
    />
  )
}

function TeamCard({
  team,
  rosterSize,
  onSelect,
}: {
  team: Team
  rosterSize: number
  onSelect: () => void
}) {
  const color = teamColor(team)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className="group relative flex cursor-pointer flex-col rounded-2xl border-2 p-5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      style={{
        borderColor: color,
        boxShadow: `0 0 22px ${color}40`,
        background: `linear-gradient(135deg, ${color}26 0%, rgba(8,8,10,0.92) 55%)`,
      }}
    >
      <div
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm font-bold"
        style={{ backgroundColor: color + "30", color: "#fff" }}
      >
        {team.abbreviation?.charAt(0)}
      </div>

      <div className="flex items-start gap-4">
        <TeamLogo team={team} size="card" />
        <div className="min-w-0 pr-8">
          <p className="font-sans text-3xl font-bold uppercase leading-none" style={{ color }}>
            {team.abbreviation}
          </p>
          <h3 className="mt-1 font-sans text-lg font-bold uppercase leading-tight text-foreground">
            {team.name}
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-foreground/80">
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{team.city}</span>
            </li>
            <li className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">Coach: {team.coach}</span>
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Record: {team.wins}-{team.losses}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-foreground/80"
        style={{ borderColor: color + "60" }}
      >
        <span className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {rosterSize} {rosterSize === 1 ? "Player" : "Players"}
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Est. {team.founded}
        </span>
      </div>
    </div>
  )
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  options: string[]
}) {
  return (
    <div className="relative min-w-[10rem] flex-1 lg:flex-none lg:w-56">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full appearance-none rounded-md border border-border bg-card px-4 py-3 pr-10 font-sans text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <option value="all">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  )
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  const [query, setQuery] = useState("")
  const [division, setDivision] = useState("all")
  const [location, setLocation] = useState("all")
  const [year, setYear] = useState("all")

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("teams").select("*"),
      supabase.from("players").select("*"),
    ])
      .then(([{ data: teamsData, error: teamsError }, { data: playersData, error: playersError }]) => {
        if (teamsError || playersError) {
          console.error("Teams page load error:", teamsError ?? playersError)
          setError("Could not load teams. Please refresh the page and try again.")
        }
        if (teamsData) {
          setTeams(teamsData.map((t) => ({ ...t, logo: t.logo ?? t.logo_url ?? t.logo_path ?? null })))
        }
        if (playersData) {
          setPlayers(playersData.map((p) => ({ ...p, teamId: p.team_id })))
        }
      })
      .catch((err) => {
        console.error("Teams page load error:", err)
        setError("Could not load teams. Please refresh the page and try again.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Close the team details popup with the Escape key
  useEffect(() => {
    if (!selectedTeam) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTeam(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedTeam])

  const rosterCounts = useMemo(() => {
    const map = new Map<string, number>()
    players.forEach((p) => {
      const key = String(p.teamId)
      map.set(key, (map.get(key) ?? 0) + 1)
    })
    return map
  }, [players])

  const divisions = useMemo(
    () => Array.from(new Set(teams.map((t) => t.league).filter(Boolean))).sort(),
    [teams]
  )
  const locations = useMemo(
    () => Array.from(new Set(teams.map((t) => t.city).filter(Boolean))).sort(),
    [teams]
  )
  const years = useMemo(
    () =>
      Array.from(new Set(teams.map((t) => t.founded).filter(Boolean)))
        .sort((a, b) => b - a)
        .map(String),
    [teams]
  )

  const visibleTeams = useMemo(() => {
    const q = query.trim().toLowerCase()
    return teams.filter((t) => {
      if (division !== "all" && t.league !== division) return false
      if (location !== "all" && t.city !== location) return false
      if (year !== "all" && String(t.founded) !== year) return false
      if (!q) return true
      return [t.name, t.abbreviation, t.city, t.coach].some((v) => (v ?? "").toLowerCase().includes(q))
    })
  }, [teams, query, division, location, year])

  const menTeams = visibleTeams.filter((t) => t.league !== "MWL")
  const womenTeams = visibleTeams.filter((t) => t.league === "MWL")
  const filtersActive = query !== "" || division !== "all" || location !== "all" || year !== "all"

  const resetFilters = () => {
    setQuery("")
    setDivision("all")
    setLocation("all")
    setYear("all")
  }

  if (loading || error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-4 text-center">
          <div
            className={`font-sans text-lg font-bold uppercase ${
              error ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {error || "Loading..."}
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const selectedRoster = selectedTeam
    ? players.filter((p) => String(p.teamId) === String(selectedTeam.id))
    : []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1 bg-background">
        {/* Banner. Image file lives in /public (see BANNER_IMAGE at the top) */}
        <section className="relative h-44 w-full overflow-hidden border-b border-primary/60 bg-gradient-to-b from-secondary to-background md:h-64">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
          />
          <h1 className="sr-only">Teams</h1>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/70 p-3 backdrop-blur-sm">
            <div className="relative min-w-[14rem] flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams..."
                aria-label="Search teams"
                className="w-full rounded-md border border-border bg-card py-3 pl-11 pr-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
            <FilterSelect value={division} onChange={setDivision} label="All Divisions" options={divisions} />
            <FilterSelect value={location} onChange={setLocation} label="All Locations" options={locations} />
            <FilterSelect value={year} onChange={setYear} label="All Years" options={years} />
            <button
              type="button"
              onClick={resetFilters}
              disabled={!filtersActive}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              {filtersActive ? "Reset" : "Filter"}
            </button>
          </div>
        </section>

        {/* Teams */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            {visibleTeams.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">No teams match your filters.</p>
            )}

            {menTeams.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {menTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    rosterSize={rosterCounts.get(String(team.id)) ?? 0}
                    onSelect={() => setSelectedTeam(team)}
                  />
                ))}
              </div>
            )}

            {womenTeams.length > 0 && (
              <>
                <h2 className="mb-6 mt-12 font-sans text-3xl font-bold uppercase tracking-tight text-foreground">
                  Women <span className="text-primary">Teams</span>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {womenTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      rosterSize={rosterCounts.get(String(team.id)) ?? 0}
                      onSelect={() => setSelectedTeam(team)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* One Community strip */}
        <section className="border-t border-primary/60 bg-gradient-to-r from-primary/15 via-background to-background">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-[1.2fr_2fr_1.4fr] lg:px-8">
            <div>
              <p className="font-sans text-sm font-bold uppercase italic tracking-wide text-primary">
                More than basketball
              </p>
              <p className="font-sans text-4xl font-bold uppercase italic leading-none text-foreground md:text-5xl">
                One Community
              </p>
            </div>

            <ul className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: BasketballIcon, title: "Competition", note: "Building stronger teams" },
                { icon: Users, title: "Development", note: "Growing talent across Manicaland" },
                { icon: Trophy, title: "Unity", note: "One league, one family" },
              ].map(({ icon: Icon, title, note }) => (
                <li key={title} className="flex flex-col items-center gap-1">
                  <Icon className="size-9 text-primary" aria-hidden />
                  <p className="font-sans text-sm font-bold uppercase text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{note}</p>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 rounded-xl border border-primary/40 bg-card/60 p-4">
              <BasketballIcon className="size-12 shrink-0 text-primary" />
              <div>
                <p className="font-sans text-sm font-bold text-foreground">Manicaland Basketball Association</p>
                <p className="text-xs text-muted-foreground">
                  Supporting, developing and promoting basketball across the province.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Details Modal */}
        {selectedTeam && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedTeam.name} details`}
            onClick={() => setSelectedTeam(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-background p-8 shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(${teamColor(selectedTeam)}14, ${teamColor(selectedTeam)}08)`,
                borderColor: `${teamColor(selectedTeam)}60`,
                boxShadow: `0 25px 50px ${teamColor(selectedTeam)}25`,
              }}
            >
              <button
                onClick={() => setSelectedTeam(null)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-6 flex items-center gap-4">
                <TeamLogo team={selectedTeam} size="modal" />
                <div>
                  <h2 className="text-2xl font-bold uppercase text-foreground">{selectedTeam.name}</h2>
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
                    <p className="font-semibold">
                      {selectedTeam.wins}-{selectedTeam.losses}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold uppercase">
                  <User className="h-4 w-4" />
                  Team Roster ({selectedRoster.length} players)
                </h3>
                <div className="grid gap-2 md:grid-cols-2">
                  {selectedRoster.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: teamColor(selectedTeam) + "20",
                            color: teamColor(selectedTeam),
                          }}
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