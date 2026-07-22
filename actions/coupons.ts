"use server"

import { prisma } from "@/lib/prisma"
import { SHIPPING_FEE } from "@/lib/constants"

export type ValidateCouponResult = {
  valid: true
  message: string
  discount: number
  finalTotal: number
  coupon: {
    id: string
    code: string
    discountType: "PERCENTAGE" | "FIXED"
    discountValue: number
    maximumDiscount: number | null
    description: string
  }
} | {
  valid: false
  message: string
  discount: number
  finalTotal: number
  coupon: null
}

export async function validateCoupon(code: string, subtotal: number): Promise<ValidateCouponResult> {
  try {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      return { valid: false, message: "Please enter a coupon code.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: trimmed },
    })

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is no longer active.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    if (coupon.startsAt && coupon.startsAt > new Date()) {
      return { valid: false, message: "This coupon is not yet active.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, message: "This coupon has expired.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: "This coupon has reached its usage limit.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
    }

    if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount for this coupon is EGP ${coupon.minOrderAmount}.`,
        discount: 0,
        finalTotal: subtotal + SHIPPING_FEE,
        coupon: null,
      }
    }

    let discount: number
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * coupon.discountValue) / 100 * 100) / 100
      if (coupon.maximumDiscount !== null) {
        discount = Math.min(discount, coupon.maximumDiscount)
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal)
    }

    const finalTotal = Math.max(0, subtotal + SHIPPING_FEE - discount)

    return {
      valid: true,
      message: "Coupon applied successfully.",
      discount,
      finalTotal,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maximumDiscount: coupon.maximumDiscount,
        description: coupon.description,
      },
    }
  } catch (error) {
    console.error("[validateCoupon] Error:", error)
    return { valid: false, message: "Failed to validate coupon. Please try again.", discount: 0, finalTotal: subtotal + SHIPPING_FEE, coupon: null }
  }
}
