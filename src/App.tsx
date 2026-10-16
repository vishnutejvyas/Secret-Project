/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { HangoutAnswers, ScreenStep, SubmissionStatus } from './types';
import { BackgroundDoodles } from './components/BackgroundDoodles';
import { Header } from './components/Header';
import { ScreenWelcome } from './components/ScreenWelcome';
import { ScreenQuestion } from './components/ScreenQuestion';
import { ScreenCelebration } from './components/ScreenCelebration';
import { ScreenActivity } from './components/ScreenActivity';
import { ScreenAvailability } from './components/ScreenAvailability';
import { ScreenMessage } from './components/ScreenMessage';
import { ScreenSummary } from './components/ScreenSummary';
import { ScreenDeclined } from './components/ScreenDeclined';
import { TesterModal } from './components/TesterModal';

import { getAccessToken } from './lib/googleAuth';
import { appendRowToSheet } from './lib/googleSheetsService';
import { safeStorage } from './lib/safeStorage';
import { apiUrl } from './lib/api';

const STORAGE_KEY = 'avanthi_hangout_draft_v1';

function generateSubmissionId(): string {
  return 'sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

const initialAnswers: HangoutAnswers = {
  submissionId: generateSubmissionId(),
  activity: null,
  availability: null,
  preferredDay: '',
  preferredTime: null,
  message: '',
};

export default function App() {
  const [step, setStep] = useState<ScreenStep>('welcome');
  const [answers, setAnswers] = useState<HangoutAnswers>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialAnswers,
          ...parsed,
          submissionId: parsed.submissionId || generateSubmissionId(),
        };
      }
    } catch (e) {
      // Ignore
    }
    return initialAnswers;
  });

  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [isSheetsConfigured, setIsSheetsConfigured] = useState(false);

  // Sync draft to safeStorage
  useEffect(() => {
    try {
      safeStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch (e) {
      // Ignore
    }
  }, [answers]);

  // Check backend sheets status on mount
  const checkStatus = async () => {
    try {
      const res = await fetch(apiUrl('/api/status'));
      if (res.ok) {
        const data = await res.json();
        setIsSheetsConfigured(Boolean(data.isSheetsConfigured));
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Handlers for step progression
  const handleStart = () => {
    setStep('question');
  };

  const handleYes = () => {
    setStep('celebration');
  };

  const handleDecline = async () => {
    setStep('declined');
    try {
      const nowIso = new Date().toISOString();
      await fetch(apiUrl('/api/decline'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: answers.submissionId,
          timestamp: nowIso,
        }),
      });

      const token = await getAccessToken();
      const savedSheetId = safeStorage.getItem('avanthi_google_sheet_id');
      if (token && savedSheetId) {
        appendRowToSheet(token, savedSheetId, [
          answers.submissionId,
          nowIso,
          'Declined',
          'None (Declined politely)',
          'N/A',
          '-',
          '-',
          '-',
        ]).catch((e) => console.warn('Could not append direct decline row:', e));
      }
    } catch (e) {
      console.error('Error logging decline:', e);
    }
  };

  const handleActivitySelected = (activity: HangoutAnswers['activity']) => {
    setAnswers((prev) => ({ ...prev, activity }));
  };

  const handleFinalSubmit = async () => {
    setSubmissionStatus('submitting');
    setErrorMessage(null);

    try {
      const payload = {
        submissionId: answers.submissionId,
        activity: answers.activity,
        availability: answers.availability,
        preferredDate: answers.preferredDay || '',
        preferredTime: answers.preferredTime || '',
        message: answers.message || '',
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(apiUrl('/api/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmissionStatus('success');
        setStep('summary');

        // Direct Google Sheets API append if owner has linked a sheet
        try {
          const token = await getAccessToken();
          const savedSheetId = safeStorage.getItem('avanthi_google_sheet_id');
          if (token && savedSheetId) {
            await appendRowToSheet(token, savedSheetId, [
              payload.submissionId,
              payload.timestamp,
              'Accepted and submitted',
              payload.activity || '',
              payload.availability || '',
              payload.preferredDate || '-',
              payload.preferredTime || '-',
              payload.message || '-',
            ]);
          }
        } catch (sheetErr) {
          console.warn('Direct sheet append notice:', sheetErr);
        }

        // Clear draft from storage on verified success
        safeStorage.removeItem(STORAGE_KEY);
      } else {
        setSubmissionStatus('error');
        setErrorMessage(data.error || 'Could not save response. Please try again.');
        setStep('summary');
      }
    } catch (err: any) {
      setSubmissionStatus('error');
      setErrorMessage(
        err?.message || 'Network error: could not connect to server to save response.'
      );
      setStep('summary');
    }
  };

  const handleReset = () => {
    const freshId = generateSubmissionId();
    setAnswers({
      submissionId: freshId,
      activity: null,
      availability: null,
      preferredDay: '',
      preferredTime: null,
      message: '',
    });
    setSubmissionStatus('idle');
    setErrorMessage(null);
    setStep('welcome');
    safeStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-pink-200">
      <BackgroundDoodles />

      {/* Top Bar Header */}
      <Header
        onOpenTester={() => setIsTesterOpen(true)}
        sheetsConfigured={isSheetsConfigured}
      />

      {/* Main Interactive Viewport Container */}
      <main className="flex-1 flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <ScreenWelcome key="welcome" onNext={handleStart} />
          )}

          {step === 'question' && (
            <ScreenQuestion
              key="question"
              onYes={handleYes}
              onDecline={handleDecline}
            />
          )}

          {step === 'celebration' && (
            <ScreenCelebration
              key="celebration"
              onContinue={() => setStep('activity')}
            />
          )}

          {step === 'activity' && (
            <ScreenActivity
              key="activity"
              selectedActivity={answers.activity}
              onSelect={handleActivitySelected}
              onContinue={() => setStep('availability')}
              onBack={() => setStep('question')}
            />
          )}

          {step === 'availability' && (
            <ScreenAvailability
              key="availability"
              selectedAvailability={answers.availability}
              preferredDay={answers.preferredDay}
              preferredTime={answers.preferredTime}
              onUpdateAvailability={(val) =>
                setAnswers((prev) => ({ ...prev, availability: val }))
              }
              onUpdateDay={(day) =>
                setAnswers((prev) => ({ ...prev, preferredDay: day }))
              }
              onUpdateTime={(time) =>
                setAnswers((prev) => ({ ...prev, preferredTime: time }))
              }
              onContinue={() => setStep('message')}
              onBack={() => setStep('activity')}
            />
          )}

          {step === 'message' && (
            <ScreenMessage
              key="message"
              answers={answers}
              onUpdateMessage={(msg) =>
                setAnswers((prev) => ({ ...prev, message: msg }))
              }
              onSubmit={handleFinalSubmit}
              onBack={() => setStep('availability')}
              onEditStep={(target) => setStep(target)}
              isSubmitting={submissionStatus === 'submitting'}
            />
          )}

          {step === 'summary' && (
            <ScreenSummary
              key="summary"
              answers={answers}
              submissionStatus={submissionStatus}
              errorMessage={errorMessage}
              onRetry={handleFinalSubmit}
              onReset={handleReset}
            />
          )}

          {step === 'declined' && (
            <ScreenDeclined
              key="declined"
              onRestart={handleReset}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4">
          <span>Made for Avanthi 👻</span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span>100% Casual Vibes</span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <button
            onClick={() => setIsTesterOpen(true)}
            className="hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Google Sheets Setup &amp; Tester
          </button>
        </div>
      </footer>

      {/* Google Sheets Status & Tester Modal */}
      <TesterModal
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        isSheetsConfigured={isSheetsConfigured}
        onRefreshStatus={checkStatus}
      />
    </div>
  );
}
