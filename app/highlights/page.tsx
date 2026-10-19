"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flame,
  Play,
  Search,
  Star,
  X,
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  CATEGORIES,
  categoryInfo,
  formatDate,
  formatDuration,
  formatViews,
  mapHighlight,
  mediaUrl,
  type Highlight,
  type HighlightCategory,
} from "@/lib/highlights"

// Banner image in the /public folder (change the extension here if needed)
const BANNER_IMAGE = "/highlights-banner.webp"
const PAGE_SIZE = 6

function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | "…")[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) out.push("…")
  for (let i = start; i <= end; i++) out.push(i)
  if (end < total - 1) out.push("…")
  out.push(total)
  return out
}

function Thumb({
  item,
  className,
  children,
}: {
  item: Highlight
  className?: string
  children?: React.ReactNode
}) {
  const src = mediaUrl(item.category, item.thumbnailPath)
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br from-secondary to-black", className)}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      {children}
    </div>
  )
}

function PlayBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute bottom-3 left-3 flex size-9 items-center justify-center rounded-full bg-black/70 text-white ring-2 ring-white/80 transition-transform group-hover:scale-110",
        className
      )}
    >
      <Play className="size-4 fill-current" aria-hidden />
    </span>
  )
}

function HighlightCard({ item, onOpen }: { item: Highlight; onOpen: (h: Highlight) => void }) {
  const info = categoryInfo(item.category)
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card/80 transition-colors hover:border-primary/60">
      <button type="button" onClick={() => onOpen(item)} aria-label={`Play ${item.title}`} className="group block text-left">
        <Thumb item={item} className="aspect-video w-full">
          <PlayBadge />
          <span className="absolute right-3 top-3 rounded bg-black/70 px-2 py-0.5 font-sans text-xs font-semibold text-white">
            {formatDuration(item.durationSeconds)}
          </span>
        </Thumb>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded bg-primary px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
          {info.tag}
        </span>
        <h3 className="mt-2 font-sans text-lg font-bold leading-tight text-foreground">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden />
              {formatDate(item.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {formatViews(item.views)} views
            </span>
          </span>
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="inline-flex shrink-0 items-center gap-1 rounded border border-primary px-3 py-1 font-sans text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Watch Now
            <ArrowRight className="size-3" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

function PlayerModal({ item, onClose }: { item: Highlight; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  const src = mediaUrl(item.category, item.videoPath)
  const poster = mediaUrl(item.category, item.thumbnailPath) ?? undefined

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-2xl"
      >
        <div className="relative bg-black">
          {src ? (
            <video src={src} poster={poster} controls autoPlay playsInline className="aspect-video w-full" />
          ) : (
            <div className="flex aspect-video items-center justify-center text-muted-foreground">
              This video is not available.
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="p-5">
          <span className="rounded bg-primary px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
            {categoryInfo(item.category).tag}
          </span>
          <h2 className="mt-2 font-sans text-2xl font-bold text-foreground">{item.title}</h2>
          {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
          <p className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" aria-hidden />
              {formatDate(item.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {formatViews(item.views)} views
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function HighlightsPage() {
  const [items, setItems] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [category, setCategory] = useState<"all" | HighlightCategory>("all")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<Highlight | null>(null)

  useEffect(() => {
    async function load() {
      const { data, error: loadError } = await createClient()
        .from("highlights")
        .select("*")
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false })
      if (loadError) {
        console.error("Failed to load highlights:", loadError)
        setError("Could not load highlights. Please refresh the page and try again.")
      } else {
        setItems((data ?? []).map(mapHighlight))
      }
      setLoading(false)
    }
    load()
  }, [])

  function open(item: Highlight) {
    setActive(item)
    // Count one view per video per browser session
    try {
      const key = `highlight-viewed-${item.id}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
      createClient()
        .rpc("increment_highlight_views", { h_id: item.id })
        .then(({ error: rpcError }) => {
          if (!rpcError) {
            setItems((prev) => prev.map((h) => (h.id === item.id ? { ...h, views: h.views + 1 } : h)))
          }
        })
    } catch {
      // Storage blocked: skip counting
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((h) => {
      if (category !== "all" && h.category !== category) return false
      if (!q) return true
      return `${h.title} ${h.description} ${categoryInfo(h.category).tag}`.toLowerCase().includes(q)
    })
  }, [items, category, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const featured = items.find((h) => h.featured) ?? items[0]
  const trending = useMemo(() => [...items].sort((a, b) => b.views - a.views).slice(0, 3), [items])

  const chipClass = (isActive: boolean) =>
    cn(
      "rounded-full border px-5 py-2 font-sans text-sm font-semibold transition-colors",
      isActive
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card/70 text-foreground hover:border-primary hover:text-primary"
    )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background">
        {/* Banner. Image file lives in /public (see BANNER_IMAGE at the top) */}
        <section className="relative overflow-hidden border-b border-primary/40 bg-gradient-to-b from-secondary to-background">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-[position:70%_center] bg-no-repeat md:bg-center"
            style={{ backgroundImage: `url('${BANNER_IMAGE}')` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16 lg:px-8">
            <p className="font-sans text-lg font-bold uppercase tracking-wide text-primary">Highlights</p>
            <h1 className="font-sans text-5xl font-bold uppercase leading-[0.95] sm:text-6xl md:text-7xl">
              <span className="block text-foreground">Best Moments</span>
              <span className="block text-primary">On Court</span>
            </h1>
            <p className="mt-5 max-w-xl border-l-4 border-primary pl-4 text-base text-foreground/85">
              Relive the most exciting plays, top performances and unforgettable moments from the Manicaland
              Basketball Association.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => {
                  setCategory("all")
                  setPage(1)
                }}
                className={chipClass(category === "all")}
              >
                All Highlights
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={category === c.value}
                  onClick={() => {
                    setCategory(c.value)
                    setPage(1)
                  }}
                  className={chipClass(category === c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search highlights..."
                aria-label="Search highlights"
                className="w-full rounded-full border border-border bg-card/70 py-2.5 pl-11 pr-4 font-sans text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            {/* Videos */}
            <div>
              {loading && <p className="py-20 text-center text-muted-foreground">Loading highlights...</p>}
              {!loading && error && <p className="py-20 text-center text-destructive">{error}</p>}
              {!loading && !error && filtered.length === 0 && (
                <p className="py-20 text-center font-sans text-lg font-bold uppercase text-muted-foreground">
                  No highlights found
                </p>
              )}

              {visible.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((item) => (
                    <HighlightCard key={item.id} item={item} onOpen={open} />
                  ))}
                </div>
              )}

              {filtered.length > PAGE_SIZE && (
                <nav aria-label="Highlights pages" className="mt-8 flex items-center justify-center gap-2">
                  {current > 1 && (
                    <button
                      type="button"
                      onClick={() => setPage(current - 1)}
                      aria-label="Previous page"
                      className="rounded-md border border-border bg-card px-3 py-2 text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronLeft className="size-4" aria-hidden />
                    </button>
                  )}
                  {pageList(current, totalPages).map((entry, i) =>
                    entry === "…" ? (
                      <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden>
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        type="button"
                        onClick={() => setPage(entry)}
                        aria-current={entry === current ? "page" : undefined}
                        className={cn(
                          "min-w-10 rounded-md border px-3 py-2 font-sans text-sm font-semibold transition-colors",
                          entry === current
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                        )}
                      >
                        {entry}
                      </button>
                    )
                  )}
                  {current < totalPages && (
                    <button
                      type="button"
                      onClick={() => setPage(current + 1)}
                      aria-label="Next page"
                      className="rounded-md border border-border bg-card px-3 py-2 text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ChevronRight className="size-4" aria-hidden />
                    </button>
                  )}
                </nav>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {featured && (
                <div className="rounded-xl border border-primary/50 bg-card/80 p-4">
                  <h2 className="flex items-center gap-2 border-b border-primary/40 pb-3 font-sans text-sm font-bold uppercase tracking-wide text-primary">
                    <Star className="size-4" aria-hidden />
                    Featured Highlight
                  </h2>
                  <button
                    type="button"
                    onClick={() => open(featured)}
                    aria-label={`Play ${featured.title}`}
                    className="group mt-4 block w-full text-left"
                  >
                    <Thumb item={featured} className="aspect-video w-full rounded-lg border border-border">
                      <PlayBadge />
                      <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 font-sans text-xs font-semibold text-white">
                        {formatDuration(featured.durationSeconds)}
                      </span>
                    </Thumb>
                  </button>
                  <h3 className="mt-3 font-sans text-lg font-bold text-foreground">{featured.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{featured.description}</p>
                  <button
                    type="button"
                    onClick={() => open(featured)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-sans text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Watch Now
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              )}

              {trending.length > 0 && (
                <div className="rounded-xl border border-primary/50 bg-card/80 p-4">
                  <h2 className="flex items-center gap-2 border-b border-primary/40 pb-3 font-sans text-sm font-bold uppercase tracking-wide text-primary">
                    <Flame className="size-4" aria-hidden />
                    Trending
                  </h2>
                  <ul className="mt-2 divide-y divide-border">
                    {trending.map((h) => (
                      <li key={h.id}>
                        <button
                          type="button"
                          onClick={() => open(h)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/5"
                        >
                          <Thumb item={h} className="aspect-video w-28 shrink-0 rounded-md">
                            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 text-[10px] font-semibold text-white">
                              {formatDuration(h.durationSeconds)}
                            </span>
                          </Thumb>
                          <span className="min-w-0">
                            <span className="line-clamp-2 block font-sans text-sm font-bold text-foreground">
                              {h.title}
                            </span>
                            <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="size-3.5" aria-hidden />
                              {formatViews(h.views)} views
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
      {active && <PlayerModal item={active} onClose={() => setActive(null)} />}
    </div>
  )
}