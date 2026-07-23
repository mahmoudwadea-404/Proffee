const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter.
 * Returns true if the request is allowed, false if rate limited.
 *
 * @param key — unique identifier (e.g. IP + endpoint)
 * @param limit — max requests allowed in the window
 * @param windowMs — time window in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}

/**
 * Clean up expired entries periodically to prevent memory leaks.
 * Call this once at startup if desired, or rely on natural cleanup.
 */
export function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000)
}
