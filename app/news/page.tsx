"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowRight, CalendarDays, ImageIcon, Megaphone, Newspaper, Trophy } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getNews } from "@/lib/api"

interface NewsItem {
  id: string
  title: string
  excerpt: string
  content: string
  image: string
  date: string
  category: string
}

const FILTERS = [
  { label: "All News", match: null, icon: Newspaper },
  { label: "Announcements", match: "announcement", icon: Megaphone },
  { label: "Game Recaps", match: "game recap", icon: Trophy },
  { label: "Media", match: "media", icon: ImageIcon },
] as const

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-primary px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
      {children}
    </span>
  )
}

function DateLabel({ date }: { date: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-foreground/90">
      <CalendarDays className="h-4 w-4 text-primary" />
      {formatDate(date)}
    </span>
  )
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    getNews().then((data) => {
      setNews(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(
    () => (filter ? news.filter((n) => n.category.toLowerCase() === filter) : news),
    [news, filter]
  )
  const featured = filtered[0]
  const others = filtered.slice(1)

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="font-sans text-lg font-bold uppercase text-muted-foreground">Loading...</div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-10">
          <img src="/logo13.png" alt="" className="h-full w-full object-contain" />
        </div>

        <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_440px]">
            {/* LEFT: title + filters */}
            <aside className="self-start rounded-xl border border-primary/30 bg-card/80 p-5 backdrop-blur">
              <div className="flex items-start gap-4 border-l-4 border-primary pl-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-primary text-primary">
                  <Newspaper className="h-8 w-8" />
                </div>
                <h1 className="font-sans text-3xl font-extrabold uppercase leading-none tracking-tight text-foreground">
                  News &amp;
                  <span className="mt-1 block text-4xl text-primary">Updates</span>
                </h1>
              </div>

              <p className="mt-6 border-l-4 border-primary pl-4 text-sm leading-relaxed text-foreground/80">
                Latest news, match reports, announcements and more from the Manicaland Basketball Association.
              </p>

              <nav className="mt-6 flex flex-col gap-1.5" aria-label="News categories">
                {FILTERS.map(({ label, match, icon: Icon }) => {
                  const active = filter === match
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setFilter(match)
                        setOpenId(null)
                      }}
                      aria-pressed={active}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-sans text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
                          : "text-foreground/80 hover:bg-primary/10 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{label}</span>
                      {active && <ArrowRight className="h-4 w-4 opacity-70" />}
                    </button>
                  )
                })}
              </nav>
            </aside>

            {/* CENTER: featured story */}
            {featured ? (
              <article className="relative isolate min-h-[420px] overflow-hidden rounded-xl border border-primary/50 bg-card lg:min-h-[560px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  priority
                  quality={100}
                  sizes="(max-width: 1280px) 100vw, 55vw"
                  className="-z-20 object-cover"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col gap-3 overflow-y-auto p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <CategoryBadge>{featured.category}</CategoryBadge>
                    <DateLabel date={featured.date} />
                  </div>
                  <h2 className="font-sans text-3xl font-extrabold uppercase italic leading-tight text-white text-pretty md:text-5xl">
                    {featured.title}
                  </h2>
                  <p className="max-w-2xl text-base leading-relaxed text-white/90">
                    {openId === featured.id ? featured.content : featured.excerpt || featured.content}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggle(featured.id)}
                    className="mt-2 flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-3 font-sans text-base font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {openId === featured.id ? "Show Less" : "Read More"}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </article>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
                No stories in this category yet.
              </div>
            )}

            {/* RIGHT: more stories */}
            {others.length > 0 && (
              <div className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1">
                {others.map((item) => {
                  const open = openId === item.id
                  return (
                    <article
                      key={item.id}
                      className="grid overflow-hidden rounded-xl border border-primary/30 bg-card/90 transition-colors hover:border-primary sm:grid-cols-[170px_minmax(0,1fr)] xl:grid-cols-[170px_minmax(0,1fr)]"
                    >
                      <div className="relative aspect-video sm:aspect-auto sm:min-h-[150px]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          quality={100}
                          sizes="(max-width: 640px) 100vw, 170px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <CategoryBadge>{item.category}</CategoryBadge>
                          <DateLabel date={item.date} />
                        </div>
                        <h3 className="font-sans text-xl font-extrabold uppercase italic leading-tight text-foreground text-pretty">
                          {item.title}
                        </h3>
                        <p className={`text-sm leading-relaxed text-muted-foreground ${open ? "" : "line-clamp-2"}`}>
                          {open ? item.content : item.excerpt || item.content}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          className="mt-1 flex w-fit items-center gap-2 font-sans text-sm font-bold text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {open ? "Show Less" : "Read More"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}