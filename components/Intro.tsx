
import React, { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(1.1);

  useEffect(() => {
    // Stage 1: Fade in
    const timer1 = setTimeout(() => setOpacity(1), 500);
    // Stage 2: Scale down gently
    const timer2 = setTimeout(() => setScale(1), 800);
    // Stage 3: Fade out and finish
    const timer3 = setTimeout(() => {
      setOpacity(0);
      setTimeout(onComplete, 1000);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center pointer-events-none overflow-hidden">
      <div 
        className="transition-all duration-[2000ms] ease-out flex flex-col items-center"
        style={{ 
          opacity, 
          transform: `scale(${scale})`,
          filter: `blur(${(1 - opacity) * 10}px)`
        }}
      >
        <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white">
          Aura
        </h1>
        <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent w-48 overflow-hidden">
           <div className="h-full bg-white w-full -translate-x-full animate-[shimmer_3s_infinite]" />
        </div>
        <p className="mt-8 text-white/40 font-light tracking-[0.2em] uppercase text-xs">
          Beyond the Surface
        </p>
      </div>

      {/* Fixed: Removed 'jsx' attribute from style tag */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Intro;
