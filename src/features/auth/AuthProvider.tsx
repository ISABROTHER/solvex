// src/features/auth/AuthProvider.tsx
// ... (imports and context creation) ...

// useAuth hook remains the same
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

// AuthProvider component remains the same
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... (state, useEffect, functions) ...

  const value = { /* ... */ };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// REMOVE THIS EXPORT:
// export { AuthContext };

export default AuthProvider; // Only default export the provider