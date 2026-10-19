"use client"

import { useEffect, useRef, useState } from "react"
import {
  Film,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  CATEGORIES,
  categoryInfo,
  formatDate,
  formatDuration,
  formatViews,
  mediaUrl,
  type Highlight,
  type HighlightCategory,
} from "@/lib/highlights"

// Largest video accepted. Supabase's free plan allows 50 MB per file.
// If your plan allows more, raise it here and in the bucket SQL.
const MAX_VIDEO_MB = 50

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
}
const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const labelClass =
  "mb-1.5 block font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground"
const inputClass =
  "w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"

interface FormState {
  title: string
  description: string
  category: HighlightCategory
  publishedAt: string
  featured: boolean
}

const emptyForm = (): FormState => ({
  title: "",
  description: "",
  category: "games",
  publishedAt: new Date().toISOString().split("T")[0],
  featured: false,
})

function videoMime(file: File): string {
  if (file.type) return file.type
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "mp4") return "video/mp4"
  if (ext === "webm") return "video/webm"
  if (ext === "mov") return "video/quicktime"
  return ""
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "highlight"
  )
}

function cleanName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
}

// Reads the video length and grabs a frame to use as the thumbnail
function readVideoMeta(file: File): Promise<{ duration: number; thumb: Blob | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    let settled = false

    const finish = (thumb: Blob | null) => {
      if (settled) return
      settled = true
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : 0
      URL.revokeObjectURL(url)
      resolve({ duration, thumb })
    }

    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    video.onerror = () => finish(null)
    video.onloadedmetadata = () => {
      const d = Number.isFinite(video.duration) ? video.duration : 0
      video.currentTime = Math.min(1, d / 4) || 0.1
    }
    video.onseeked = () => {
      if (!video.videoWidth) return finish(null)
      const width = Math.min(640, video.videoWidth)
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = Math.round((width * video.videoHeight) / video.videoWidth)
      const ctx = canvas.getContext("2d")
      if (!ctx) return finish(null)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => finish(blob), "image/jpeg", 0.8)
    }
    window.setTimeout(() => finish(null), 15000)
    video.src = url
  })
}

async function uploadFile(bucket: string, path: string, body: Blob, contentType: string) {
  const { error } = await createClient()
    .storage.from(bucket)
    .upload(path, body, { contentType, cacheControl: "31536000", upsert: false })
  if (error) throw new Error(`Upload failed: ${error.message}`)
}

export function HighlightsTab({
  highlights,
  onChanged,
}: {
  highlights: Highlight[]
  onChanged: () => Promise<void> | void
}) {
  const [editing, setEditing] = useState<Highlight | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [duration, setDuration] = useState(0)
  const [thumbBlob, setThumbBlob] = useState<Blob | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const videoInput = useRef<HTMLInputElement>(null)
  const thumbInput = useRef<HTMLInputElement>(null)
  const thumbUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current)
    }
  }, [])

  const showForm = creating || editing !== null
  const bucket = categoryInfo(form.category).bucket

  function setThumb(blob: Blob | null) {
    if (thumbUrlRef.current) URL.revokeObjectURL(thumbUrlRef.current)
    const url = blob ? URL.createObjectURL(blob) : null
    thumbUrlRef.current = url
    setThumbBlob(blob)
    setThumbPreview(url)
  }

  function resetMedia() {
    setVideoFile(null)
    setDuration(0)
    setThumb(null)
    setReading(false)
    setError("")
  }

  function openCreate() {
    resetMedia()
    setNotice("")
    setForm(emptyForm())
    setEditing(null)
    setCreating(true)
  }

  function openEdit(item: Highlight) {
    resetMedia()
    setNotice("")
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      publishedAt: item.publishedAt,
      featured: item.featured,
    })
    setCreating(false)
    setEditing(item)
  }

  function closeForm() {
    setCreating(false)
    setEditing(null)
    resetMedia()
  }

  async function handleVideo(file?: File) {
    if (!file) return
    setError("")
    const mime = videoMime(file)
    if (!VIDEO_EXT[mime]) {
      setError("Use an MP4, WebM or MOV video.")
      return
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setError(
        `That video is ${(file.size / 1024 / 1024).toFixed(0)} MB. The limit is ${MAX_VIDEO_MB} MB, so please compress it first.`
      )
      return
    }
    setVideoFile(file)
    setReading(true)
    const meta = await readVideoMeta(file)
    setDuration(meta.duration)
    setThumb(meta.thumb)
    setReading(false)
    setForm((f) => (f.title ? f : { ...f, title: cleanName(file.name) }))
  }

  function handleThumb(file?: File) {
    if (!file) return
    setError("")
    if (!IMAGE_EXT[file.type]) {
      setError("Use a JPG, PNG or WebP image for the thumbnail.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("The thumbnail must be under 5 MB.")
      return
    }
    setThumb(file)
  }

  async function handleSave() {
    setError("")
    setNotice("")
    if (!form.title.trim()) {
      setError("Please enter a title.")
      return
    }
    if (!editing && !videoFile) {
      setError("Drop a video file first.")
      return
    }

    const supabase = createClient()
    const targetBucket = categoryInfo(form.category).bucket
    const wasEditing = editing !== null
    const uploaded: string[] = []
    let committed = false
    let savedId = ""

    setBusy(true)
    try {
      const base = `${slugify(form.title)}-${Date.now()}`

      let thumbnailPath = editing?.thumbnailPath ?? null
      let newThumbPath: string | null = null
      if (thumbBlob) {
        const type = thumbBlob.type || "image/jpeg"
        newThumbPath = `${base}-thumb.${IMAGE_EXT[type] ?? "jpg"}`
        await uploadFile(targetBucket, newThumbPath, thumbBlob, type)
        uploaded.push(newThumbPath)
        thumbnailPath = newThumbPath
      }

      if (editing) {
        const { error: updateError } = await supabase
          .from("highlights")
          .update({
            title: form.title.trim(),
            description: form.description.trim(),
            published_at: form.publishedAt,
            featured: form.featured,
            thumbnail_path: thumbnailPath,
          })
          .eq("id", editing.id)
        if (updateError) throw updateError
        committed = true
        savedId = editing.id
        if (newThumbPath && editing.thumbnailPath) {
          await supabase.storage.from(targetBucket).remove([editing.thumbnailPath])
        }
      } else if (videoFile) {
        const mime = videoMime(videoFile)
        const videoPath = `${base}.${VIDEO_EXT[mime]}`
        await uploadFile(targetBucket, videoPath, videoFile, mime)
        uploaded.push(videoPath)

        const { data, error: insertError } = await supabase
          .from("highlights")
          .insert({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            video_path: videoPath,
            thumbnail_path: thumbnailPath,
            duration_seconds: duration,
            featured: form.featured,
            published_at: form.publishedAt,
          })
          .select("id")
          .single()
        if (insertError) throw insertError
        committed = true
        savedId = String(data?.id ?? "")
      }

      // Only one video is featured at a time
      if (form.featured && savedId) {
        await supabase.from("highlights").update({ featured: false }).neq("id", savedId)
      }
      await onChanged()
      closeForm()
      setNotice(wasEditing ? "Highlight updated." : "Highlight published.")
    } catch (e) {
      // Remove files uploaded for a save that did not go through
      if (!committed && uploaded.length) {
        await supabase.storage.from(targetBucket).remove(uploaded)
      }
      const message =
        e instanceof Error ? e.message : (e as { message?: string } | null)?.message ?? "Something went wrong."
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(item: Highlight) {
    if (!confirm(`Delete "${item.title}"? The video file will be removed too.`)) return
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("highlights").delete().eq("id", item.id)
    if (deleteError) {
      alert("Delete failed: " + deleteError.message)
      return
    }
    const files = [item.videoPath, item.thumbnailPath].filter(Boolean) as string[]
    await supabase.storage.from(categoryInfo(item.category).bucket).remove(files)
    setNotice("Highlight deleted.")
    await onChanged()
  }

  const currentThumb = editing ? mediaUrl(editing.category, editing.thumbnailPath) : null
  const shownThumb = thumbPreview ?? currentThumb

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold uppercase tracking-tight text-foreground">
            Manage Highlights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload game videos, top plays, player spotlights and season highlights.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Highlight
        </button>
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary">
          {notice}
        </p>
      )}

      {showForm && (
        <div className="mt-6 rounded-lg border border-primary/50 bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold uppercase text-foreground">
              {editing ? "Edit Highlight" : "New Highlight"}
            </h2>
            <button onClick={closeForm} aria-label="Close form" className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mutare Rangers vs MBA Hawks"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select
                value={form.category}
                disabled={editing !== null}
                onChange={(e) => setForm({ ...form, category: e.target.value as HighlightCategory })}
                className={cn(inputClass, "disabled:opacity-60")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                {editing
                  ? "The category is fixed after upload. To move a video, delete it and upload it again."
                  : `This video will be stored in the "${bucket}" bucket.`}
              </p>
            </div>

            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="A short summary shown under the title"
                className={inputClass}
              />
            </div>

            {/* Video drop zone (new highlights only) */}
            {!editing && (
              <div className="sm:col-span-2">
                <label className={labelClass}>Video</label>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Upload video. Drag and drop a file or press Enter to browse."
                  onClick={() => !busy && videoInput.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      if (!busy) videoInput.current?.click()
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
                    if (!busy) handleVideo(e.dataTransfer.files?.[0])
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    dragging ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/60"
                  )}
                >
                  <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                    {reading ? (
                      <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
                    ) : thumbPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbPreview} alt="Video thumbnail preview" className="h-full w-full object-cover" />
                    ) : (
                      <Film className="size-8 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <UploadCloud className="size-4 shrink-0 text-primary" aria-hidden />
                      <span className="truncate">
                        {videoFile ? videoFile.name : dragging ? "Drop it here" : "Drag and drop a video here"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {videoFile
                        ? `${(videoFile.size / 1024 / 1024).toFixed(1)} MB · ${formatDuration(duration)} · saves to ${bucket}`
                        : `or click to browse. MP4, WebM or MOV, up to ${MAX_VIDEO_MB} MB. The thumbnail is picked from the video automatically.`}
                    </p>
                  </div>
                  {videoFile && !busy && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetMedia()
                      }}
                      aria-label="Remove video"
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail (replace on edit, or override on create) */}
            {(editing || videoFile) && (
              <div className="sm:col-span-2">
                <label className={labelClass}>Thumbnail</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
                    {shownThumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shownThumb} alt="Thumbnail" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => thumbInput.current?.click()}
                    disabled={busy}
                    className="rounded-md border border-border px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    {editing ? "Replace thumbnail" : "Use a different thumbnail"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="size-4 accent-primary"
            />
            Show as the featured highlight on the Highlights page
          </label>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          {busy && (
            <div className="mt-4" role="status">
              <p className="text-sm text-muted-foreground">
                {editing ? "Saving..." : "Uploading video... keep this page open until it finishes."}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={busy || reading}
              className="rounded-md bg-primary px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editing ? "Update Highlight" : "Publish Highlight"}
            </button>
            <button
              onClick={closeForm}
              disabled={busy}
              className="rounded-md border border-border px-6 py-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <input
            ref={videoInput}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              handleVideo(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <input
            ref={thumbInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleThumb(e.target.files?.[0])
              e.target.value = ""
            }}
          />
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Video</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground sm:table-cell">Category</th>
                <th className="hidden px-4 py-2.5 text-left font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">Date</th>
                <th className="hidden px-4 py-2.5 text-center font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground md:table-cell">Views</th>
                <th className="px-4 py-2.5 text-right font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {highlights.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No highlights yet. Click Add Highlight to upload the first one.
                  </td>
                </tr>
              )}
              {highlights.map((item) => {
                const thumb = mediaUrl(item.category, item.thumbnailPath)
                return (
                  <tr key={item.id} className="bg-card transition-colors hover:bg-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary">
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={thumb} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Film className="size-4 text-muted-foreground" aria-hidden />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-sans text-sm font-bold text-foreground">
                            <span className="line-clamp-1">{item.title}</span>
                            {item.featured && <Star className="size-3.5 shrink-0 fill-primary text-primary" aria-label="Featured" />}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDuration(item.durationSeconds)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {categoryInfo(item.category).tag}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{formatDate(item.publishedAt)}</td>
                    <td className="hidden px-4 py-3 text-center text-sm text-muted-foreground md:table-cell">{formatViews(item.views)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}