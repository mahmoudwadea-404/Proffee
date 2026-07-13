"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

type PaymentStatus = "loading" | "PAID" | "FAILED" | "PENDING" | "UNPAID" | "not_found"

function PaymentResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [status, setStatus] = useState<PaymentStatus>("loading")

  useEffect(() => {
    console.log("[PaymentResult] orderId from URL:", orderId)
    if (!orderId) {
      console.warn("[PaymentResult] No orderId in URL, setting not_found")
      setStatus("not_found")
      return
    }

    const checkStatus = async () => {
      try {
        console.log("[PaymentResult] Polling /api/orders/" + orderId + "/payment-status")
        const res = await fetch(`/api/orders/${orderId}/payment-status`)
        console.log("[PaymentResult] Response status:", res.status)
        if (!res.ok) {
          console.warn("[PaymentResult] Response not OK:", res.status, res.statusText)
          const body = await res.text()
          console.warn("[PaymentResult] Response body:", body)
          setStatus("not_found")
          return
        }
        const data = await res.json()
        console.log("[PaymentResult] Response data:", JSON.stringify(data))
        console.log("[PaymentResult] Setting status to:", data.paymentStatus)
        setStatus(data.paymentStatus)
      } catch (err) {
        console.error("[PaymentResult] Fetch error:", err)
        setStatus("not_found")
      }
    }

    const interval = setInterval(checkStatus, 2000)
    checkStatus()

    return () => clearInterval(interval)
  }, [orderId])

  console.log("[PaymentResult] Rendering with status:", status)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-text-secondary">Checking payment status...</p>
        </motion.div>
      </div>
    )
  }

  if (status === "not_found") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-3xl font-serif text-text-primary">Order Not Found</h1>
          <p className="text-text-secondary">We could not find this order. Please contact support.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  if (status === "PAID") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-serif text-text-primary">Payment Successful!</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Your payment has been confirmed. We&apos;ll start preparing your order right away.
          </p>
          {orderId && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">
                Order ID: <span className="text-text-primary font-mono">{orderId}</span>
              </span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={`/checkout/success?orderId=${orderId}`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
            >
              View Order Details
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-all duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto"
        >
          <XCircle className="w-10 h-10 text-red-500" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-serif text-text-primary">Payment Failed</h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          The payment could not be processed. Please try again or choose a different payment method.
        </p>
        {status === "PENDING" && (
          <p className="text-sm text-text-muted">
            Your payment is still being processed. This page will update automatically.
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  )
}
