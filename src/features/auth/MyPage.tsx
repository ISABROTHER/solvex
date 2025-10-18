import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Import Link
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider'; // Use the consolidated useAuth
import { supabase } from '@/lib/supabase/client'; // Use alias
import { Loader2, LogIn, UserPlus, ArrowLeft } from 'lucide-react'; // Import ArrowLeft

type Tab = 'client' | 'admin';

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, isAuthenticated, role, isLoading: authLoading } = useAuth(); // Destructure signup
    const [activeTab, setActiveTab] = useState<Tab>(location.state?.defaultTab || 'client');
    const [isSignup, setIsSignup] = useState(false); // State to toggle between login and signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // State for full name in signup
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            if (role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (role === 'client') {
                navigate('/client', { replace: true });
            }
             // 'pending' role will be handled by the ClientRoute, no redirect needed here
        }
    }, [isAuthenticated, role, navigate, authLoading]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setIsSignup(false); // Reset to login view when changing tabs
        setError(null); // Clear errors
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignup) {
                // Perform signup using the function from AuthProvider
                await signup(email, password, fullName); // Pass fullName
                // After successful signup, Supabase might require email confirmation.
                // Inform the user to check their email.
                // Optionally switch back to login view or navigate to a specific page.
                addToast({ type: 'success', title: 'Signup Successful', message: 'Please check your email to confirm your account.'});
                setIsSignup(false); // Switch back to login view
                // Clear fields maybe?
                setEmail('');
                setPassword('');
                setFullName('');

            } else {
                // Perform login using the function from AuthProvider
                await login(email, password);
                // AuthProvider's onAuthStateChange listener will handle redirection
                addToast({ type: 'success', title: 'Login Successful', message: 'Redirecting...'});
            }
        } catch (err: any) {
            console.error(`${isSignup ? 'Signup' : 'Login'} Error:`, err);
            setError(err.message || `An unexpected ${isSignup ? 'signup' : 'login'} error occurred.`);
        } finally {
            setLoading(false);
        }
    };

    // Placeholder for addToast - integrate with your actual ToastContext
    const addToast = (options: { type: string, title: string, message: string }) => {
        console.log(`Toast (${options.type}): ${options.title} - ${options.message}`);
        // Replace with actual implementation:
        // toastContext.addToast(options);
    };

    const formTitle = isSignup ? 'Create Account' : (activeTab === 'client' ? 'Client Login' : 'Admin Login');
    const buttonText = isSignup ? 'Sign Up' : 'Login';
    const toggleText = isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up';


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-stone-100 to-orange-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden" // Added relative positioning
            >
                {/* Back to Home Link */}
                <Link
                    to="/"
                    className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10"
                    title="Back to Home"
                >
                    <ArrowLeft size={20} />
                </Link>

                {/* Logo and Tabs */}
                <div className="p-8 pb-0 text-center">
                     <img src="/Solvexstudios logo.png" alt="Solvex Logo" className="h-16 w-auto mx-auto mb-6" />
                     <div className="flex border-b">
                        <button
                            onClick={() => handleTabChange('client')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${
                                activeTab === 'client'
                                    ? 'border-b-2 border-[#FF5722] text-[#FF5722]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            CLIENT PORTAL
                        </button>
                        <button
                            onClick={() => handleTabChange('admin')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${
                                activeTab === 'admin'
                                    ? 'border-b-2 border-[#FF5722] text-[#FF5722]'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            ADMIN PANEL
                        </button>
                    </div>
                </div>

                {/* Form Area */}
                <div className="p-8">
                     <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">{formTitle}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Only show Full Name field during client signup */}
                        {isSignup && activeTab === 'client' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                             >
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-[#FF5722] focus:border-[#FF5722]"
                                    placeholder="Your Full Name"
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FF5722] focus:border-[#FF5722]"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FF5722] focus:border-[#FF5722]"
                                placeholder="••••••••"
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-red-600 text-center mt-2"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading || authLoading}
                            className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            {loading || authLoading ? <Loader2 className="animate-spin" /> : (isSignup ? <UserPlus size={18} /> : <LogIn size={18} />)}
                            {loading || authLoading ? 'Processing...' : buttonText}
                        </button>

                        {/* Toggle Signup/Login (only for Client tab) */}
                        {activeTab === 'client' && (
                            <button
                                type="button"
                                onClick={() => {setIsSignup(!isSignup); setError(null);}}
                                className="w-full text-center text-sm text-[#FF5722] hover:underline mt-4"
                             >
                                {toggleText}
                             </button>
                         )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default MyPage;