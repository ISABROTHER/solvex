// src/features/auth/index.ts

// Export the main provider component and hook FROM AuthProvider.tsx
export { AuthProvider, useAuth } from './AuthProvider';

// Export the route protection components
export { default as AdminRoute } from './AdminRoute';
export { default as ClientRoute } from './ClientRoute';

// Export the login page component
export { default as MyPage } from './MyPage';