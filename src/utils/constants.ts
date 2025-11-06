/**
 * Application constants and configuration values
 */

// Animation delays and durations
export const ANIMATION_DELAYS = {
  STAGGER_DELAY: 120,
  TYPEWRITER_SPEED: 80,
  FADE_DURATION: 1000,
  SLIDE_DURATION: 800,
} as const;

// Form constraints
export const FORM_CONSTRAINTS = {
  MAX_WORD_COUNT: 100,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.txt'],
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280,
} as const;

// Company information
export const COMPANY_INFO = {
  NAME: 'SolveX Studios',
  TAGLINE: 'Innovating Brands. Driving Growth.',
  EMAIL: 'hello@solvexstudios.com',
  PHONE: '+233 XX XXX XXXX',
  ADDRESS: 'Accra, Ghana',
} as const;

// Social media links
export const SOCIAL_LINKS = {
  LINKEDIN: 'https://linkedin.com/company/solvexstudios',
  INSTAGRAM: 'https://instagram.com/solvexstudios/',
  TIKTOK: 'https://www.tiktok.com/@solvexstudios?_t=ZN-8z9oTKokwBK&_r=1',
  TWITTER: 'https://x.com/solvexstudios?s=21',
  FACEBOOK: 'https://www.facebook.com/profile.php?id=61579955124585&sk=about',
  YOUTUBE: 'https://youtube.com/@solvexstudios',
} as const;

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#FF5722',
  PRIMARY_HOVER: '#E64A19',
  SECONDARY: '#C10100',
  BACKGROUND: '#FEF9EE',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
} as const;