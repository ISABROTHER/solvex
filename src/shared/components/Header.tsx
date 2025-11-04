// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext'; // Correct path
import { useAuth } from '../../features/auth/AuthProvider'; // <-- THIS WAS THE BROKEN PATH

const mainNav = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Rentals', path: '/rentals' },
  { name: 'Careers', path: '/careers' },
  { name: 'Contact', path: '/contact' },
];

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  const location = useLocation();
  const { user, loading, isAdmin, isClient, logout } = useAuth();

  const cartItemCount = cart.length;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false); // Close mobile menu on route change
  }, [location.pathname]);

  const headerClasses = `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    isScrolled || isOpen
      ? 'bg-black bg-opacity-90 backdrop-blur-lg shadow-lg'
      : 'bg-transparent'
  }`;
  
  const authLink = {
    name: "My Page",
    path: "/my-page" // This correctly points to the MyPage router component
  };

  return (
    <header className={headerClasses}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <img
                className="h-9 w-auto"
                src="https://i.imgur.com/MhcvKs3.png"
                alt="SolveX Studios Logo"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {mainNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-[#FF5722]'
                      : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {/* Auth Link */}
            {!loading && (
              <NavLink
                to={authLink.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-[#FF5722]'
                      : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                <User size={16} />
                {user ? (isAdmin ? 'Admin' : (isClient ? 'Portal' : 'Profile')) : 'Login'}
              </NavLink>
            )}

            {/* Logout Button */}
            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            )}

            {/* Cart Icon */}
            <Link
              to="/rentals" // Points to rentals page, cart is in a drawer
              className="relative text-gray-300 hover:text-white"
              aria-label="View Cart"
            >
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5722] text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center md:hidden">
            <Link
              to="/rentals" 
              className="relative text-gray-300 hover:text-white mr-4"
              aria-label="View Cart"
            >
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5722] text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black bg-opacity-90"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {mainNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-[#FF5722]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}

              {/* Auth Link */}
              {!loading && (
                <NavLink
                  to={authLink.path}
                   className={({ isActive }) =>
                    `block px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? 'text-white bg-[#FF5722]' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  {user ? (isAdmin ? 'Admin' : (isClient ? 'Portal' : 'Profile')) : 'Login'}
                </NavLink>
              )}
              {/* Logout Button */}
              {user && (
                <button
                  onClick={logout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;