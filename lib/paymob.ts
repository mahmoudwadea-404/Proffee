import crypto from "node:crypto"

const PAYMOB_BASE_URL = "https://accept.paymob.com"

function getSecretKey(): string {
  const key = process.env.PAYMOB_API_KEY
  if (!key) throw new Error("PAYMOB_API_KEY is not set")
  return key
}

function getIntegrationId(): number {
  const id = process.env.PAYMOB_INTEGRATION_ID
  if (!id) throw new Error("PAYMOB_INTEGRATION_ID is not set")
  return Number(id)
}

function getHmacSecret(): string {
  const secret = process.env.PAYMOB_HMAC_SECRET
  if (!secret) throw new Error("PAYMOB_HMAC_SECRET is not set")
  return secret
}

function getPublicKey(): string {
  const key = process.env.PAYMOB_PUBLIC_KEY
  if (!key) throw new Error("PAYMOB_PUBLIC_KEY is not set")
  return key
}

export type CreateIntentionParams = {
  amount: number
  currency?: string
  items: { name: string; amount: number; quantity: number }[]
  billingData: {
    first_name: string
    last_name: string
    email: string
    phone_number: string
    street?: string
    city?: string
    country?: string
  }
  customer: {
    first_name: string
    last_name: string
    email: string
  }
  notificationUrl: string
  redirectionUrl: string
  specialReference?: string
}

export type IntentionResult = {
  id: string
  clientSecret: string
  intentionOrderId: number
}

export async function createPaymentIntention(
  params: CreateIntentionParams
): Promise<IntentionResult> {
  const response = await fetch(`${PAYMOB_BASE_URL}/v1/intention/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount),
      currency: params.currency ?? "EGP",
      payment_methods: [getIntegrationId()],
      items: params.items,
      billing_data: {
        first_name: params.billingData.first_name,
        last_name: params.billingData.last_name,
        email: params.billingData.email,
        phone_number: params.billingData.phone_number,
        street: params.billingData.street ?? "NA",
        city: params.billingData.city ?? "NA",
        country: params.billingData.country ?? "EG",
        apartment: "NA",
        floor: "NA",
        building: "NA",
        shipping_method: "NA",
        postal_code: "NA",
        state: "NA",
      },
      customer: {
        first_name: params.customer.first_name,
        last_name: params.customer.last_name,
        email: params.customer.email,
      },
      notification_url: params.notificationUrl,
      redirection_url: params.redirectionUrl,
      special_reference: params.specialReference,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Paymob intention creation failed (${response.status}): ${errorBody}`
    )
  }

  const data = await response.json()
  return {
    id: data.id,
    clientSecret: data.client_secret,
    intentionOrderId: data.intention_order_id,
  }
}

export function getCheckoutUrl(clientSecret: string): string {
  const publicKey = getPublicKey()
  return `${PAYMOB_BASE_URL}/unifiedcheckout/?publicKey=${publicKey}&clientSecret=${clientSecret}`
}

export type PaymobTransactionObj = {
  amount_cents: number
  created_at: string
  currency: string
  error_occured: boolean
  has_parent_transaction: boolean
  id: number
  integration_id: number
  is_3d_secure: boolean
  is_auth: boolean
  is_capture: boolean
  is_refunded: boolean
  is_standalone_payment: boolean
  is_voided: boolean
  order: { id: number }
  owner: number
  pending: boolean
  source_data: {
    pan: string
    sub_type: string
    type: string
  }
  success: boolean
}

export function verifyWebhookHMAC(
  obj: PaymobTransactionObj,
  receivedHMAC: string
): boolean {
  const fields = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order.id,
    obj.owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success,
  ]

  const concatenated = fields.map(String).join("")
  const computed = crypto
    .createHmac("sha512", getHmacSecret())
    .update(concatenated)
    .digest("hex")

  if (computed.length !== receivedHMAC.length) return false

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(receivedHMAC))
}
