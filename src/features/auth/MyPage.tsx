import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const AnimatedHomeButton: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    const spring = {
        type: 'spring',
        stiffness: 400,
        damping: 15,
    };

    return (
        <Link
            to="/"
            className="absolute top-6 left-6 z-10"
            aria-label="Back to Home"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                layout // This prop enables the magic morph animation
                transition={spring}
                className="flex items-center justify-center gap-2 px-3 h-12 bg-white/70 backdrop-blur-sm rounded-full shadow-lg"
                style={{
                    width: isHovered ? '95px' : '48px', // Animate width
                }}
            >
                <Home className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
                    transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
                    className="text-sm font-semibold text-gray-700 whitespace-nowrap"
                >
                    Home
                </motion.span>
            </motion.div>
        </Link>
    );
}; 

export default AnimatedHomeButton;
