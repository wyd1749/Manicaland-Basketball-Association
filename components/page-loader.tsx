"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

/*
  Full-screen loading screen: the MBA logo inside a spinning ring.
  - Shows when the site first opens
  - Shows again each time someone clicks a link to another page
  - Always stays visible for at least MIN_MS so it never just flickers
*/

const MIN_MS = 800 // shortest time the loader stays on screen
const MAX_MS = 8000 // safety: never get stuck on screen longer than this
const LOGO_SRC = "/logo13.png"

export function PageLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true) // true on first render so the page never flashes before the loader
  const shownAt = useRef<number>(Date.now())
  const hideTimer = useRef<number | undefined>(undefined)
  const safetyTimer = useRef<number | undefined>(undefined)
  const firstRender = useRef(true)

  const show = useCallback(() => {
    window.clearTimeout(hideTimer.current)
    window.clearTimeout(safetyTimer.current)
    shownAt.current = Date.now()
    setVisible(true)
    safetyTimer.current = window.setTimeout(() => setVisible(false), MAX_MS)
  }, [])

  const hide = useCallback(() => {
    window.clearTimeout(hideTimer.current)
    const wait = Math.max(0, MIN_MS - (Date.now() - shownAt.current))
    hideTimer.current = window.setTimeout(() => {
      window.clearTimeout(safetyTimer.current)
      setVisible(false)
    }, wait)
  }, [])

  // First visit: hide once the page has finished loading
  useEffect(() => {
    shownAt.current = Date.now()
    safetyTimer.current = window.setTimeout(() => setVisible(false), MAX_MS)
    if (document.readyState === "complete") {
      hide()
    } else {
      window.addEventListener("load", hide, { once: true })
    }
    return () => {
      window.removeEventListener("load", hide)
      window.clearTimeout(hideTimer.current)
      window.clearTimeout(safetyTimer.current)
    }
  }, [hide])

  // New page arrived: hide the loader
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    hide()
  }, [pathname, hide])

  // Link clicked (or back/forward pressed): show the loader
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element | null)?.closest?.("a")
      if (!anchor || !anchor.href) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return
      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname) return
      show()
    }
    const onPop = () => show()

    // Capture phase so we run before Next's own link handler
    document.addEventListener("click", onClick, true)
    window.addEventListener("popstate", onPop)
    return () => {
      document.removeEventListener("click", onClick, true)
      window.removeEventListener("popstate", onPop)
    }
  }, [show])

  return (
    <>
      <noscript>
        <style>{".page-loader{display:none!important}"}</style>
      </noscript>
      <div
        role="status"
        aria-label="Loading"
        aria-hidden={!visible}
        className={`page-loader fixed inset-0 z-[100] flex items-center justify-center bg-background transition-[opacity,visibility] duration-500 ${
          visible ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="relative flex size-40 items-center justify-center">
          {/* Soft glow */}
          <div aria-hidden className="absolute inset-4 rounded-full bg-primary/10 blur-xl" />

          {/* Ring: faint track + spinning orange arc */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 size-full">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full animate-spin text-primary [animation-duration:1.1s] motion-reduce:animate-none"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="72 217"
            />
          </svg>

          {/* League logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="" className="relative size-24 object-contain" />
        </div>
      </div>
    </>
  )
}
