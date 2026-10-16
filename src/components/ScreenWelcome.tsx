import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mascotWaving from '../assets/images/mascot_waving_welcome_1792056007462.jpg';

interface ScreenWelcomeProps {
  onNext: () => void;
}

export const ScreenWelcome: React.FC<ScreenWelcomeProps> = ({ onNext }) => {
  const [clicked, setClicked] = useState(false);
  const [burstStars, setBurstStars] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    setBurstStars(true);
    setTimeout(() => {
      onNext();
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center text-center relative"
    >
      {/* Little burst stars on click */}
      <AnimatePresence>
        {burstStars && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
            {[-40, -15, 15, 40].map((deg, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.4,
                  x: Math.cos((deg * Math.PI) / 180) * 80,
                  y: Math.sin((deg * Math.PI) / 180) * 80,
                }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute text-xl"
              >
                ✨
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Mascot Card */}
      <div className="relative mb-6">
        <div className="w-44 h-44 md:w-52 md:h-52 rounded-3xl overflow-hidden shadow-lg shadow-pink-100/70 border-4 border-white bg-white flex items-center justify-center transition-transform hover:scale-105 duration-300">
          <img
            src={mascotWaving}
            alt="Cute friendly ghost waving happily"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span
          className="absolute -bottom-2 -right-2 text-2xl select-none animate-cute-bounce"
          role="img"
          aria-label="sparkles"
        >
          ✨
        </span>
      </div>

      {/* Main Text */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2 text-balance font-heading">
        Heyyy, Avanthi 👻!
      </h1>

      {/* Second Line */}
      <p className="text-lg md:text-xl font-medium text-slate-700 mb-3 text-balance">
        I have a tiny question for you... 👀
      </p>

      {/* Small Text */}
      <p className="text-sm text-slate-400 mb-8 max-w-xs text-balance">
        Okay, maybe not THAT important. 😂
      </p>

      {/* Button */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="w-full max-w-xs h-14 rounded-2xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 text-white font-bold text-base md:text-lg shadow-lg shadow-pink-200/80 hover:shadow-xl hover:shadow-pink-300/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Okay, tell me! ✨</span>
      </motion.button>
    </motion.div>
  );
};
