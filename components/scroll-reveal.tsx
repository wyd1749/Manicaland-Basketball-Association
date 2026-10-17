"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/*
  Site-wide on-scroll transitions.

  Add <ScrollReveal /> once in app/layout.tsx and every page gets the effect:
  - each top-level <section> inside <main> fades and slides up as it scrolls into view
  - items inside a grid (cards, team tiles, news cards) do the same, staggered
  - anything already on screen when the page loads is left alone (no flash)
  - nothing happens for visitors who prefer reduced motion

  Styles live in scroll-reveal.css (paste into app/globals.css).
*/

const TARGETS = "main > section, main .grid > *"
const MAX_STAGGER = 5
const STAGGER_MS = 80

export function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!("IntersectionObserver" in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          io.unobserve(el)
          el.setAttribute("data-reveal", "in")

          // Once the animation ends, hand the element back to its own styles
          // so hover effects and transitions keep working.
          const cleanup = () => {
            el.removeAttribute("data-reveal")
            el.style.removeProperty("--reveal-delay")
          }
          const onEnd = (e: TransitionEvent) => {
            if (e.target !== el || e.propertyName !== "opacity") return
            el.removeEventListener("transitionend", onEnd)
            cleanup()
          }
          el.addEventListener("transitionend", onEnd)
          window.setTimeout(cleanup, 1600)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    )

    const scan = () => {
      document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
        if (el.hasAttribute("data-reveal-seen")) return
        el.setAttribute("data-reveal-seen", "")
        if (el.closest("[role='dialog']")) return

        // Already visible (or not rendered): leave it alone
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return

        const parent = el.parentElement
        if (parent?.classList.contains("grid")) {
          const index = Array.prototype.indexOf.call(parent.children, el)
          el.style.setProperty("--reveal-delay", `${Math.min(index, MAX_STAGGER) * STAGGER_MS}ms`)
        }

        el.setAttribute("data-reveal", "")
        io.observe(el)
      })
    }

    // Pages load their data after mounting, so keep watching for new content.
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(scan)
    }
    const mo = new MutationObserver(schedule)
    mo.observe(document.body, { childList: true, subtree: true })
    schedule()

    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      io.disconnect()
      // Never leave anything hidden if the effect is torn down mid-way
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.removeAttribute("data-reveal")
      })
    }
  }, [pathname])

  return null
}
