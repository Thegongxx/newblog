import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { RateLimiter } from '@/services/rateLimiter';

/**
 * Feature: industrial-grade-optimization
 * Property 12: Rate Limiting Enforcement
 * Validates: Requirements 10.4
 */
describe('Rate Limiter Properties', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Property 12: Rate Limiting Enforcement
   * For any user making AI requests, after 10 requests within a 60-second window,
   * subsequent requests SHALL be blocked until the window resets.
   */
  it('Property 12: blocks requests after limit is reached', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (requestCount) => {
          const limiter = new RateLimiter();
          const results: boolean[] = [];
          
          for (let i = 0; i < requestCount; i++) {
            results.push(limiter.consume());
          }
          
          const allowedCount = results.filter(r => r).length;
          expect(allowedCount).toBeLessThanOrEqual(10);
          
          if (requestCount > 10) {
            expect(results.slice(10).every(r => !r)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('allows exactly 10 requests per window', () => {
    const limiter = new RateLimiter();
    
    for (let i = 0; i < 10; i++) {
      expect(limiter.consume()).toBe(true);
    }
    expect(limiter.consume()).toBe(false);
  });

  it('resets after window expires', () => {
    const limiter = new RateLimiter();
    
    for (let i = 0; i < 10; i++) {
      limiter.consume();
    }
    expect(limiter.canRequest()).toBe(false);
    
    vi.advanceTimersByTime(60001);
    expect(limiter.canRequest()).toBe(true);
  });

  it('tracks remaining requests correctly', () => {
    const limiter = new RateLimiter();
    
    expect(limiter.getRemainingRequests()).toBe(10);
    limiter.consume();
    expect(limiter.getRemainingRequests()).toBe(9);
  });
});
