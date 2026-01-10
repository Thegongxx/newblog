import { motion } from 'framer-motion';

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <motion.div
      className="flex gap-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-white/30"
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  </div>
);

export default LoadingFallback;
