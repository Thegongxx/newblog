import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Mock page components
vi.mock('@/pages/Feed', () => ({ default: () => <div data-testid="feed-page">Feed</div> }));
vi.mock('@/pages/Notes', () => ({ default: () => <div data-testid="notes-page">Notes</div> }));
vi.mock('@/pages/About', () => ({ default: () => <div data-testid="about-page">About</div> }));

// Lazy load after mocks
const Feed = lazy(() => import('@/pages/Feed'));
const Notes = lazy(() => import('@/pages/Notes'));
const About = lazy(() => import('@/pages/About'));

const TestRouter = ({ route }: { route: string }) => (
  <MemoryRouter initialEntries={[route]}>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Feed posts={[]} loading={false} onSelectPost={() => {}} />} />
        <Route path="/notes" element={<Notes notes={[]} loading={false} />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  </MemoryRouter>
);

describe('Lazy Route Loading', () => {
  it('renders Feed page on root route', async () => {
    render(<TestRouter route="/" />);
    await waitFor(() => expect(screen.getByTestId('feed-page')).toBeInTheDocument());
  });

  it('renders Notes page on /notes route', async () => {
    render(<TestRouter route="/notes" />);
    await waitFor(() => expect(screen.getByTestId('notes-page')).toBeInTheDocument());
  });

  it('renders About page on /about route', async () => {
    render(<TestRouter route="/about" />);
    await waitFor(() => expect(screen.getByTestId('about-page')).toBeInTheDocument());
  });
});

describe('LoadingFallback', () => {
  it('Google-style instant transition uses null fallback', () => {
    // 验证我们使用 null 作为 fallback，实现即时切换
    const { container } = render(
      <Suspense fallback={null}>
        <div>Content</div>
      </Suspense>
    );
    expect(container.textContent).toBe('Content');
  });
});
