import type { VercelRequest, VercelResponse } from '@vercel/node';

interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  timestamp: number;
  route?: string;
}

interface LogBatch {
  entries: LogEntry[];
  clientTimestamp: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entries, clientTimestamp } = req.body as LogBatch;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'Invalid log entries' });
    }

    // Log to Vercel's logging system
    entries.forEach((entry) => {
      const logData = {
        ...entry,
        serverTimestamp: Date.now(),
        clientTimestamp,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      };

      switch (entry.level) {
        case 'error':
          console.error(JSON.stringify(logData));
          break;
        case 'warn':
          console.warn(JSON.stringify(logData));
          break;
        default:
          console.log(JSON.stringify(logData));
      }
    });

    return res.status(200).json({ received: entries.length });
  } catch (error) {
    console.error('Log handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
