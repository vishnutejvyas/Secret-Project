import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { AvailabilityOption, TimePreferenceOption } from '../types';

interface ScreenAvailabilityProps {
  selectedAvailability: AvailabilityOption | null;
  preferredDay: string;
  preferredTime: TimePreferenceOption | null;
  onUpdateAvailability: (val: AvailabilityOption) => void;
  onUpdateDay: (day: string) => void;
  onUpdateTime: (time: TimePreferenceOption) => void;
  onContinue: () => void;
  onBack: () => void;
}

const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  'This weekend',
  'Next week',
  "Whenever we're both free",
  'Let me choose a day',
];

const TIME_OPTIONS: TimePreferenceOption[] = [
  'Morning',
  'Afternoon',
  'Evening',
  'Whenever works',
];

export const ScreenAvailability: React.FC<ScreenAvailabilityProps> = ({
  selectedAvailability,
  preferredDay,
  preferredTime,
  onUpdateAvailability,
  onUpdateDay,
  onUpdateTime,
  onContinue,
  onBack,
}) => {
  // Compute minimum selectable day (tomorrow onwards)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const isComplete =
    Boolean(selectedAvailability) &&
    (selectedAvailability !== 'Let me choose a day' || Boolean(preferredDay));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-xl mx-auto px-4 py-6"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 md:p-8 shadow-xl shadow-pink-100/70 border border-pink-100/80">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1 rounded-lg cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-medium text-slate-400">Step 2 of 3</span>
        </div>

        {/* Heading & Question */}
        <div className="text-center mb-6">
          <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-pink-500 mb-1">
            ONE QUICK THING, AVANTHI... ⏰
          </h2>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading mb-1 text-balance">
            When are you usually free?
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Just a rough preference so we know what works best!
          </p>
        </div>

        {/* Availability Choices */}
        <div className="space-y-2.5 mb-6">
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = selectedAvailability === opt;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => onUpdateAvailability(opt)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-pink-400 bg-pink-50/70 text-pink-950 font-bold shadow-xs'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-sm md:text-base font-medium">{opt}</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile Calendar Day Selector (if 'Let me choose a day' picked) */}
        {selectedAvailability === 'Let me choose a day' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70"
          >
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-semibold text-sm">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>Pick a day that works for you:</span>
            </div>
            <input
              type="date"
              min={minDateStr}
              value={preferredDay}
              onChange={(e) => onUpdateDay(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {preferredDay && (
              <p className="text-xs text-amber-800 mt-2 font-medium">
                Selected: {new Date(preferredDay + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </motion.div>
        )}

        {/* Optional Preferred Time of Day */}
        <div className="mb-8 pt-2">
          <div className="flex items-center gap-1.5 mb-2.5 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Preferred time (optional):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TIME_OPTIONS.map((time) => {
              const isSelected = preferredTime === time;

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => onUpdateTime(time)}
                  className={`py-2 px-3 rounded-xl text-xs md:text-sm font-medium border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continue Button */}
        <motion.button
          onClick={onContinue}
          disabled={!isComplete}
          whileHover={isComplete ? { scale: 1.02 } : {}}
          whileTap={isComplete ? { scale: 0.98 } : {}}
          className={`w-full h-13 rounded-2xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 ${
            isComplete
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200 hover:shadow-lg cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <span>CONTINUE →</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
