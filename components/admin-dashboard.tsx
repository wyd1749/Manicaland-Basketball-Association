"use client"

import React, { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  Newspaper,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Tab = "overview" | "teams" | "mwl" | "players" | "games" | "news"

interface AdminDashboardProps {
  onLogout: () => void
}

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

interface NewsItem {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  category: string
}

interface AppData {
  teams: Team[]
  players: Player[]
  games: Game[]
  news: NewsItem[]
}

// Helper: map snake_case Supabase rows to camelCase
function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    city: (row.city as string) ?? "",
    abbreviation: (row.abbreviation as string) ?? "",
    color: (row.color as string) ?? "#E86833",
    logo: (row.logo as string) ?? undefined,
    wins: (row.wins as number) ?? 0,
    losses: (row.losses as number) ?? 0,
    league: (row.league as string) ?? "major",
    coach: (row.coach as string) ?? "",
    captain: (row.captain as string) ?? "",
    chairperson: (row.chairperson as string) ?? "",
    founded: (row.founded as number) ?? 2026,
    arena: (row.arena as string) ?? "",
  }
}

function mapPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    teamId: (row.team_id ?? row.teamId) as string,
    position: (row.position as string) ?? "PG",
    number: (row.number as number) ?? 0,
    height: (row.height as string) ?? "",
    weight: (row.weight as string) ?? "",
    age: (row.age as number) ?? 20,
    ppg: (row.ppg as number) ?? 0,
    rpg: (row.rpg as number) ?? 0,
    apg: (row.apg as number) ?? 0,
  }
}

function mapGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    homeTeamId: (row.home_team_id ?? row.homeTeamId) as string,
    awayTeamId: (row.away_team_id ?? row.awayTeamId) as string,
    homeScore: (row.home_score ?? row.homeScore ?? null) as number | null,
    awayScore: (row.away_score ?? row.awayScore ?? null) as number | null,
    date: row.date as string,
    status: (row.status as string) ?? "Scheduled",
    venue: (row.venue as string) ?? "",
    season: (row.season as string) ?? "2026",
  }
}

function gameStatusLabel(status: string) {
  if (status === "Final") return "Final"
  if (status === "Scheduled") return "Scheduled"
  return status
}

function mapNews(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as string,
    title: row.title as string,
    excerpt: (row.excerpt as string) ?? "",
    content: (row.content as string) ?? "",
    image: (row.image as string) ?? "/images/news-1.jpg",
    date: row.date as string,
    category: (row.category as string) ?? "Announcement",
  }
}

/* ========== SUCCESS POPUP MODAL ========== */
function SuccessModal({
  isOpen,
  onClose,
  title = "Registration Completed",
  message = "The player has been successfully registered to the system.",
}: {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-sans text-base font-bold uppercase text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [data, setData] = useState<AppData | null>(null)

  const loadData = useCallback(async function loadData() {
    const supabase = createClient()
    const [{ data: teams }, { data: players }, { data: games }, { data: news }] =
      await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("players").select("*"),
        supabase.from("games").select("*").order("date", { ascending: false }),
        supabase.from("news").select("*").order("date", { ascending: false }),
      ])
    setData({
      teams: (teams ?? []).map(mapTeam),
      players: (players ?? []).map(mapPlayer),
      games: (games ?? []).map(mapGame),
      news: (news ?? []).map(mapNews),
    })
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "teams", label: "Teams", icon: Shield },
    { id: "mwl", label: "MWL Teams", icon: Shield },
    { id: "players", label: "Players", icon: Users },
    { id: "games", label: "Games", icon: Calendar },
    { id: "news", label: "News", icon: Newspaper },
  ]

  async function apiAction(
    action: string,
    entity: string,
    payload: Record<string, unknown>
  ) {
    const supabase = createClient()

    const toDb = (p: Record<string, unknown>) => {
      const out: Record<string, unknown> = { ...p }
      if ("teamId" in out) { out.team_id = out.teamId; delete out.teamId }
      if ("homeTeamId" in out) { out.home_team_id = out.homeTeamId; delete out.homeTeamId }
      if ("awayTeamId" in out) { out.away_team_id = out.awayTeamId; delete out.awayTeamId }
      if ("homeScore" in out) { out.home_score = out.homeScore; delete out.homeScore }
      if ("awayScore" in out) { out.away_score = out.awayScore; delete out.awayScore }
      return out
    }

    if (action === "create") {
      const { id: _id, ...rest } = payload as { id?: string } & Record<string, unknown>
      const result = await supabase.from(entity).insert(toDb(rest)).select()
      if (result.error) { alert("Save failed: " + result.error.message); return }
    } else if (action === "update") {
      const { id, ...rest } = payload as { id: string } & Record<string, unknown>
      const result = await supabase.from(entity).update(toDb(rest)).eq("id", id).select()
      if (result.error) { alert("Save failed: " + result.error.message); return }
    } else if (action === "delete") {
      const result = await supabase.from(entity).delete().eq("id", payload.id)
      if (result.error) { alert("Delete failed: " + result.error.message); return }
    }

    await loadData()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col border-b border-border bg-secondary lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-border px-4 py-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <img
                src="/logo13.png"
                alt="MBA Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              MBA Admin
            </span>
          </Link>
          <button
            onClick={onLogout}
            className="text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 py-2 lg:flex-col lg:px-3 lg:py-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 font-sans text-xs font-bold uppercase tracking-wider transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-4 lg:p-8">
          {!data ? (
            <div className="flex h-64 items-center justify-center">
              <span className="font-sans text-lg font-bold uppercase text-muted-foreground">
                Loading...
              </span>
            </div>
          ) : activeTab === "overview" ? (
            <OverviewTab data={data} setActiveTab={setActiveTab} />
          ) : activeTab === "teams" ? (
            <TeamsTab teams={data.teams.filter((t: Team) => t.league !== "MWL")} onAction={apiAction} />
          ) : activeTab === "mwl" ? (
            <TeamsTab teams={data.teams.filter((t: Team) => t.league === "MWL")} onAction={apiAction} />
          ) : activeTab === "players" ? (
            <PlayersTab
              players={data.players}
              teams={data.teams}
              onAction={apiAction}
            />
          ) : activeTab === "games" ? (
            <GamesTab
              games={data.games}
              teams={data.teams}
              onAction={apiAction}
            />
          ) : (
            <NewsTab news={data.news} onAction={apiAction} />
          )}
        </div>
      </main>
    </div>
  )
}

/* ========== OVERVIEW ========== */
function OverviewTab({
  data,
  setActiveTab,
}: {
  data: AppData
  setActiveTab: (tab: Tab) => void
}) {
  const stats = [
    { label: "Teams", value: data.teams.length, tab: "teams" as Tab },
    { label: "Players", value: data.players.length, tab: "players" as Tab },
    { label: "Games", value: data.games.length, tab: "games" as Tab },
    { label: "News Articles", value: data.news.length, tab: "news" as Tab },
  ]

  return (
    <div>
      <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of the Manicaland Basketball Association management system.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={() => setActiveTab(stat.tab)}
            className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/50"
          >
            <div>
              <p className="font-sans text-3xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              Recent Games
            </h2>
          </div>
          <div className="divide-y divide-border">
            {data.games.slice(0, 4).map((game: Game) => {
              const home = data.teams.find((t: Team) => t.id === game.homeTeamId)
              const away = data.teams.find((t: Team) => t.id === game.awayTeamId)
              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-sm text-foreground">
                    {home?.abbreviation} vs {away?.abbreviation}
                  </span>
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                      gameStatusLabel(game.status) === "Final"
                        ? "bg-primary/20 text-primary"
                        : gameStatusLabel(game.status) === "Scheduled"
                          ? "bg-muted text-muted-foreground"
                          : "bg-destructive/20 text-destructive"
                    )}
                  >
                    {gameStatusLabel(game.status) === "Final"
                      ? `${game.homeScore}-${game.awayScore}`
                      : gameStatusLabel(game.status)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              Top Scorers
            </h2>
          </div>
          <div className="divide-y divide-border">
            {[...data.players]
              .sort((a: Player, b: Player) => b.ppg - a.ppg)
              .slice(0, 5)
              .map((player: Player) => {
                const team = data.teams.find((t: Team) => t.id === player.teamId)
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: team?.color }}
                      />
                      <span className="text-sm text-foreground">
                        {player.name}
                      </span>
                    </div>
                    <span className="font-sans text-sm font-bold text-primary">
                      {player.ppg} PPG
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========== TEAMS CRUD ========== */
function TeamsTab({
  teams,
  onAction,
}: {
  teams: Team[]
  onAction: (action: string, entity: string, payload: Record<string, unknown>) => Promise<void>
}) {
  const [editing, setEditing] = useState<Team | null>(null)
  const [creating, setCreating] = useState(false)
  const emptyTeam: Omit<Team, "id"> = {
    name: "",
    city: "",
    abbreviation: "",
    color: "#E86833",
    logo: "/placeholder-logo.svg",
    wins: 0,
    losses: 0,
    league: "major",
    coach: "",
    captain: "",
    chairperson: "",
    founded: 2026,
    arena: "",
  }
  const [form, setForm] = useState<Omit<Team, "id"> & { id?: string; league: string }>({ ...emptyTeam })

  function openCreate() {
    setForm(emptyTeam)
    setCreating(true)
    setEditing(null)
  }

  function openEdit(team: Team) {
    setForm(team)
    setEditing(team)
    setCreating(false)
  }

  async function handleSave() {
    if (editing) {
      await onAction("update", "teams", form)
    } else {
      await onAction("create", "teams", form)
    }
    setCreating(false)
    setEditing(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this team?")) {
      await onAction("delete", "teams", { id })
    }
  }

  const showForm = creating || editing

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">
            Manage Teams
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, or remove teams from the league.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Register Team
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold uppercase text-foreground">
              {editing ? "Edit Team" : "New Team"}
            </h2>
            <button
              onClick={() => { setCreating(false); setEditing(null) }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Team Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FormField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <FormField label="Abbreviation" value={form.abbreviation} onChange={(v) => setForm({ ...form, abbreviation: v.toUpperCase() })} />
            <FormField label="Coach" value={form.coach} onChange={(v) => setForm({ ...form, coach: v })} />
            <FormField label="Captain" value={form.captain} onChange={(v) => setForm({ ...form, captain: v })} />
            <FormField label="Chairperson" value={form.chairperson} onChange={(v) => setForm({ ...form, chairperson: v })} />
            <FormField label="Arena" value={form.arena} onChange={(v) => setForm({ ...form, arena: v })} />
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                League
              </label>
              <select
                value={form.league}
                onChange={(e) => setForm({ ...form, league: e.target.value })}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground"
              >
                <option value="major">major</option>
                <option value="mutare">mutare</option>
                <option value="MWL">MWL</option>
              </select>
            </div>
            <FormField label="Wins" value={String(form.wins)} onChange={(v) => setForm({ ...form, wins: Number(v) || 0 })} type="number" />
            <FormField label="Losses" value={String(form.losses)} onChange={(v) => setForm({ ...form, losses: Number(v) || 0 })} type="number" />
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Color
              </label>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-md border border-border"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {editing ? "Update Team" : "Register Team"}
            </button>
            <button
              onClick={() => { setCreating(false); setEditing(null) }}
              className="rounded-md border border-border px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">City</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Lg.</th>
                <th className="hidden px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">Record</th>
                <th className="px-4 py-2.5 text-right font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teams.map((team) => (
                <tr key={team.id} className="bg-card transition-colors hover:bg-secondary">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-sans text-sm font-bold text-foreground">{team.name}</span>
                      <span className="text-xs text-muted-foreground">({team.abbreviation})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{team.city}</td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">{team.league}</td>
                  <td className="hidden px-4 py-3 text-center font-sans text-sm font-bold text-foreground md:table-cell">{team.wins}-{team.losses}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(team)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label={`Edit ${team.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(team.id)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${team.name}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========== PLAYERS CRUD WITH POPUP MODAL ========== */
function PlayersTab({
  players,
  teams,
  onAction,
}: {
  players: Player[]
  teams: Team[]
  onAction: (action: string, entity: string, payload: Record<string, unknown>) => Promise<void>
}) {
  const [editing, setEditing] = useState<Player | null>(null)
  const [creating, setCreating] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const emptyPlayer: Omit<Player, "id"> = {
    name: "",
    teamId: teams[0]?.id || "1",
    position: "PG",
    number: 0,
    height: "",
    weight: "",
    age: 20,
    ppg: 0,
    rpg: 0,
    apg: 0,
  }
  const [form, setForm] = useState<Omit<Player, "id"> & { id?: string }>(emptyPlayer)

  function openCreate() { setForm(emptyPlayer); setCreating(true); setEditing(null) }
  function openEdit(player: Player) { setForm(player); setEditing(player); setCreating(false) }

  async function handleSave() {
    if (editing) { 
      await onAction("update", "players", form as Record<string, unknown>) 
    } else { 
      await onAction("create", "players", form as Record<string, unknown>) 
      setShowSuccessModal(true) // Triggers the popup modal
    }
    setCreating(false); setEditing(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this player?")) {
      await onAction("delete", "players", { id })
    }
  }

  const showForm = creating || editing
  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <div>
      {/* Pop-up Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Registration Completed"
        message="The player registration has been successfully saved."
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">Manage Players</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, or remove players from the league.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Register Player
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold uppercase text-foreground">{editing ? "Edit Player" : "New Player"}</h2>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Player Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</label>
              <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                {["PG", "SG", "SF", "PF", "C"].map((pos) => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <FormField label="Number" value={String(form.number)} onChange={(v) => setForm({ ...form, number: Number(v) || 0 })} type="number" />
            <FormField label="Height" value={form.height} onChange={(v) => setForm({ ...form, height: v })} placeholder={`e.g. 6'2"`} />
            <FormField label="Weight" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} placeholder="e.g. 185 lbs" />
            <FormField label="Age" value={String(form.age)} onChange={(v) => setForm({ ...form, age: Number(v) || 0 })} type="number" />
            <FormField label="PPG" value={String(form.ppg)} onChange={(v) => setForm({ ...form, ppg: Number(v) || 0 })} type="number" />
            <FormField label="RPG" value={String(form.rpg)} onChange={(v) => setForm({ ...form, rpg: Number(v) || 0 })} type="number" />
            <FormField label="APG" value={String(form.apg)} onChange={(v) => setForm({ ...form, apg: Number(v) || 0 })} type="number" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-md bg-primary px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
              {editing ? "Update Player" : "Register Player"}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="rounded-md border border-border px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Player</th>
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Team</th>
                <th className="hidden px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Pos</th>
                <th className="hidden px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">PPG</th>
                <th className="px-4 py-2.5 text-right font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {players.map((player) => {
                const team = getTeam(player.teamId)
                return (
                  <tr key={player.id} className="bg-card transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <span className="font-sans text-sm font-bold text-foreground">#{player.number} {player.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team?.color }} />
                        <span className="text-sm text-muted-foreground">{team?.abbreviation}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-center text-sm text-muted-foreground sm:table-cell">{player.position}</td>
                    <td className="hidden px-4 py-3 text-center font-sans text-sm font-bold text-primary md:table-cell">{player.ppg}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(player)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label={`Edit ${player.name}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(player.id)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${player.name}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========== GAMES CRUD ========== */
function GamesTab({
  games,
  teams,
  onAction,
}: {
  games: Game[]
  teams: Team[]
  onAction: (action: string, entity: string, payload: Record<string, unknown>) => Promise<void>
}) {
  const [editing, setEditing] = useState<Game | null>(null)
  const [creating, setCreating] = useState(false)
  const emptyGame: Omit<Game, "id"> = {
    homeTeamId: teams[0]?.id || "1",
    awayTeamId: teams[1]?.id || "2",
    homeScore: null,
    awayScore: null,
    date: new Date().toISOString().split("T")[0],
    status: "Scheduled",
    venue: "",
    season: "2026",
  }
  const [form, setForm] = useState<Omit<Game, "id"> & { id?: string }>(emptyGame)

  function openCreate() { setForm(emptyGame); setCreating(true); setEditing(null) }
  function openEdit(game: Game) { setForm(game); setEditing(game); setCreating(false) }

  async function handleSave() {
    if (editing) { await onAction("update", "games", form as Record<string, unknown>) }
    else { await onAction("create", "games", form as Record<string, unknown>) }
    setCreating(false); setEditing(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this game?")) {
      await onAction("delete", "games", { id })
    }
  }

  const showForm = creating || editing
  const getTeam = (id: string) => teams.find((t) => t.id === id)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">Manage Games</h1>
          <p className="mt-1 text-sm text-muted-foreground">Schedule games, update scores, and manage fixtures.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Add Game
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold uppercase text-foreground">{editing ? "Edit Game" : "New Game"}</h2>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Season</label>
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Home Team</label>
              <select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Away Team</label>
              <select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <FormField label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <FormField label="Venue" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
                <option value="Final">Final</option>
              </select>
            </div>
            <FormField label="Home Score" value={form.homeScore !== null ? String(form.homeScore) : ""} onChange={(v) => setForm({ ...form, homeScore: v ? Number(v) : null })} type="number" placeholder="Leave empty if not played" />
            <FormField label="Away Score" value={form.awayScore !== null ? String(form.awayScore) : ""} onChange={(v) => setForm({ ...form, awayScore: v ? Number(v) : null })} type="number" placeholder="Leave empty if not played" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-md bg-primary px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
              {editing ? "Update Game" : "Create Game"}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="rounded-md border border-border px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Matchup</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Date</th>
                <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-right font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {games.map((game) => {
                const home = getTeam(game.homeTeamId)
                const away = getTeam(game.awayTeamId)
                return (
                  <tr key={game.id} className="bg-card transition-colors hover:bg-secondary">
                    <td className="px-4 py-3 font-sans text-sm font-bold text-foreground">{home?.abbreviation} vs {away?.abbreviation}</td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                      {new Date(game.date).toLocaleDateString("en-ZW", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-center font-sans text-sm font-bold text-foreground">
                      {game.homeScore !== null ? `${game.homeScore}-${game.awayScore}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        gameStatusLabel(game.status) === "Final"
                          ? "bg-primary/20 text-primary"
                          : gameStatusLabel(game.status) === "Live"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {gameStatusLabel(game.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(game)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label="Edit game">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(game.id)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label="Delete game">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========== DRAG DROP IMAGE ========== */
function DragDropImage({
  image,
  onImageChange,
  type = "news",
}: {
  image: string
  onImageChange: (path: string) => void
  type?: "news" | "team-logo"
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Please select an image less than 5MB")
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append("type", type || "news")
    formData.append("image", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.success) {
        onImageChange(data.image)
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        alert(data.error || "Upload failed")
      }
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div>
      <Label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        News Image
      </Label>
      <Card className="group relative border-2 border-dashed border-border hover:border-primary transition-colors">
        <CardContent className="p-6 relative flex flex-col items-center justify-center text-center gap-4">
          {previewUrl || image !== "/images/news-1.jpg" ? (
            <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg">
              <Image src={previewUrl || image} alt="Preview" fill className="object-cover group-hover:scale-105 transition-transform duration-200" />
              <Button variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full" onClick={() => { onImageChange("/images/news-1.jpg"); setPreviewUrl(null) }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Drag & drop image here, or click to browse</p>
                <p className="text-xs text-muted-foreground/70">PNG, JPG up to 5MB. Optimized automatically.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading..." : <Upload className="mr-2 h-4 w-4" />}
                Browse
              </Button>
            </>
          )}
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-100",
              isDragging && "opacity-100 bg-primary/10 border-primary/50 border-2 border-dashed rounded-lg"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-primary animate-bounce mx-auto" />
          </div>
        </CardContent>
      </Card>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileSelect(file) }}
        className="sr-only"
      />
    </div>
  )
}

/* ========== NEWS CRUD ========== */
function NewsTab({
  news,
  onAction,
}: {
  news: NewsItem[]
  onAction: (action: string, entity: string, payload: Record<string, unknown>) => Promise<void>
}) {
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [creating, setCreating] = useState(false)
  const emptyNews: Omit<NewsItem, "id"> = {
    title: "",
    excerpt: "",
    content: "",
    image: "/images/news-1.jpg",
    date: new Date().toISOString().split("T")[0],
    category: "Game Recap",
  }
  const [form, setForm] = useState<Omit<NewsItem, "id"> & { id?: string }>(emptyNews)

  function openCreate() { setForm(emptyNews); setCreating(true); setEditing(null) }
  function openEdit(item: NewsItem) { setForm(item); setEditing(item); setCreating(false) }

  async function handleSave() {
    if (editing) { await onAction("update", "news", form as Record<string, unknown>) }
    else { await onAction("create", "news", form as Record<string, unknown>) }
    setCreating(false); setEditing(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this article?")) {
      await onAction("delete", "news", { id })
    }
  }

  const showForm = creating || editing

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">Manage News</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, edit, or remove news articles and announcements.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Register Article
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold uppercase text-foreground">{editing ? "Edit Article" : "New Article"}</h2>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <div>
              <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground">
                <option value="Game Recap">Game Recap</option>
                <option value="Standings">Standings</option>
                <option value="Events">Events</option>
                <option value="Transfers">Transfers</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>
            <FormField label="Date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
            <div className="sm:col-span-2">
              <DragDropImage image={form.image} onImageChange={(path: string) => setForm({ ...form, image: path })} />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Short summary of the article..." />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Content</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Full article content..." />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} className="rounded-md bg-primary px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90">
              {editing ? "Update Article" : "Create Article"}
            </button>
            <button onClick={() => { setCreating(false); setEditing(null) }} className="rounded-md border border-border px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Category</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">Date</th>
                <th className="px-4 py-2.5 text-right font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {news.map((item) => (
                <tr key={item.id} className="bg-card transition-colors hover:bg-secondary">
                  <td className="max-w-xs px-4 py-3">
                    <span className="font-sans text-sm font-bold text-foreground line-clamp-1">{item.title}</span>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{item.category}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">
                    {new Date(item.date).toLocaleDateString("en-ZW", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(item)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary" aria-label={`Edit ${item.title}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${item.title}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ========== FORM FIELD HELPER ========== */
function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}