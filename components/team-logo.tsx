"use client"

import { useState } from "react"

// Same bucket the Teams page uses
const LOGO_BUCKET = "team-logos"

/* A logo value can be: a full URL, a /public path like "/logos/cwb.png",
   or just a file name in the Supabase bucket like "cwb.png". */
export function logoUrl(logo?: string | null): string | null {
  if (!logo) return null
  if (/^https?:\/\//i.test(logo) || logo.startsWith("/")) return logo
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return null
  return `${base}/storage/v1/object/public/${LOGO_BUCKET}/${logo}`
}

/* Supabase rows may store the logo in any of these columns (same as the Teams page). */
export function pickLogo(row: Record<string, any> | null | undefined): string | null {
  if (!row) return null
  return row.logo ?? row.logo_url ?? row.logo_path ?? null
}

interface TeamLogoProps {
  name: string
  logo?: string | null
  abbreviation?: string | null
  color?: string | null
  /** Tailwind size classes, e.g. "h-8 w-8" */
  className?: string
}

/** Round team logo with the coloured-initials circle as a fallback. */
export function TeamLogo({
  name,
  logo,
  abbreviation,
  color,
  className = "h-8 w-8",
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false)
  const src = logoUrl(logo)
  const tint = color || "#f97316"

  if (!src || failed) {
    return (
      <div
        className={`${className} flex shrink-0 items-center justify-center rounded-full font-sans text-[10px] font-bold text-white`}
        style={{ backgroundColor: tint }}
      >
        {(abbreviation || name).slice(0, 3).toUpperCase()}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 object-contain`}
    />
  )
}