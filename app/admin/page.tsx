"use client"

import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin-login"
import { AdminDashboard } from "@/components/admin-dashboard"
import { createClient } from "@/lib/supabase/client"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })
  }, [])

  const handleLogin = () => setIsAuthenticated(true)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </div>
  )

  if (!isAuthenticated) return <AdminLogin onLogin={handleLogin} />

  return <AdminDashboard onLogout={handleLogout} />
}