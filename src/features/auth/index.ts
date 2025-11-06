// src/features/auth/index.ts

// Export the main provider component FROM AuthProvider.tsx
export { default as AuthProvider } from './AuthProvider';

// Export the hook FROM AuthProvider.tsx
export { useAuth } from './AuthProvider';

// Export the route protection components
export { default as AdminRoute } from './AdminRoute';
export { default as ClientRoute } from './ClientRoute';
export { default as EmployeeRoute } from './EmployeeRoute';

// Export the login page component
export { default as MyPage } from './MyPage';

// --- ENSURE NO LINES REFERENCE './useAuth' ---
// DELETE lines like: export * from './useAuth';