import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#C10100] text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side: Logo and Social Icons */}
          <div className="flex flex-col items-center gap-4">
            <img
              src="https://i.imgur.com/MhcvKs3.png"
              alt="SolveX Studios Logo"
              className="h-7 md:h-10 filter brightness-0 invert"
            />

            {/* Social Icons Container with responsive styling */}
            <div className="bg-white md:bg-transparent rounded-lg p-3 md:p-0 text-[#C10100] md:text-white">
              <div className="flex items-center justify-center space-x-3 md:space-x-4">
                <a
                  href="https://linkedin.com/company/solvexstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.75 1.75 0 0 1 6.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.1 1.16 3.1 3.46z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/solvexstudios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.85-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44c0-.795-.645-1.44-1.441-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@solvexstudios?_t=ZN-8z9oTKokwBK&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="TikTok"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.6 5.82s.51.5 0 0A4.27 4.27 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.59 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 2.59-2.59c.42 0 .82.1 1.18.28V8.81a6.34 6.34 0 0 0-4.27-1.45A6.35 6.35 0 0 0 3 15.71a6.35 6.35 0 0 0 6.36 6.35 6.36 6.36 0 0 0 6.36-6.35V9.42c0-1.4.44-2.73 1.24-3.6z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/solvexstudios?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="X (formerly Twitter)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zm-1.8 20.35h2.839L4.498 2.65H1.465l15.636 18.853z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61579955124585&sk=about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@solvexstudios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="YouTube"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5 md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21.582 7.237A2.992 2.992 0 0 0 19.497 5.15C17.784 4.75 12 4.75 12 4.75s-5.784 0-7.497.401A2.992 2.992 0 0 0 2.418 7.237c-.41 1.714-.41 5.263-.41 5.263s0 3.549.41 5.263A2.992 2.992 0 0 0 4.503 19.85c1.713.401 7.497.401 7.497.401s5.784 0 7.497-.401a2.992 2.992 0 0 0 2.085-2.086c.41-1.714.41-5.263.41-5.263s0-3.549-.41-5.263zM9.996 15.002V9.502l4.522 2.75-4.522 2.75z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right side: Copyright and legal links */}
          <div className="text-center md:text-right">
            <p className="text-white/70 text-xs">
              &copy; {new Date().getFullYear()} SolveX Studios. All Rights
              Reserved.
            </p>
            <p className="text-white/70 text-xs mt-1">
              <Link to="/privacy" className="hover:underline">
                Privacy
              </Link>
              <span className="mx-2">|</span>
              <Link to="/terms" className="hover:underline">
                Terms
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;