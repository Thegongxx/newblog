import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/Toast';

/**
 * Feature: industrial-grade-optimization
 * Property 7: Toast Notification Correctness
 * Validates: Requirements 6.3, 6.4
 */

const TestComponent = ({ type = 'success' as const, message = 'Test message' }) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message, type)} data-testid="trigger">
      Show Toast
    </button>
  );
};

describe('Toast Component', () => {
  it('displays success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent type="success" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('trigger'));

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('displays error toast with error styling', async () => {
    render(
      <ToastProvider>
        <TestComponent type="error" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('trigger'));

    await waitFor(() => {
      const toastText = screen.getByText('Test message');
      // 获取外层带样式的 div (跳过内层 flex 容器)
      const toast = toastText.closest('div')?.parentElement;
      expect(toast?.className).toContain('bg-red-500/20');
    });
  });

  it('displays info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent type="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('trigger'));

    await waitFor(() => {
      const toastText = screen.getByText('Test message');
      const toast = toastText.closest('div')?.parentElement;
      expect(toast?.className).toContain('bg-blue-500/20');
    });
  });

  it('can display multiple toasts', async () => {
    const MultiToast = () => {
      const { showToast } = useToast();
      return (
        <>
          <button onClick={() => showToast('Toast 1')} data-testid="t1">T1</button>
          <button onClick={() => showToast('Toast 2')} data-testid="t2">T2</button>
        </>
      );
    };

    render(
      <ToastProvider>
        <MultiToast />
      </ToastProvider>
    );

    fireEvent.click(screen.getByTestId('t1'));
    fireEvent.click(screen.getByTestId('t2'));

    await waitFor(() => {
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
    });
  });

  it('throws error when useToast is used outside provider', () => {
    const BadComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<BadComponent />)).toThrow('useToast must be used within ToastProvider');
  });
});
