import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit3, Sparkles } from 'lucide-react';
import { HangoutAnswers } from '../types';

interface ScreenMessageProps {
  answers: HangoutAnswers;
  onUpdateMessage: (msg: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onEditStep: (step: 'activity' | 'availability') => void;
  isSubmitting: boolean;
}

export const ScreenMessage: React.FC<ScreenMessageProps> = ({
  answers,
  onUpdateMessage,
  onSubmit,
  onBack,
  onEditStep,
  isSubmitting,
}) => {
  const maxLength = 500;
  const charsRemaining = maxLength - (answers.message?.length || 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto px-4 py-6"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-8 shadow-xl shadow-pink-100/70 border border-pink-100/80">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1 rounded-lg cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-medium text-slate-400">Step 3 of 3</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading mb-1 text-balance">
            ANY SPECIAL REQUESTS, AVANTHI? 😂
          </h1>
          <p className="text-xs md:text-sm text-slate-500 text-balance max-w-sm mx-auto">
            Suggestions, food demands, conditions... everything is welcome.
          </p>
        </div>

        {/* Optional Text Area */}
        <div className="mb-6">
          <div className="relative">
            <textarea
              value={answers.message}
              onChange={(e) => onUpdateMessage(e.target.value.slice(0, maxLength))}
              rows={4}
              placeholder="Tell me your ideas here... 👀"
              className="w-full p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-slate-800 text-sm md:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none transition-all placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center mt-1 px-1 text-[11px] text-slate-400">
              <span>Optional — feel free to skip!</span>
              <span className={charsRemaining < 50 ? 'text-rose-500 font-bold' : ''}>
                {charsRemaining} chars left
              </span>
            </div>
          </div>
        </div>

        {/* Review Card */}
        <div className="mb-8 p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Quick Review:
            </span>
          </div>

          <div className="space-y-2 text-xs md:text-sm text-slate-700">
            <div className="flex items-center justify-between py-1 border-b border-pink-100/60">
              <span className="text-slate-500">Activity:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{answers.activity || 'Not selected'}</span>
                <button
                  type="button"
                  onClick={() => onEditStep('activity')}
                  className="text-pink-600 hover:text-pink-800 p-0.5"
                  title="Change activity"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Availability:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {answers.availability}
                  {answers.preferredDay ? ` (${answers.preferredDay})` : ''}
                  {answers.preferredTime ? ` · ${answers.preferredTime}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onEditStep('availability')}
                  className="text-pink-600 hover:text-pink-800 p-0.5"
                  title="Change availability"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          onClick={onSubmit}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white font-extrabold text-base md:text-lg shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving your choices...</span>
            </div>
          ) : (
            <span>FINISH! 🎉</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
