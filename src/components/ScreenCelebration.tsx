import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import mascotCelebration from '../assets/images/mascot_party_celebrate_1792056010087.jpg';

interface ScreenCelebrationProps {
  onContinue: () => void;
}

export const ScreenCelebration: React.FC<ScreenCelebrationProps> = ({ onContinue }) => {
  useEffect(() => {
    // Multi-burst confetti celebration
    const end = Date.now() + 1800;
    const colors = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col items-center text-center"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl shadow-pink-200/60 border border-pink-100 flex flex-col items-center w-full">
        {/* Celebrating Mascot */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut',
          }}
          className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-lg shadow-purple-100/70 border-4 border-white mb-6 bg-purple-50"
        >
          <img
            src={mascotCelebration}
            alt="Joyful ghost celebrating with confetti"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Celebratory Headlines */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-pink-600 tracking-tight mb-2 font-heading">
          AVANTHI SAID YESSS! 🎉😂
        </h1>

        <p className="text-lg md:text-xl font-bold text-slate-800 mb-2">
          EVERYBODY STAY CALM. 🫡
        </p>

        <p className="text-sm md:text-base text-slate-500 mb-8 max-w-xs">
          Okay, now we need to figure out the plan!
        </p>

        {/* Action Button */}
        <motion.button
          onClick={onContinue}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-full max-w-xs h-13 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-base shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Choose what sounds fun! ✨</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
