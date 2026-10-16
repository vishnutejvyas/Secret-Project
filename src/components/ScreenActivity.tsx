import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowLeft } from 'lucide-react';
import { ActivityOption } from '../types';

interface ScreenActivityProps {
  selectedActivity: ActivityOption | null;
  onSelect: (activity: ActivityOption) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface ActivityCardData {
  title: ActivityOption;
  emoji: string;
  badge: string;
  description: string;
  cardBg: string;
  selectedRing: string;
  accentColor: string;
}

const ACTIVITIES: ActivityCardData[] = [
  {
    title: '🌙 Night Walk',
    emoji: '🌙',
    badge: 'Night Walk',
    description: 'Cool breeze, random conversations, and no particular destination.',
    cardBg: 'from-indigo-50/80 to-purple-50/80',
    selectedRing: 'ring-indigo-400 bg-indigo-50/90',
    accentColor: 'text-indigo-600',
  },
  {
    title: '🌶️ Pani Puri',
    emoji: '🌶️',
    badge: 'Pani Puri',
    description: "One plate? Two plates? Let's see where this goes. 😂",
    cardBg: 'from-amber-50/80 to-orange-50/80',
    selectedRing: 'ring-orange-400 bg-orange-50/90',
    accentColor: 'text-orange-600',
  },
  {
    title: '🥞 Dosa',
    emoji: '🥞',
    badge: 'Dosa',
    description: 'Good dosa, good conversations. Simple. 🤌',
    cardBg: 'from-yellow-50/80 to-amber-50/80',
    selectedRing: 'ring-amber-400 bg-amber-50/90',
    accentColor: 'text-amber-700',
  },
  {
    title: '🍜 Maggie',
    emoji: '🍜',
    badge: 'Maggie',
    description: 'Maggie supremacy. No further explanation needed.',
    cardBg: 'from-rose-50/80 to-pink-50/80',
    selectedRing: 'ring-pink-400 bg-pink-50/90',
    accentColor: 'text-rose-600',
  },
  {
    title: '🚶 Outing',
    emoji: '🚶',
    badge: 'Outing',
    description: "Let's go somewhere fun and figure things out along the way. 👀",
    cardBg: 'from-emerald-50/80 to-teal-50/80',
    selectedRing: 'ring-emerald-400 bg-emerald-50/90',
    accentColor: 'text-emerald-700',
  },
];

export const ScreenActivity: React.FC<ScreenActivityProps> = ({
  selectedActivity,
  onSelect,
  onContinue,
  onBack,
}) => {
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors p-1 -ml-1 rounded-lg"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <span className="text-xs font-medium text-slate-400">Step 1 of 3</span>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-heading mb-1 text-balance">
            OKAY, AVANTHI 👻, YOUR TURN!
          </h1>
          <p className="text-sm md:text-base text-slate-500 text-balance">
            What sounds fun to you? 👀
          </p>
        </div>

        {/* 5 Activity Selection Cards */}
        <div className="space-y-3 mb-8" role="radiogroup" aria-label="Select activity">
          {ACTIVITIES.map((act) => {
            const isSelected = selectedActivity === act.title;

            return (
              <motion.button
                key={act.title}
                onClick={() => onSelect(act.title)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 relative cursor-pointer select-none ${
                  isSelected
                    ? `border-transparent ring-2 ${act.selectedRing} shadow-md`
                    : `bg-gradient-to-r ${act.cardBg} border-slate-200/60 hover:border-slate-300 hover:shadow-sm`
                }`}
              >
                {/* Visual Icon */}
                <span className="text-3xl shrink-0 p-1" role="img" aria-hidden="true">
                  {act.emoji}
                </span>

                {/* Content */}
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-base md:text-lg text-slate-800">
                      {act.title}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                {/* Selection Indicator Checkmark */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all mt-1 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-300 bg-white/70'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={onContinue}
          disabled={!selectedActivity}
          whileHover={selectedActivity ? { scale: 1.02 } : {}}
          whileTap={selectedActivity ? { scale: 0.98 } : {}}
          className={`w-full h-13 rounded-2xl font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 ${
            selectedActivity
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200 hover:shadow-lg cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          <span>THIS ONE! ✨</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
