import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePageTransition } from '../../hooks/usePageTransition';
import { createPageVariants, getTransitionConfig } from '../../utils/pageTransitions';

interface MobileNavigationProps {
    children: ReactNode;
}

export default function MobileNavigation({ children }: MobileNavigationProps) {
    const { navigationMethod } = usePageTransition();
    const variants = createPageVariants(navigationMethod);
    const transition = getTransitionConfig(navigationMethod, true);

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            style={{
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
            }}
        >
            {children}
        </motion.div>
    );
}

