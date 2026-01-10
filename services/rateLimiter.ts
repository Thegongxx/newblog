const RATE_LIMIT = 10;
const WINDOW_MS = 60000;

interface RateLimitState {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private state: RateLimitState = { count: 0, resetTime: Date.now() + WINDOW_MS };

  canRequest(): boolean {
    this.resetIfNeeded();
    return this.state.count < RATE_LIMIT;
  }

  consume(): boolean {
    if (!this.canRequest()) return false;
    this.state.count++;
    return true;
  }

  getRemainingTime(): number {
    return Math.max(0, this.state.resetTime - Date.now());
  }

  getRemainingRequests(): number {
    this.resetIfNeeded();
    return Math.max(0, RATE_LIMIT - this.state.count);
  }

  private resetIfNeeded(): void {
    if (Date.now() >= this.state.resetTime) {
      this.state = { count: 0, resetTime: Date.now() + WINDOW_MS };
    }
  }
}

export const aiRateLimiter = new RateLimiter();
export { RateLimiter };
