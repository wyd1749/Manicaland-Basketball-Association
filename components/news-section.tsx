"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"

interface NewsItem {
  id: string
  title: string
  excerpt: string
  image: string
  date: string
  category: string
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("news")
      .select("id, title, excerpt, image, date, category")
      .order("date", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setNews(data)
      })
  }, [])

  if (!news.length) return null

  return (
    <section className="border-t border-border bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Latest
            </p>
            <h2 className="mt-1 font-sans text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              News & Updates
            </h2>
          </div>
          <Link
            href="/news"
            className="hidden font-sans text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:text-primary/80 md:block"
          >
            {"View All >"}
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {news.map((item) => (
            <Link
              key={item.id}
              href="/news"
              className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50"
            >
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded bg-primary px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(item.date).toLocaleDateString("en-ZW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <h3 className="mt-2 font-sans text-lg font-bold uppercase leading-tight text-foreground text-pretty">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}