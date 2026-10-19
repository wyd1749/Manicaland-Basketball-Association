"use client"

import { useEffect, useRef, useState } from "react"
import { Smile } from "lucide-react"

const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: "Sports",
    icon: "🏀",
    emojis: [
      "🏀", "⛹️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖️", "🔥", "💪", "⚡", "🎯",
      "👏", "🙌", "📣", "📢", "🏟️", "⏱️", "📊", "📈", "🆚", "✅", "🚨", "🆕",
    ],
  },
  {
    label: "Faces",
    icon: "😀",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😍", "🤩", "😎",
      "🥳", "😮", "😲", "😢", "😭", "😤", "😡", "🤔", "🙏", "👍", "👎", "🤝",
    ],
  },
  {
    label: "Symbols",
    icon: "⭐",
    emojis: [
      "⭐", "🌟", "✨", "💥", "💯", "❤️", "🧡", "💛", "💚", "💙", "🖤", "🤍",
      "➡️", "⬆️", "⬇️", "▶️", "📌", "📍", "🔔", "🎉", "🎊", "🎥", "📸", "🎬",
    ],
  },
  {
    label: "Flags",
    icon: "🇿🇼",
    emojis: ["🇿🇼", "🏁", "🚩", "🏳️", "🌍", "🌅", "⛰️", "🏔️", "🌄", "🏞️"],
  },
]

/**
 * Put an emoji into a text field at the cursor position.
 * Works with a <textarea> or <input>. Pass the field's ref, its current value
 * and its state setter.
 */
export function insertEmoji(
  field: HTMLTextAreaElement | HTMLInputElement | null,
  value: string,
  setValue: (next: string) => void,
  emoji: string
) {
  if (!field) {
    setValue(value + emoji)
    return
  }
  const start = field.selectionStart ?? value.length
  const end = field.selectionEnd ?? value.length
  setValue(value.slice(0, start) + emoji + value.slice(end))
  // Put the cursor right after the emoji once React has updated the field
  const pos = start + emoji.length
  requestAnimationFrame(() => {
    field.focus()
    field.setSelectionRange(pos, pos)
  })
}

export function EmojiPicker({
  onSelect,
  className = "",
  compact = false,
}: {
  onSelect: (emoji: string) => void
  className?: string
  /** Smaller button that opens towards the left (for use beside a field label) */
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={box} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-md border border-border bg-secondary font-sans font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-ring ${compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-2 text-xs"}`}
      >
        <Smile className="size-4" aria-hidden />
        Emoji
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose an emoji"
          className={`absolute top-full z-50 mt-2 w-72 max-w-[85vw] overflow-hidden rounded-lg border border-border bg-popover shadow-xl ${compact ? "right-0" : "left-0"}`}
        >
          <div className="flex border-b border-border">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                aria-label={c.label}
                aria-pressed={tab === i}
                onClick={() => setTab(i)}
                className={`flex-1 py-2 text-lg transition-colors ${
                  tab === i ? "bg-primary/20" : "hover:bg-secondary"
                }`}
              >
                {c.icon}
              </button>
            ))}
          </div>
          <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-2">
            {CATEGORIES[tab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className="flex size-8 items-center justify-center rounded text-xl transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
