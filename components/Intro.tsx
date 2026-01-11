
import { useEffect, useState, useRef, type FC } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const Intro: FC<IntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'dot' | 'expand' | 'fade'>('dot');
  const [displayText, setDisplayText] = useState('');
  const [subTextOpacity, setSubTextOpacity] = useState(0);
  
  // Cipher Config
  const targetText = "Aura";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#";
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    // 1. Expansion Sequence - Slower start (1.2s delay)
    const t1 = setTimeout(() => setPhase('expand'), 1200);
    
    // 2. Cipher Text Effect - Starts later (2.0s) and decodes slower
    const tCipher = setTimeout(() => {
      let iteration = 0;
      clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        setDisplayText(prev => 
          targetText
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return targetText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= targetText.length) {
          clearInterval(intervalRef.current);
        }
        
        // Slower decryption speed: require 4 cycles to lock a letter instead of 3
        iteration += 1 / 4; 
      }, 50); // Slower tick rate (50ms instead of 30ms)
    }, 2000);

    // 3. Subtext Fade In - Much later (3.5s)
    const tSub = setTimeout(() => setSubTextOpacity(1), 3500);

    // 4. Exit Sequence - Let it linger (5.5s)
    const t2 = setTimeout(() => setPhase('fade'), 5500);
    // 5. Unmount (6.5s)
    const t3 = setTimeout(onComplete, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(tCipher);
      clearTimeout(tSub);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(intervalRef.current);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-[2000ms] ease-in-out ${phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Expanding Iris Effect - Slower expansion (2500ms) */}
      <div 
        className={`absolute rounded-full bg-white transition-all duration-[2500ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${phase === 'dot' ? 'w-1 h-1' : 'w-[250vmax] h-[250vmax]'}`}
      />
      
      <div className="relative z-10 flex flex-col items-center mix-blend-difference">
        {/* Cipher Text Title - Slower transition */}
        <h1 className={`text-7xl md:text-9xl font-bold tracking-tighter transition-all duration-[1500ms] ${phase === 'expand' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} text-white font-mono`}>
          {displayText}
        </h1>
        
        {/* Subtext - Slower transition */}
        <div 
          className="mt-6 flex items-center gap-3 transition-all duration-[1500ms]"
          style={{ opacity: subTextOpacity, transform: subTextOpacity ? 'translateY(0)' : 'translateY(10px)' }}
        >
          <div className="h-[1px] w-8 bg-white/50" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-medium text-white">
            Space for Curious Minds
          </p>
          <div className="h-[1px] w-8 bg-white/50" />
        </div>
      </div>
    </div>
  );
};

export default Intro;
