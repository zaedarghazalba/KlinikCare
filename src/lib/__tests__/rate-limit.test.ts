import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest, NextResponse } from "next/server"

// We need to import the module fresh each time to reset the store
// Since store is module-level, we'll test the behavior

describe("rate-limit", () => {
  // Mock timers to control time
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // Helper to create a mock NextRequest
  function createMockRequest(ip: string, pathname: string = "/api/test"): NextRequest {
    const url = new URL(`http://localhost${pathname}`)

    const headers = new Headers()
    headers.set("x-forwarded-for", ip)

    return new NextRequest(url, { headers })
  }

  it("should import rate limit functions without error", async () => {
    const { rateLimit, authRateLimit, apiRateLimit, bookingRateLimit } = await import("../rate-limit")

    expect(typeof rateLimit).toBe("function")
    expect(typeof authRateLimit).toBe("function")
    expect(typeof apiRateLimit).toBe("function")
    expect(typeof bookingRateLimit).toBe("function")
  })

  it("should allow requests within limit", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({ windowMs: 1000, max: 5 })
    const req = createMockRequest("192.168.1.1")

    // First request should pass
    const result1 = limiter(req)
    expect(result1).toBeNull()
  })

  it("should block requests over limit", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({ windowMs: 10000, max: 3 })
    const req = createMockRequest("192.168.1.2")

    // Make 3 requests (should pass)
    expect(limiter(req)).toBeNull()
    expect(limiter(req)).toBeNull()
    expect(limiter(req)).toBeNull()

    // 4th request should be blocked
    const blocked = limiter(req)
    expect(blocked).not.toBeNull()
    expect(blocked).toBeInstanceOf(NextResponse)
    if (blocked instanceof NextResponse) {
      expect(blocked.status).toBe(429)
    }
  })

  it("should use different keys for different IPs", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({ windowMs: 10000, max: 2 })
    const req1 = createMockRequest("10.0.0.1")
    const req2 = createMockRequest("10.0.0.2")

    // Both IPs should have their own counters
    expect(limiter(req1)).toBeNull()
    expect(limiter(req1)).toBeNull()
    expect(limiter(req2)).toBeNull()
    expect(limiter(req2)).toBeNull()

    // Now both should be blocked
    expect(limiter(req1)).not.toBeNull()
    expect(limiter(req2)).not.toBeNull()
  })

  it("should use different keys for different paths", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({ windowMs: 10000, max: 2 })

    const req1 = createMockRequest("10.0.0.3", "/api/endpoint1")
    const req2 = createMockRequest("10.0.0.3", "/api/endpoint2")

    // Different paths should have different counters
    expect(limiter(req1)).toBeNull()
    expect(limiter(req1)).toBeNull()
    expect(limiter(req2)).toBeNull()
    expect(limiter(req2)).toBeNull()

    // Now both should be blocked
    expect(limiter(req1)).not.toBeNull()
    expect(limiter(req2)).not.toBeNull()
  })

  it("should reset after window expires", async () => {
    const { rateLimit } = await import("../rate-limit")

    const windowMs = 5000
    const limiter = rateLimit({ windowMs, max: 2 })
    const req = createMockRequest("192.168.1.100")

    // Use up the limit
    expect(limiter(req)).toBeNull()
    expect(limiter(req)).toBeNull()
    expect(limiter(req)).not.toBeNull() // Blocked

    // Advance time past the window
    vi.advanceTimersByTime(windowMs + 100)

    // Should be able to make requests again
    expect(limiter(req)).toBeNull()
  })

  it("should use custom status code and message", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({
      windowMs: 10000,
      max: 1,
      message: "Custom error message",
      statusCode: 400,
    })

    const req = createMockRequest("192.168.1.200")

    expect(limiter(req)).toBeNull()
    const blocked = limiter(req)

    expect(blocked).not.toBeNull()
    if (blocked instanceof NextResponse) {
      expect(blocked.status).toBe(400)
    }
  })

  it("should handle unknown IP gracefully", async () => {
    const { rateLimit } = await import("../rate-limit")

    const limiter = rateLimit({ windowMs: 10000, max: 5 })
    const url = new URL("http://localhost/api/test")
    const req = new NextRequest(url) // No x-forwarded-for header

    // Should use "unknown" as IP
    expect(limiter(req)).toBeNull()
  })
})
