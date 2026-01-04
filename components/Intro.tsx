
import React, { useEffect, useState } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: React.FC<IntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'dot' | 'expand' | 'fade'>('dot');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('expand'), 800);
    const t2 = setTimeout(() => setPhase('fade'), 2800);
    const t3 = setTimeout(onComplete, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-1000 ${phase === 'fade' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Expanding Iris Effect */}
      <div 
        className={`absolute rounded-full bg-white transition-all duration-[1500ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${phase === 'dot' ? 'w-1 h-1' : 'w-[250vmax] h-[250vmax]'}`}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className={`text-5xl md:text-7xl font-bold tracking-tighter transition-all duration-1000 delay-300 ${phase === 'expand' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${phase === 'expand' ? 'text-black' : 'text-white'}`}>
          Aura
        </h1>
        <p className={`mt-4 text-[10px] uppercase tracking-[0.4em] font-medium transition-all duration-1000 delay-500 ${phase === 'expand' ? 'opacity-40 translate-y-0' : 'opacity-0 translate-y-2'} text-black`}>
          A space for curious minds
        </p>
      </div>
    </div>
  );
};

export default Intro;
