"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"
import { handlePaymentRedirect } from "@/actions/orders"
import { useCart } from "@/lib/cart-context"

const MAX_RETRIES = 30
const POLL_INTERVAL_MS = 2000

type PaymentStatus = "loading" | "PAID" | "FAILED" | "PENDING" | "UNPAID" | "not_found" | "timeout"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const paymobSuccess = searchParams.get("success")
  const [status, setStatus] = useState<PaymentStatus>("loading")
  const { clearCart } = useCart()
  const cartClearedRef = useRef(false)
  const retriesRef = useRef(0)

  useEffect(() => {
    if (!orderId) {
      setStatus("not_found")
      return
    }

    if (paymobSuccess === "false") {
      const failOrder = async () => {
        try {
          const result = await handlePaymentRedirect({
            orderId,
            success: paymobSuccess,
            id: searchParams.get("id") ?? "",
            order_id: searchParams.get("order_id") ?? "",
            amount_cents: searchParams.get("amount_cents") ?? "",
            created_at: searchParams.get("created_at") ?? "",
            currency: searchParams.get("currency") ?? "",
            error_occured: searchParams.get("error_occured") ?? "",
            has_parent_transaction: searchParams.get("has_parent_transaction") ?? "",
            integration_id: searchParams.get("integration_id") ?? "",
            is_3d_secure: searchParams.get("is_3d_secure") ?? "",
            is_auth: searchParams.get("is_auth") ?? "",
            is_capture: searchParams.get("is_capture") ?? "",
            is_refunded: searchParams.get("is_refunded") ?? "",
            is_standalone_payment: searchParams.get("is_standalone_payment") ?? "",
            is_voided: searchParams.get("is_voided") ?? "",
            owner: searchParams.get("owner") ?? "",
            pending: searchParams.get("pending") ?? "",
            source_data_pan: searchParams.get("source_data_pan") ?? "",
            source_data_sub_type: searchParams.get("source_data_sub_type") ?? "",
            source_data_type: searchParams.get("source_data_type") ?? "",
            hmac: searchParams.get("hmac") ?? "",
          })
          if (result.success && result.paymentStatus) {
            setStatus(result.paymentStatus as PaymentStatus)
            return
          }
        } catch (err) {
          console.error("[PaymentResult] handlePaymentRedirect error:", err)
        }
      }
      failOrder()
      return
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/payment-status`)
        if (!res.ok) {
          console.warn("[PaymentResult] Response not OK:", res.status)
          return
        }
        const data = await res.json()
        const paymentStatus: string = data.paymentStatus
        if (paymentStatus === "PAID") {
          clearInterval(interval)
          if (!cartClearedRef.current) {
            clearCart()
            cartClearedRef.current = true
          }
          setStatus("PAID")
          return
        }

        if (paymentStatus === "FAILED") {
          clearInterval(interval)
          setStatus("FAILED")
          return
        }

        retriesRef.current += 1
        if (retriesRef.current >= MAX_RETRIES) {
          clearInterval(interval)
          setStatus("timeout")
        }
      } catch (err) {
        console.error("[PaymentResult] Poll error:", err)
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [orderId, paymobSuccess, searchParams, clearCart])


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

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <Loader2 className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-3xl font-serif text-text-primary">Still Confirming Payment</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            We&apos;re still waiting for payment confirmation. Your cart has been preserved — you can safely return later.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-300"
            >
              Refresh Page
            </button>
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
