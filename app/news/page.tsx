"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNews().then((data) => {
      setNews(data)
      setLoading(false)
    })
  }, [])

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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex-1">
        <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
          <img src="/logo13.png" alt="" className="h-full w-full object-contain" />
        </div>

        <section className="border-b border-border bg-secondary py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">MBA</p>
            <h1 className="mt-1 font-sans text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
              News & Updates
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Stay up to date with the latest from the Manicaland Basketball Association.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8">
              {news.map((item, i) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
                >
                  <div className={`grid gap-0 ${i === 0 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                    <div className={`relative ${i === 0 ? "aspect-video md:aspect-auto" : "aspect-video md:col-span-1"}`}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        quality={100}
                        sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                      />
                    </div>
                    <div className={`flex flex-col justify-center p-6 ${i === 0 ? "" : "md:col-span-2"}`}>
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-primary/20 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString("en-ZW", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <h2 className="mt-3 font-sans text-2xl font-bold uppercase leading-tight text-foreground text-pretty">
                        {item.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
