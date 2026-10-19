"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { createClient } from "@/lib/supabase/client"

// Identifies this site in the site_admins table.
// ZimSports AI can use its own value (for example "zimsports") in the same way.
const SITE = "mba"

type Status = "loading" | "signed-out" | "denied" | "admin"

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("loading")

  async function checkAccess() {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setStatus("signed-out")
      return
    }

    const { data, error } = await supabase
      .from("site_admins")
      .select("site")
      .eq("user_id", session.user.id)
      .eq("site", SITE)
      .maybeSingle()

    if (error) console.error("Admin check failed:", error)
    setStatus(data ? "admin" : "denied")
  }

  useEffect(() => {
    checkAccess()
  }, [])

  const handleLogout = async () => {
    // "local" signs out this site only. The default would also end the user's
    // sessions on every other site that shares this Supabase project.
    await createClient().auth.signOut({ scope: "local" })
    setStatus("signed-out")
  }

  if (status === "loading")
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )

  if (status === "denied")
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-white">
          This account doesn&apos;t have admin access to the MBA site.
        </p>
        <p className="text-sm text-slate-400">Sign in with an MBA admin account instead.</p>
        <button
          onClick={handleLogout}
          className="rounded-md bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Sign out
        </button>
      </div>
    )

  if (status === "signed-out") return <AdminLogin onLogin={checkAccess} />

  return <AdminDashboard onLogout={handleLogout} />
}