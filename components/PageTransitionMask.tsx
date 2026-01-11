import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransitionControl } from '../hooks/usePageTransitionControl';

const PageTransitionMask = () => {
  const { isTransitioning, transitionPhase } = usePageTransitionControl();

  return (
    <AnimatePresence>
      {isTransitioning && transitionPhase === 'exiting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.005 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 bg-black pointer-events-none"
          style={{ 
            zIndex: 9999,
            backdropFilter: 'blur(0.5px)'
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default PageTransitionMask;