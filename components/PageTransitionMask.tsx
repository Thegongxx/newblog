import { motion, AnimatePresence } from 'framer-motion';
import { usePageTransitionControl } from '../hooks/usePageTransitionControl';

const PageTransitionMask = () => {
  const { isTransitioning } = usePageTransitionControl();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.001 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 bg-black pointer-events-none"
          style={{ 
            zIndex: 9999
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default PageTransitionMask;