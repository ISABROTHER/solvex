import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const AnimatedHomeButton: React.FC = () => {
    // Defines the physics for the hover animation to feel smooth and responsive.
    const spring = {
        type: 'spring',
        stiffness: 500,
        damping: 30,
    };

    return (
        <Link
            to="/"
            className="absolute top-6 left-6 z-10"
            aria-label="Back to Home"
        >
            {/* This motion.div creates the main button element.
              - whileHover: Scales the button up slightly when hovered.
              - transition: Applies the spring physics for a fluid feel.
              - className: Styles the button to be a dark, glowing circle, closely matching your image.
            */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                transition={spring}
                className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-full shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 transition-shadow duration-300"
            >
                <Home className="w-6 h-6 text-gray-300" />
            </motion.div>
        </Link>
    );
};

export default AnimatedHomeButton;

