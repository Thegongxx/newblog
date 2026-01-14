
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useResponsive';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<'dot' | 'expand' | 'text' | 'fade'>('dot');
  const [displayText, setDisplayText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Cipher Config
  const targetText = "Aura";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#";
  const intervalRef = useRef<any>(null);

  // 动画时长配置 (单位：秒)
  const TIMING = useMemo(() => ({
    expandDelay: isMobile ? 0.6 : 0.8,
    textDelay: isMobile ? 1.2 : 1.5,
    fadeDelay: isMobile ? 2.8 : 3.5,
    totalDuration: isMobile ? 4.0 : 4.8, // 包含退出动画
    forceSkip: 4.5 // 绝对兜底时间
  }), [isMobile]);

  useEffect(() => {
    // 强制跳过逻辑 - 彻底杜绝黑屏死锁
    const skipTimer = setTimeout(() => {
      if (!isFinished) {
        console.warn("Intro animation timeout, forcing complete.");
        onComplete();
      }
    }, TIMING.forceSkip * 1000);

    // 1. 启动展开
    const tExpand = setTimeout(() => setPhase('expand'), TIMING.expandDelay * 1000);

    // 2. 文本效果
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
        iteration += 1 / 3;
      }, 40);
    }, TIMING.textDelay * 1000 + 200);

    // 3. 渐变退出
    const tFade = setTimeout(() => setPhase('fade'), TIMING.fadeDelay * 1000);

    // 4. 完成挂载
    const tEnd = setTimeout(() => {
      setIsFinished(true);
      onComplete();
    }, TIMING.totalDuration * 1000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(tExpand);
      clearTimeout(tTextPhase);
      clearTimeout(tCipher);
      clearTimeout(tFade);
      clearTimeout(tEnd);
      clearInterval(intervalRef.current);
    };
  }, [onComplete, TIMING, targetText, isFinished]);

  return (
    <AnimatePresence>
      {phase !== 'fade' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Iris Effect - 使用 scale 代替 vmax 单位以提升稳定性 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: phase === 'dot' ? 0 : 40 }}
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1
            }}
            className="absolute w-20 h-20 rounded-full bg-white"
          />

          <div className={`relative z-10 flex flex-col items-center px-6 text-center ${isMobile ? '' : 'mix-blend-difference'}`}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: phase === 'text' ? 1 : 0,
                y: phase === 'text' ? 0 : 20
              }}
              transition={{ duration: 0.6 }}
              className="text-6xl md:text-9xl font-bold tracking-tighter font-mono"
              style={{ color: isMobile ? '#000' : '#fff' }}
            >
              {displayText}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'text' ? 0.6 : 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex items-center gap-3"
            >
              <div className="h-[1px] w-6 bg-black md:bg-white/50" />
              <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-black md:text-white">
                Aura Sanctuary
              </p>
              <div className="h-[1px] w-6 bg-black md:bg-white/50" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Intro;
