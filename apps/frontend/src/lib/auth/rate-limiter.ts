type RateLimitEntry = {
  count: number;
  resetAt: number;
};

class RateLimiter {
  private attempts: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.attempts = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.attempts.entries()) {
        if (now > entry.resetAt) {
          this.attempts.delete(key);
        }
      }
    }, 60000);
  }

  check(
    identifier: string,
    maxAttempts: number = 3,
    windowMs: number = 300000
  ): {
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetAt) {
      this.attempts.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (entry.count >= maxAttempts) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
    };
  }

  reset(identifier: string) {
    this.attempts.delete(identifier);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }
}

export const rateLimiter = new RateLimiter();
