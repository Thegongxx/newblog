import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getGridColumns } from '@/hooks/useResponsive';

/**
 * Feature: industrial-grade-optimization
 * Property 8: Responsive Grid Layout
 * Validates: Requirements 7.1, 7.2, 7.3
 */
describe('Responsive Layout Properties', () => {
  /**
   * Property 8: Responsive Grid Layout
   * For any viewport width:
   * - width < 768px → 1 column
   * - 768px ≤ width < 1024px → 2 columns
   * - width ≥ 1024px → 3 columns
   */
  it('Property 8: displays correct column count for any viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }),
        (viewportWidth) => {
          const columns = getGridColumns(viewportWidth);
          
          if (viewportWidth < 768) {
            expect(columns).toBe(1);
          } else if (viewportWidth < 1024) {
            expect(columns).toBe(2);
          } else {
            expect(columns).toBe(3);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 1 column for mobile widths', () => {
    expect(getGridColumns(320)).toBe(1);
    expect(getGridColumns(767)).toBe(1);
  });

  it('returns 2 columns for tablet widths', () => {
    expect(getGridColumns(768)).toBe(2);
    expect(getGridColumns(1023)).toBe(2);
  });

  it('returns 3 columns for desktop widths', () => {
    expect(getGridColumns(1024)).toBe(3);
    expect(getGridColumns(1920)).toBe(3);
  });
});
