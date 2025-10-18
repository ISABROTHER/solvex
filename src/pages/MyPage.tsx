// Example: src/pages/SignupPage.tsx (Conceptual)
import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Added full name
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signup(email, password, fullName); // Pass full name
            // Navigate to a page telling them to check email or login
            navigate('/check-email'); // Or back to login '/my-page'
        } catch (err: any) {
            setError(err.message || 'Signup failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <h2>Sign Up</h2>
            {/* Input for Full Name */}
            <div>
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
             {/* Input for Email */}
             <div>
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
             {/* Input for Password */}
             <div>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default SignupPage;