import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mascotCurious from '../assets/images/mascot_curious_question_1792056008198.jpg';

interface ScreenQuestionProps {
  onYes: () => void;
  onDecline: () => void;
}

const FUNNY_MESSAGES = [
  'Hehe, try again, Avanthi 😂',
  'That button has other plans 💀',
  'Avanthi, even the button is running away 😭',
  'The YES button is getting suspiciously confident... 🙃',
  'Not you chasing a button right now 😂',
  'NO is fighting for its life 🏃',
  'Mission impossible: click NO 💀',
  'Are you sure about that? 👀',
  'Avanthi, this is getting personal 😂',
  'The button said BYEEEE 💨',
];

export const ScreenQuestion: React.FC<ScreenQuestionProps> = ({ onYes, onDecline }) => {
  const [escapeCount, setEscapeCount] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const lastMsgIndex = useRef<number>(-1);

  const moveNoButton = () => {
    if (!arenaRef.current || !yesButtonRef.current || !noButtonRef.current) return;
    const arenaRect = arenaRef.current.getBoundingClientRect();
    const yesRect = yesButtonRef.current.getBoundingClientRect();
    const noRect = noButtonRef.current.getBoundingClientRect();
    const maxYesScale = 1.4;
    const safeGap = 10;
    const edgePadding = 6;

    // Account for the YES button's maximum scale before choosing a destination.
    const yesCenterX = (yesRect.left + yesRect.right) / 2 - arenaRect.left;
    const yesCenterY = (yesRect.top + yesRect.bottom) / 2 - arenaRect.top;
    const safeYesBounds = {
      left: yesCenterX - (yesButtonRef.current.offsetWidth * maxYesScale) / 2 - safeGap,
      right: yesCenterX + (yesButtonRef.current.offsetWidth * maxYesScale) / 2 + safeGap,
      top: yesCenterY - (yesButtonRef.current.offsetHeight * maxYesScale) / 2 - safeGap,
      bottom: yesCenterY + (yesButtonRef.current.offsetHeight * maxYesScale) / 2 + safeGap,
    };

    const noBaseLeft = noRect.left - arenaRect.left - noOffset.x;
    const noBaseTop = noRect.top - arenaRect.top - noOffset.y;
    const minX = edgePadding - noBaseLeft;
    const maxX = arenaRect.width - edgePadding - noRect.width - noBaseLeft;
    const minY = edgePadding - noBaseTop;
    const maxY = arenaRect.height - edgePadding - noRect.height - noBaseTop;
    const positions: Array<{ x: number; y: number }> = [];

    for (let x = minX; x <= maxX; x += 8) {
      for (let y = minY; y <= maxY; y += 8) {
        const noLeft = noBaseLeft + x;
        const noTop = noBaseTop + y;
        const overlapsYes =
          noLeft < safeYesBounds.right &&
          noLeft + noRect.width > safeYesBounds.left &&
          noTop < safeYesBounds.bottom &&
          noTop + noRect.height > safeYesBounds.top;

        if (!overlapsYes) positions.push({ x, y });
      }
    }

    if (maxX >= minX && maxY >= minY) {
      for (const x of [minX, maxX]) {
        for (const y of [minY, maxY]) {
          const noLeft = noBaseLeft + x;
          const noTop = noBaseTop + y;
          const overlapsYes =
            noLeft < safeYesBounds.right &&
            noLeft + noRect.width > safeYesBounds.left &&
            noTop < safeYesBounds.bottom &&
            noTop + noRect.height > safeYesBounds.top;
          if (!overlapsYes) positions.push({ x, y });
        }
      }
    }

    const newPositions = positions.filter(
      (position) => Math.hypot(position.x - noOffset.x, position.y - noOffset.y) >= 60
    );
    const availablePositions = newPositions.length ? newPositions : positions;
    const destination = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    if (!destination) return;

    setNoOffset(destination);
    setEscapeCount((prev) => prev + 1);

    // Pick a random funny message avoiding consecutive repeats
    let nextIdx = Math.floor(Math.random() * FUNNY_MESSAGES.length);
    if (nextIdx === lastMsgIndex.current) {
      nextIdx = (nextIdx + 1) % FUNNY_MESSAGES.length;
    }
    lastMsgIndex.current = nextIdx;
    setCurrentMessage(FUNNY_MESSAGES[nextIdx]);
  };

  // Calculate YES scale with a sensible maximum to preserve layout integrity
  const yesScale = Math.min(1.4, 1 + escapeCount * 0.06);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto px-4 py-6"
    >
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl shadow-pink-100/60 border border-pink-100/80 flex flex-col items-center text-center relative overflow-hidden">
        {/* Cute Mascot */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-amber-100 shadow-sm mb-4 bg-amber-50">
          <img
            src={mascotCurious}
            alt="Cute curious ghost peeking"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heading */}
        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-pink-500 mb-1">
          SOOO, Avanthi... 👀
        </h2>

        {/* Main Question */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2 text-balance font-heading">
          Wanna hang out with me sometime? 🫣
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-slate-500 mb-6 text-balance max-w-sm">
          I have a few ideas, but you get to choose! 😂
        </p>

        {/* Dynamic Funny Escape Message */}
        <div className="min-h-[28px] mb-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {currentMessage && (
              <motion.p
                key={currentMessage}
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-semibold text-rose-500 bg-rose-50/90 px-3.5 py-1 rounded-full border border-rose-200/60 shadow-xs"
              >
                {currentMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Arena for YES and escaping NO buttons */}
        <div
          ref={arenaRef}
          className="w-full relative h-56 flex items-center justify-center gap-6"
        >
          {/* YES BUTTON */}
          <motion.button
            ref={yesButtonRef}
            onClick={onYes}
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.05 }}
            whileTap={{ scale: yesScale * 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="z-10 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-base md:text-lg shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-shadow cursor-pointer select-none"
            aria-label="Yes, I would love to hang out"
          >
            YESSS! 🎉
          </motion.button>

          {/* PLAYFUL ESCAPING NO BUTTON */}
          <motion.button
            ref={noButtonRef}
            onMouseEnter={moveNoButton}
            onTouchStart={moveNoButton}
            onClick={moveNoButton}
            animate={{
              x: noOffset.x,
              y: noOffset.y,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 22,
            }}
            tabIndex={-1} // Tab navigation handles polite decline separately for accessibility
            aria-hidden="true"
            className="z-20 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm md:text-base border border-slate-200/80 shadow-xs cursor-pointer select-none transition-colors"
          >
            NO 🙃
          </motion.button>
        </div>

        {/* Escape count counter badge (playful) */}
        {escapeCount > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Escaped attempts: <span className="font-mono font-semibold text-pink-500">{escapeCount}</span>
          </p>
        )}

        {/* Dignified Accessible Decline Option */}
        <div className="mt-6 pt-4 border-t border-slate-100 w-full flex justify-center">
          <button
            onClick={onDecline}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-pink-400 rounded-sm py-1 px-2"
            aria-label="Politely decline hanging out"
          >
            Prefer not to? Decline politely here 😊
          </button>
        </div>
      </div>
    </motion.div>
  );
};
