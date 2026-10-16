import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Basic middlewares
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim();
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin && (!allowedOrigin || origin === allowedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: '100kb' }));

// Allowed activity choices (strict whitelist)
const VALID_ACTIVITIES = new Set([
  '🌙 Night Walk',
  '🌶️ Pani Puri',
  '🥞 Dosa',
  '🍜 Maggie',
  '🚶 Outing',
]);

const VALID_AVAILABILITIES = new Set([
  'This weekend',
  'Next week',
  "Whenever we're both free",
  'Let me choose a day',
]);

export interface HangoutSubmission {
  submissionId: string;
  timestamp: string;
  responseStatus: 'Accepted and submitted' | 'Declined' | 'Not yet answered';
  activity: string;
  availability: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

// In-memory submissions store (keeps recent submissions accessible in current session)
const recentSubmissions: HangoutSubmission[] = [];
const processedIds = new Map<string, number>(); // submissionId -> timestamp for deduplication

// Periodically clean up old deduplication entries (> 1 hour)
setInterval(() => {
  const now = Date.now();
  for (const [id, time] of processedIds.entries()) {
    if (now - time > 60 * 60 * 1000) {
      processedIds.delete(id);
    }
  }
}, 10 * 60 * 1000);

// API Routes
app.get('/api/status', (_req: Request, res: Response) => {
  const sheetsUrl = process.env.GOOGLE_SHEET_WEBAPP_URL?.trim();
  res.json({
    status: 'online',
    isSheetsConfigured: Boolean(sheetsUrl && sheetsUrl.startsWith('https://script.google.com')),
    storedSubmissionsCount: recentSubmissions.length,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/submit', async (req: Request, res: Response) => {
  try {
    const {
      submissionId,
      activity,
      availability,
      preferredDate,
      preferredTime,
      message,
      timestamp,
    } = req.body;

    // 1. Validate submissionId
    if (!submissionId || typeof submissionId !== 'string' || submissionId.length > 100) {
      return res.status(400).json({ success: false, error: 'Invalid or missing submission ID.' });
    }

    // 2. Prevent duplicate submissions
    if (processedIds.has(submissionId)) {
      const existing = recentSubmissions.find((s) => s.submissionId === submissionId);
      return res.json({
        success: true,
        isDuplicate: true,
        message: 'Response was already received and recorded.',
        submission: existing,
      });
    }

    // 3. Strict Activity Validation
    if (!activity || !VALID_ACTIVITIES.has(activity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity choice. Must be one of the 5 allowed hangout options.',
      });
    }

    // 4. Availability Validation
    if (!availability || !VALID_AVAILABILITIES.has(availability)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid availability option.',
      });
    }

    // 5. Message Sanitization (max 500 characters, remove dangerous control characters)
    let sanitizedMessage = '';
    if (message && typeof message === 'string') {
      if (message.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Optional message must not exceed 500 characters.',
        });
      }
      sanitizedMessage = message.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
    }

    const submissionRecord: HangoutSubmission = {
      submissionId,
      timestamp: timestamp && typeof timestamp === 'string' ? timestamp : new Date().toISOString(),
      responseStatus: 'Accepted and submitted',
      activity,
      availability,
      preferredDate: typeof preferredDate === 'string' ? preferredDate.slice(0, 50) : '',
      preferredTime: typeof preferredTime === 'string' ? preferredTime.slice(0, 50) : '',
      message: sanitizedMessage,
    };

    // Store in session memory
    recentSubmissions.unshift(submissionRecord);
    if (recentSubmissions.length > 100) recentSubmissions.pop();
    processedIds.set(submissionId, Date.now());

    // Forward to Google Sheets Web App if configured
    const sheetsUrl = process.env.GOOGLE_SHEET_WEBAPP_URL?.trim();
    let savedToGoogleSheets = false;
    let sheetsError: string | null = null;

    if (sheetsUrl && sheetsUrl.startsWith('https://script.google.com')) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const sheetResponse = await fetch(sheetsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'record_submission',
            data: submissionRecord,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (sheetResponse.ok) {
          const sheetResult = await sheetResponse.json().catch(() => ({ status: 'success' }));
          if (sheetResult && sheetResult.status === 'success') {
            savedToGoogleSheets = true;
          } else {
            sheetsError = sheetResult?.message || 'Google Sheets script returned non-success';
          }
        } else {
          sheetsError = `Google Sheets script responded with HTTP status ${sheetResponse.status}`;
        }
      } catch (err: any) {
        sheetsError = err?.message || 'Failed to reach Google Apps Script web app';
        console.error('Google Sheets forwarding error:', err);
      }
    }

    return res.json({
      success: true,
      submissionId,
      savedToGoogleSheets,
      sheetsConfigured: Boolean(sheetsUrl),
      sheetsNotice: sheetsError,
      submission: submissionRecord,
    });
  } catch (error: any) {
    console.error('Submission processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected server error occurred while saving the response.',
    });
  }
});

app.post('/api/decline', async (req: Request, res: Response) => {
  try {
    const { submissionId, timestamp } = req.body;
    if (!submissionId || typeof submissionId !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid submission ID.' });
    }

    const declineRecord: HangoutSubmission = {
      submissionId,
      timestamp: timestamp || new Date().toISOString(),
      responseStatus: 'Declined',
      activity: 'None (Declined politely)',
      availability: 'N/A',
      preferredDate: '',
      preferredTime: '',
      message: '',
    };

    recentSubmissions.unshift(declineRecord);
    processedIds.set(submissionId, Date.now());

    const sheetsUrl = process.env.GOOGLE_SHEET_WEBAPP_URL?.trim();
    if (sheetsUrl && sheetsUrl.startsWith('https://script.google.com')) {
      fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_submission',
          data: declineRecord,
        }),
      }).catch((err) => console.error('Error forwarding decline to sheets:', err));
    }

    return res.json({ success: true, status: 'Declined' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to record decline.' });
  }
});

// Test endpoint to test Google Sheets integration with a safe test row
app.post('/api/test-sheets', async (req: Request, res: Response) => {
  const targetUrl = req.body.url || process.env.GOOGLE_SHEET_WEBAPP_URL?.trim();
  if (!targetUrl || !targetUrl.startsWith('https://script.google.com')) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid Google Apps Script Web App URL starting with https://script.google.com',
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const testPayload: HangoutSubmission = {
      submissionId: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      responseStatus: 'Accepted and submitted',
      activity: '🌶️ Pani Puri',
      availability: 'This weekend',
      preferredDate: 'Test Day',
      preferredTime: 'Evening',
      message: 'Test row from Google AI Studio setup tester 👻',
    };

    const sheetResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'record_submission',
        data: testPayload,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!sheetResponse.ok) {
      return res.status(502).json({
        success: false,
        error: `Google Apps Script returned HTTP ${sheetResponse.status}. Make sure the Web App is deployed with "Who has access: Anyone".`,
      });
    }

    const data = await sheetResponse.json().catch(() => ({ status: 'success' }));
    return res.json({
      success: true,
      message: 'Successfully connected and inserted a test row into your Google Sheet!',
      response: data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Could not connect to Google Apps Script: ${err?.message || 'Network timeout or CORS issue.'}`,
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false, // HMR disabled per environment constraints to prevent connection resets
      },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Only serve transformed index.html for page navigation GET requests
    app.get('*', async (req: Request, res: Response, next) => {
      // Never intercept API routes
      if (req.path.startsWith('/api')) {
        return next();
      }

      // Do not intercept static files with file extensions (js, css, images, etc.)
      if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return next();
      }

      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) {
          vite.ssrFixStacktrace(e);
        }
        next(e);
      }
    });
  } else {
    // Production mode: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
