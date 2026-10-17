"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Name of the public Supabase Storage bucket that holds the team logos
const LOGO_BUCKET = "team-logos"
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
}

interface LogoDropzoneProps {
  /** Current logo: a file name in the bucket, a full URL, or a /public path */
  value?: string | null
  /** Called with the new file name after an upload, or "" when the logo is removed */
  onChange: (logo: string) => void
  /** Used to name the uploaded file, e.g. the team code or name */
  name?: string
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "team"
  )
}

function previewUrl(value?: string | null): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value
  return createClient().storage.from(LOGO_BUCKET).getPublicUrl(value).data.publicUrl
}

export function LogoDropzone({ value, onChange, name }: LogoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const preview = previewUrl(value)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError("")

    const ext = EXTENSIONS[file.type]
    if (!ext) {
      setError("Use a PNG, WebP, JPG or SVG image.")
      return
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 2 MB. Please compress it first (squoosh.app works well).")
      return
    }

    setUploading(true)
    const path = `${slugify(name || "team")}-${Date.now()}.${ext}`
    const { error: uploadError } = await createClient()
      .storage.from(LOGO_BUCKET)
      .upload(path, file, { cacheControl: "31536000", contentType: file.type })
    setUploading(false)

    if (uploadError) {
      console.error("Logo upload failed:", uploadError)
      setError(`Upload failed: ${uploadError.message}`)
      return
    }
    onChange(path)
  }

  function openPicker() {
    if (!uploading) inputRef.current?.click()
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload team logo. Drag and drop an image or press Enter to browse."
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className={
          "flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring " +
          (dragging ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60")
        }
      >
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Team logo preview" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="size-7 text-muted-foreground" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 text-sm">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <UploadCloud className="size-4 text-primary" aria-hidden />
            {uploading ? "Uploading..." : dragging ? "Drop it here" : "Drag and drop a logo here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse. PNG, WebP, JPG or SVG, up to 2 MB. A square image with a transparent
            background looks best.
          </p>
        </div>

        {preview && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            aria-label="Remove logo"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}