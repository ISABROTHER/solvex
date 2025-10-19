// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
// ... other imports

// ... AuthState, LoginResult, AuthContextType interfaces ...

// --- CONTEXT CREATION ---
// Moved context creation here, kept internal to the provider file
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- CUSTOM HOOK ---
// Ensure this hook is defined and exported HERE
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

// --- PROVIDER COMPONENT ---
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   // ... state, useEffect, updateUserState, login, signup, clientLogin, adminLogin, logout ...

   const value = { /* ... auth state and functions ... */ };

   // Use the internally defined AuthContext
   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;