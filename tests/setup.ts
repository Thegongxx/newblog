import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import * as React from 'react';

afterEach(() => {
  cleanup();
});

// 兼容性更好的全局对象模拟
(global as any).matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'navigator', {
  value: {
    vibrate: vi.fn(),
  },
  writable: true,
});

// Mock framer-motion 的简单替代（避免 JSX 需求）
vi.mock('framer-motion', async () => {
  const actual: any = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: {
      div: (props: any) => React.createElement('div', props, props.children),
      button: (props: any) => React.createElement('button', props, props.children),
      span: (props: any) => React.createElement('span', props, props.children),
      svg: (props: any) => React.createElement('svg', props, props.children),
      path: (props: any) => React.createElement('path', props),
    },
    AnimatePresence: (props: any) => props.children,
  } as any;
});

vi.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
  Helmet: () => null,
}));
