"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { registerSchema, type RegisterFormData } from "@/types/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?name=${encodeURIComponent(data.name)}`,
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered")
        } else {
          toast.error(error.message)
        }
        return
      }

      if (authData.session) {
        const { createUserInDB } = await import("@/actions/auth")
        await createUserInDB({
          supabaseId: authData.user!.id,
          name: data.name,
          email: data.email,
        })

        toast.success("Account created successfully!")
        router.push("/")
        router.refresh()
      } else {
        toast.success("Confirmation link sent to your email", {
          description: "Please check your inbox to confirm your account.",
          duration: 8000,
        })
        router.push("/login")
      }
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
            Create Account
          </h1>
          <p className="text-sm text-text-secondary">
            Join Proffee and enjoy the finest specialty coffee
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className={`w-full rounded-lg border bg-surface-2 pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300
                  ${errors.name ? "border-red-500/60" : "border-border"}`}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

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
                autoComplete="new-password"
                placeholder="At least 6 characters"
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

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter password"
                className={`w-full rounded-lg border bg-surface-2 pl-10 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300
                  ${errors.confirmPassword ? "border-red-500/60" : "border-border"}`}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-light transition-colors duration-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
