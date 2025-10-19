// src/features/auth/index.ts

// Export the main provider component
export { default as AuthProvider } from './AuthProvider';

// Export the hook to access authentication state and functions
export { useAuth } from './AuthProvider';

// Export the route protection components
export { default as AdminRoute } from './AdminRoute';
export { default as ClientRoute } from './ClientRoute';

// Export the login page component (if intended to be imported via this index)
export { default as MyPage } from './MyPage';

// --- REMOVE ANY EXPORTS RELATED TO './useAuth' ---
// For example, remove lines like:
// export * from './useAuth'; // DELETE THIS LINE IF IT EXISTS
// export { default as useAuth } from './useAuth'; // DELETE THIS LINE IF IT EXISTS