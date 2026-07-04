"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { User, Mail, Calendar, Loader2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
      setLoading(false)
    }
    fetchUser()
  }, [router, supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-serif font-bold text-primary text-center">
          My Account
        </h1>

        <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/40 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                {user?.user_metadata?.name || "User"}
              </h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Mail className="w-5 h-5 text-primary" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Calendar className="w-5 h-5 text-primary" />
              <span>
                Member since {new Date(user?.created_at ?? "").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
