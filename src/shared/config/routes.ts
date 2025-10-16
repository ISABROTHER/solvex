export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  RENTALS: '/rentals',
  RENTAL_DETAIL: (id: string | number) => `/rentals/${id}`,
  COMPANIES: '/companies',
  CAREERS: '/careers',
  MANAGEMENT: '/management',
  PARTNERSHIPS: '/partnerships',
  CONTACT: '/contact',
  CART: '/cart',
  SUCCESS: '/success',

  ADMIN_DASHBOARD: '/admin',

  CLIENT_DASHBOARD: '/client',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_REQUESTS: '/client/requests',
  CLIENT_REQUESTS_NEW: '/client/requests/new',
  CLIENT_REQUEST_DETAIL: (id: string | number) => `/client/requests/${id}`,
} as const;
