import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { HangoutAnswers, SubmissionStatus } from '../types';
import mascotThumbsUp from '../assets/images/mascot_thumbsup_summary_1792056008734.jpg';

interface ScreenSummaryProps {
  answers: HangoutAnswers;
  submissionStatus: SubmissionStatus;
  errorMessage: string | null;
  onRetry: () => void;
  onReset: () => void;
}

export const ScreenSummary: React.FC<ScreenSummaryProps> = ({
  answers,
  submissionStatus,
  errorMessage,
  onRetry,
  onReset,
}) => {
  // Dynamic message based on her selected activity
  const getDynamicReaction = () => {
    switch (answers.activity) {
      case '🌙 Night Walk':
        return (
          <>
            Night walk it is, Avanthi! 🌙<br />
            Someone likes peaceful vibes.
          </>
        );
      case '🌶️ Pani Puri':
        return 'PANI PURI?! AVANTHI IS A PERSON OF CULTURE. 🤌😂';
      case '🥞 Dosa':
        return 'Dosa has officially entered the conversation. 🫡';
      case '🍜 Maggie':
        return 'Maggie supremacy. Avanthi understands the assignment. 🍜😂';
      case '🚶 Outing':
        return (
          <>
            An adventure with no fixed plan.<br />
            Interesting choice, Avanthi. 👀
          </>
        );
      default:
        return "That sounds like a lot of fun, Avanthi! Let's do it! 🎉";
    }
  };

  // If there was a submission error
  if (submissionStatus === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg mx-auto px-4 py-8"
      >
        <div className="bg-white/95 rounded-3xl p-6 md:p-8 shadow-xl shadow-rose-100 border border-rose-200 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2 font-heading">
            Oops, quick hitch! 😅
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {errorMessage || 'Something tripped on the network while saving your response.'}
          </p>

          <p className="text-xs text-slate-400 mb-6">
            Your choices are still safely kept right here. Give it another tap!
          </p>

          <button
            onClick={onRetry}
            className="w-full h-12 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto px-4 py-6"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl shadow-pink-100/70 border border-pink-100/80 flex flex-col items-center text-center">
        {/* Mascot Thumbs Up */}
        <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden shadow-md border-4 border-amber-50 mb-5 bg-amber-50/50">
          <img
            src={mascotThumbsUp}
            alt="Cute mascot ghost giving thumbs up"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading mb-3">
          THE PLAN HAS BEEN SELECTED. 🫡
        </h1>

        {/* Dynamic Reaction Box */}
        <div className="w-full p-4 mb-6 rounded-2xl bg-gradient-to-r from-amber-50 via-pink-50 to-purple-50 border border-pink-100/80">
          <p className="text-base md:text-lg font-bold text-slate-800 leading-snug">
            {getDynamicReaction()}
          </p>
        </div>

        {/* Selected Summary Card */}
        <div className="w-full p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-left mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/60 text-sm">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Activity
            </span>
            <span className="font-bold text-slate-800 mt-0.5 sm:mt-0">
              {answers.activity}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/60 text-sm">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Availability
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 sm:mt-0">
              {answers.availability}
            </span>
          </div>

          {answers.preferredDay && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/60 text-sm">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Chosen Day
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 sm:mt-0">
                {answers.preferredDay}
              </span>
            </div>
          )}

          {answers.preferredTime && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/60 text-sm">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Preferred Time
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 sm:mt-0">
                {answers.preferredTime}
              </span>
            </div>
          )}

          {answers.message && answers.message.trim().length > 0 && (
            <div className="pt-1">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Her Message
              </span>
              <p className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                "{answers.message}"
              </p>
            </div>
          )}
        </div>

        {/* Fun Outro text */}
        <div className="space-y-1 mb-8">
          <p className="text-base font-semibold text-slate-700">
            Looks like we have something to plan! 😂
          </p>
          <p className="text-sm text-slate-400">
            Let's figure out the details together.
          </p>
        </div>

        {/* Status Confirmation Badge */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Response recorded successfully</span>
        </div>

        {/* Reset / Start over option */}
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors"
        >
          Want to change something? Restart questionnaire
        </button>
      </div>
    </motion.div>
  );
};
