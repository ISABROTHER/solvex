import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import AnimatedHomeButton from './AnimatedHomeButton'; // Import the new animated button

type Tab = 'client' | 'admin';

const MyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, signup, isAuthenticated, role, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>(location.state?.defaultTab || 'client');
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            if (role === 'admin') {
                navigate('/admin', { replace: true });
            } else { // Handles 'client' and 'pending' roles
                navigate('/client', { replace: true });
            }
        }
    }, [isAuthenticated, role, navigate, authLoading]);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setIsSignup(false);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignup) {
                await signup(email, password, fullName);
                setIsSignup(false);
                alert('Signup successful! Please check your email to verify your account before logging in.');
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            console.error(`${isSignup ? 'Signup' : 'Login'} Error:`, err);
            setError(err.message || `An unexpected ${isSignup ? 'signup' : 'login'} error occurred.`);
        } finally {
            setLoading(false);
        }
    };

    const formTitle = isSignup ? 'Create Client Account' : (activeTab === 'client' ? 'Client Login' : 'Admin Login');
    const buttonText = isSignup ? 'Sign Up' : 'Login';
    const toggleText = isSignup ? 'Already have an account? Login' : "Don't have an account? Sign Up";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
            {/* Use the new Animated Home Button component */}
            <AnimatedHomeButton />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
            >
                {/* Logo and Tabs */}
                <div className="p-8 pb-0 text-center">
                    <img src="/Solvexstudios logo.png" alt="Solvex Logo" className="h-16 w-auto mx-auto mb-6" />
                    <div className="flex border-b">
                        <button
                            onClick={() => handleTabChange('client')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${activeTab === 'client' ? 'border-b-2 border-[#FF5722] text-[#FF5722]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            CLIENT PORTAL
                        </button>
                        <button
                            onClick={() => handleTabChange('admin')}
                            className={`flex-1 py-3 text-sm font-semibold transition-colors duration-200 ${activeTab === 'admin' ? 'border-b-2 border-gray-800 text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            ADMIN PANEL
                        </button>
                    </div>
                </div>

                {/* Form Area */}
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">{formTitle}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {isSignup && activeTab === 'client' && (
                                <motion.div
                                    key="fullName"
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
                        </AnimatePresence>

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
                            className={`w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${activeTab === 'client' ? 'bg-[#FF5722] hover:bg-[#E64A19]' : 'bg-gray-800 hover:bg-gray-700'}`}
                        >
                            {loading || authLoading ? <Loader2 className="animate-spin" /> : (isSignup ? <UserPlus size={18} /> : <LogIn size={18} />)}
                            {loading || authLoading ? 'Processing...' : buttonText}
                        </button>

                        {activeTab === 'client' && (
                            <button
                                type="button"
                                onClick={() => { setIsSignup(!isSignup); setError(null); }}
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

