import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePageTransition } from '../../hooks/usePageTransition';
import { createPageVariants, getTransitionConfig } from '../../utils/pageTransitions';

interface DesktopNavigationProps {
    children: ReactNode;
}

export default function DesktopNavigation({ children }: DesktopNavigationProps) {
    const { navigationMethod } = usePageTransition();
    const variants = createPageVariants(navigationMethod);
    const transition = getTransitionConfig(navigationMethod, false);

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
