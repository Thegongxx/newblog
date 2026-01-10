import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/notes', label: 'Notes' },
  { path: '/archive', label: 'Archive' },
  { path: '/about', label: 'About' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
        aria-label="Toggle menu"
      >
        <motion.span
          className="w-5 h-0.5 bg-white/80 rounded-full"
          animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        />
        <motion.span
          className="w-5 h-0.5 bg-white/80 rounded-full"
          animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        />
        <motion.span
          className="w-5 h-0.5 bg-white/80 rounded-full"
          animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-64 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 p-8"
            >
              <div className="mt-16 space-y-2">
                <button
                  onClick={() => handleNavigate('/')}
                  className="block w-full text-left py-3 text-lg font-bold text-white/90 hover:text-white"
                >
                  Home
                </button>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`block w-full text-left py-3 text-lg font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
