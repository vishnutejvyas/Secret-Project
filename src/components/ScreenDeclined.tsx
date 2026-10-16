import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import mascotWaving from '../assets/images/mascot_waving_welcome_1792056007462.jpg';

interface ScreenDeclinedProps {
  onRestart: () => void;
}

export const ScreenDeclined: React.FC<ScreenDeclinedProps> = ({ onRestart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center"
    >
      <div className="bg-white/95 rounded-3xl p-8 shadow-xl shadow-slate-100 border border-slate-200/80 flex flex-col items-center w-full">
        <div className="w-28 h-28 rounded-2xl overflow-hidden mb-6 bg-slate-50 border border-slate-200">
          <img
            src={mascotWaving}
            alt="Friendly ghost mascot"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3 font-heading">
          No worries, Avanthi! 😊
        </h1>

        <p className="text-base text-slate-600 mb-8 max-w-xs">
          Maybe another time. Hope you have a wonderful day! ✨
        </p>

        <button
          onClick={onRestart}
          className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors"
        >
          Changed your mind? Click here to start over
        </button>
      </div>
    </motion.div>
  );
};
