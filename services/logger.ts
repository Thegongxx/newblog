type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  route?: string;
}

class Logger {
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize = 10;
  private readonly flushInterval = 5000;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  private createEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: Date.now(),
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log('error', message, {
      ...context,
      errorMessage: error?.message,
      stack: error?.stack,
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry(level, message, context);
    this.buffer.push(entry);

    // Immediate flush for errors or when buffer is full
    if (level === 'error' || this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleFn(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries, clientTimestamp: Date.now() }),
      });
    } catch {
      // Silent fail - don't let logging affect user experience
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const logger = new Logger();
export { Logger };
export type { LogLevel, LogEntry };
