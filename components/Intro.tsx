
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useResponsive';

interface IntroProps {
  onComplete: () => void;
}

const AppleEasing = [0.23, 1, 0.32, 1];

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<'dot' | 'expand' | 'text' | 'fade'>('dot');
  const [displayText, setDisplayText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Cipher Config
  const targetText = "xuan";
  const chars = "abcdefghijklmnopqrstuvwxyz!<>-_\\/[]{}—=+*^?#";
  const intervalRef = useRef<any>(null);

  // 动画时长配置 (单位：秒)
  const TIMING = useMemo(() => ({
    expandDelay: 0.8,
    textDelay: 1.8,
    fadeDelay: 4.5,
    totalDuration: 5.5,
    forceSkip: 7.0
  }), []);

  const handleComplete = () => {
    if (isFinished) return;
    setIsFinished(true);
    onComplete();
  };

  useEffect(() => {
    const skipTimer = setTimeout(() => handleComplete(), TIMING.forceSkip * 1000);
    const tExpand = setTimeout(() => setPhase('expand'), TIMING.expandDelay * 1000);
    const tTextPhase = setTimeout(() => setPhase('text'), TIMING.textDelay * 1000);

    const tCipher = setTimeout(() => {
      let iteration = 0;
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setDisplayText(
          targetText
            .split("")
            .map((letter, index) => {
              if (index < iteration) return targetText[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        if (iteration >= targetText.length) clearInterval(intervalRef.current);
        iteration += 1 / 4;
      }, 50);
    }, TIMING.textDelay * 1000 + 400);

    const tFade = setTimeout(() => setPhase('fade'), TIMING.fadeDelay * 1000);
    const tEnd = setTimeout(() => handleComplete(), TIMING.totalDuration * 1000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(tExpand);
      clearTimeout(tTextPhase);
      clearTimeout(tCipher);
      clearTimeout(tFade);
      clearTimeout(tEnd);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [TIMING]);

  return (
    <AnimatePresence>
      {phase !== 'fade' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: AppleEasing as any }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleComplete}
        >
          {/* Enhanced Iris Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase === 'dot' ? 0.05 : 60,
              opacity: 1
            }}
            transition={{
              duration: 2.2,
              ease: AppleEasing as any,
              delay: 0.1
            }}
            className="absolute w-20 h-20 rounded-full bg-white"
            style={{ filter: "blur(2px)" }}
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center mix-blend-difference">
            <motion.h1
              initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
              animate={{
                opacity: phase === 'text' ? 1 : 0,
                y: phase === 'text' ? 0 : 15,
                filter: phase === 'text' ? 'blur(0px)' : 'blur(10px)'
              }}
              transition={{ duration: 1.2, ease: AppleEasing as any }}
              className="text-5xl md:text-[7rem] font-bold tracking-tighter"
              style={{ color: '#fff' }}
            >
              {displayText || "xuan"}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'text' ? 0.35 : 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-12 flex items-center gap-4"
            >
              <div className="h-[1px] w-8 bg-white/40" />
              <p className="text-[11px] uppercase tracking-[0.6em] font-medium text-white">
                Focus on Clarity
              </p>
              <div className="h-[1px] w-8 bg-white/40" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Intro;
