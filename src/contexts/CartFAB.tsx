import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartFAB: React.FC = () => {
  const { cartCount, openCart } = useCart(); 

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.button
          onClick={openCart}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#FF5722] rounded-full text-white shadow-lg flex items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`View cart with ${cartCount} items`}
        >
          <ShoppingCart size={28} />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#C10100] rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
            {cartCount}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default CartFAB;