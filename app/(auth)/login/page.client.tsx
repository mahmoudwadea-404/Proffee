"use client"

import { Suspense } from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { loginSchema, type LoginFormData } from "@/types/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const authError = searchParams.get("error")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Invalid email or password")
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email first")
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success("Signed in successfully!")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/40">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-serif font-bold text-text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to enjoy the best coffee experience
          </p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            Authentication failed. Please try again.
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={`w-full rounded-lg border bg-surface-2 pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300
                  ${errors.email ? "border-red-500/60" : "border-border"}`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full rounded-lg border bg-surface-2 pl-10 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300
                  ${errors.password ? "border-red-500/60" : "border-border"}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-text-secondary hover:text-primary transition-colors duration-300"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white
              hover:bg-primary-dark transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-light transition-colors duration-300"
          >
            Create Account
          </Link>
        </p>
      </div>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/40 animate-pulse">
        <div className="h-8 bg-surface-2 rounded w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-surface-2 rounded w-3/4 mx-auto mb-8" />
        <div className="space-y-5">
          <div className="h-12 bg-surface-2 rounded" />
          <div className="h-12 bg-surface-2 rounded" />
          <div className="h-12 bg-primary/20 rounded" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
