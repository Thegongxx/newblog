import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingFallback from '@/components/LoadingFallback';

// Mock page components
vi.mock('@/pages/Feed', () => ({ default: () => <div data-testid="feed-page">Feed</div> }));
vi.mock('@/pages/Notes', () => ({ default: () => <div data-testid="notes-page">Notes</div> }));
vi.mock('@/pages/About', () => ({ default: () => <div data-testid="about-page">About</div> }));

// Import after mocks
const { Feed, Notes, About } = await import('@/routes');

const TestRouter = ({ route }: { route: string }) => (
  <MemoryRouter initialEntries={[route]}>
    <Suspense fallback={<LoadingFallback />}>
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
  it('renders loading indicator', () => {
    render(<LoadingFallback />);
    expect(document.querySelector('.min-h-\\[60vh\\]')).toBeInTheDocument();
  });
});
