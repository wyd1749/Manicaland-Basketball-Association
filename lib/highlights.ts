export type HighlightCategory = "games" | "top-plays" | "player-spotlight" | "season"

// Each category has its own Supabase Storage bucket
export const CATEGORIES: {
  value: HighlightCategory
  label: string
  tag: string
  bucket: string
}[] = [
  { value: "games", label: "Games", tag: "Game Highlights", bucket: "highlights-games" },
  { value: "top-plays", label: "Top Plays", tag: "Top Plays", bucket: "highlights-top-plays" },
  {
    value: "player-spotlight",
    label: "Player Spotlight",
    tag: "Player Spotlight",
    bucket: "highlights-player-spotlight",
  },
  { value: "season", label: "Season Highlights", tag: "Season Highlights", bucket: "highlights-season" },
]

export interface Highlight {
  id: string
  title: string
  description: string
  category: HighlightCategory
  videoPath: string
  thumbnailPath: string | null
  durationSeconds: number
  views: number
  featured: boolean
  publishedAt: string
}

export function categoryInfo(category: string) {
  return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0]
}

export function mapHighlight(row: Record<string, unknown>): Highlight {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    category: categoryInfo(String(row.category ?? "games")).value,
    videoPath: String(row.video_path ?? ""),
    thumbnailPath: row.thumbnail_path ? String(row.thumbnail_path) : null,
    durationSeconds: Number(row.duration_seconds ?? 0) || 0,
    views: Number(row.views ?? 0) || 0,
    featured: Boolean(row.featured),
    publishedAt: String(row.published_at ?? row.created_at ?? "").slice(0, 10),
  }
}

export function mediaUrl(category: HighlightCategory, path?: string | null): string | null {
  if (!path) return null
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${categoryInfo(category).bucket}/${encodeURI(path)}`
}

export function formatDuration(total: number): string {
  const s = Math.max(0, Math.round(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const mm = String(m).padStart(2, "0")
  const ss = String(s % 60).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return String(n)
}

export function formatDate(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T12:00:00`)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}