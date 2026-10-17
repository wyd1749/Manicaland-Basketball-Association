"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, User, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getGames } from "@/lib/api"

// Banner image in the /public folder. To reuse the teams banner, set this to "/teams-banner.webp".
const BANNER_IMAGE = "/standings-banner.webp"
// Same public Supabase Storage bucket the Teams page uses for logos
const LOGO_BUCKET = "team-logos"

interface Team {
  id: string
  name: string
  abbreviation: string
  color: string
  logo?: string | null
  league: string
  city: string
}

interface TeamRow extends Team {
  wins: number
  losses: number
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

/* A logo value can be: a full URL, a /public path like "/logos/cwb.png",
   or just a file name in the Supabase bucket like "cwb.png" (same as the Teams page). */
function logoUrl(logo?: string | null): string | null {
  if (!logo) return null
  if (/^https?:\/\//i.test(logo) || logo.startsWith("/")) return logo
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${logo}`
}

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

const LEAGUES: {
  key: string
  title: string
  color: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { key: "MWL", title: "Manicaland Women League", color: "#ec4899", Icon: User },
  { key: "major", title: "Major League", color: "#f97316", Icon: BasketballIcon },
  { key: "mutare", title: "Mutare League", color: "#22c55e", Icon: Users },
]

function TeamLogo({ team }: { team: Team }) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl(team.logo)
  const color = team.color || "#f97316"

  if (!src || failed) {
    return (
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold"
        style={{ backgroundColor: color + "30", color }}
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
      className="h-8 w-8 shrink-0 object-contain"
    />
  )
}

function pctText(team: TeamRow): string {
  const played = team.wins + team.losses
  if (played === 0) return "–"
  return ((team.wins / played) * 1000).toFixed(0)
}

function LeagueCard({
  title,
  color,
  Icon,
  teams,
}: {
  title: string
  color: string
  Icon: React.ComponentType<{ className?: string }>
  teams: TeamRow[]
}) {
  return (
    <section
      className="flex flex-col rounded-2xl border-2 p-4"
      style={{
        borderColor: color,
        boxShadow: `0 0 24px ${color}40`,
        background: `linear-gradient(135deg, ${color}1f 0%, rgba(8,8,10,0.92) 45%)`,
      }}
    >
      <header className="flex items-center gap-4 pb-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2"
          style={{ borderColor: color, color }}
        >
          <Icon className="size-7" />
        </div>
        <h2 className="font-sans text-xl font-bold uppercase leading-tight text-foreground">{title}</h2>
      </header>

      <div className="overflow-x-auto rounded-lg bg-black/30">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="w-10 px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Team</th>
              <th className="px-3 py-3 text-center">W</th>
              <th className="px-3 py-3 text-center">L</th>
              <th className="px-3 py-3 text-center">PCT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No teams in this league yet.
                </td>
              </tr>
            )}
            {teams.map((team, i) => (
              <tr key={team.id} className="transition-colors hover:bg-white/5">
                <td className="px-3 py-3 font-sans text-sm text-foreground/80">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <TeamLogo team={team} />
                    <span className="truncate font-sans text-sm text-foreground">{team.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-sans text-sm text-foreground">{team.wins}</td>
                <td className="px-3 py-3 text-center font-sans text-sm text-foreground">{team.losses}</td>
                <td className="px-3 py-3 text-center font-sans text-sm font-bold" style={{ color }}>
                  {pctText(team)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex items-center gap-4 px-1 text-sm text-foreground/80">
        <span className="flex items-center gap-2 font-sans font-semibold uppercase">
          <Users className="size-4" aria-hidden />
          {teams.length} {teams.length === 1 ? "Team" : "Teams"}
        </span>
        <span
          aria-hidden
          className="h-0.5 flex-1 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
        />
        <Link href="/teams" aria-label="View all teams" className="transition-colors hover:text-primary">
          <ChevronRight className="size-5" />
        </Link>
      </footer>
    </section>
  )
}

export default function StandingsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const currentSeason = "2026"

  useEffect(() => {
    const supabase = createClient()
    Promise.all([supabase.from("teams").select("*"), getGames()])
      .then(([{ data: teamsData, error: teamsError }, g]) => {
        if (teamsError) throw teamsError
        setTeams(
          (teamsData ?? []).map((t) => ({
            id: String(t.id),
            name: t.name ?? "",
            abbreviation: t.abbreviation ?? "",
            color: t.color ?? "#f97316",
            logo: t.logo ?? t.logo_url ?? t.logo_path ?? null,
            league: t.league ?? "",
            city: t.city ?? "",
          }))
        )
        setGames(g as Game[])
      })
      .catch((err) => {
        console.error("Failed to load standings:", err)
        setError("Could not load standings. Please refresh the page and try again.")
      })
      .finally(() => setLoading(false))
  }, [])

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

  const finalGames = games.filter((g) => g.season === currentSeason && g.status === "Final")

  const getTeamStats = (teamId: string) => {
    const teamGames = finalGames.filter(
      (g) => String(g.homeTeamId) === teamId || String(g.awayTeamId) === teamId
    )
    let wins = 0
    teamGames.forEach((g) => {
      if (g.homeScore !== null && g.awayScore !== null) {
        if (String(g.homeTeamId) === teamId && g.homeScore > g.awayScore) wins++
        if (String(g.awayTeamId) === teamId && g.awayScore > g.homeScore) wins++
      }
    })
    return { wins, losses: teamGames.length - wins }
  }

  const pctOf = (t: TeamRow) => {
    const played = t.wins + t.losses
    return played === 0 ? 0 : t.wins / played
  }

  const sorted: TeamRow[] = teams
    .map((t) => ({ ...t, ...getTeamStats(t.id) }))
    .sort((a, b) => pctOf(b) - pctOf(a) || b.wins - a.wins || a.name.localeCompare(b.name))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1 bg-background">
        {/* Banner. Image file lives in /public (see BANNER_IMAGE at the top) */}
        <section className="relative h-60 w-full overflow-hidden border-b border-primary/40 bg-gradient-to-b from-secondary to-background md:h-80">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-[position:70%_center] bg-no-repeat md:bg-center"
            style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent"
          />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 lg:px-8">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              {currentSeason} League Standings
            </p>
            <h1 className="mt-1 font-sans text-5xl font-bold uppercase italic leading-none tracking-tight text-foreground md:text-7xl">
              Standings
            </h1>
            <p className="mt-3 max-w-xs text-base text-foreground/80">
              Current league title race standings and win percentages.
            </p>
          </div>
        </section>

        {/* League tables */}
        <section className="py-10">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {LEAGUES.map(({ key, title, color, Icon }) => (
                <LeagueCard
                  key={key}
                  title={title}
                  color={color}
                  Icon={Icon}
                  teams={sorted.filter((t) => t.league === key)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}