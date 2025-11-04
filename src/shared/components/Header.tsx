import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const handleMyPageClick = () => {
    setMobileMenuOpen(false);
    navigate('/my-page');
  };
  
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      document.head.removeChild(link);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
  };
  
  const handleNavLinkClick = () => {
    closeAllMenus();
  };

  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  // --- "ABOUT US" REMOVED FROM NAV ITEMS ---
  const navItems = [
    { name: "SERVICES", href: "/services" },
    { name: "OUR GEAR", href: "/rentals" },
    { name: "CAREERS", href: "/careers" },
  ];
  
  return (
    <>
      <style>{`
        .safe-padding-top { padding-top: env(safe-area-inset-top); }
        .menu-item {
          transition: opacity 300ms ease-out, transform 300ms ease-out;
          opacity: 0;
          transform: translateY(-10px);
        }
        .menu-open .menu-item { opacity: 1; transform: translateY(0); }
      `}</style>

      <header className="sticky top-0 z-30 header-shadow relative bg-[#FEF9EE]">
        <div className="relative container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" onClick={closeAllMenus} className="flex items-center gap-2">
            <img src="https://i.imgur.com/eioVNZq.png" alt="Partner Logo" className="h-10" />
            <img src="https://i.imgur.com/gFykwom.png" alt="SolveX Studios Logo" className="h-10 block md:hidden" />
            <img src="https://i.imgur.com/5BH7zsq.png" alt="SolveX Studios Logo" className="h-10 hidden md:block" />
          </Link>
          <nav className="hidden md:flex space-x-4 items-center text-[#C10100]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <Link to="/services" onClick={handleNavLinkClick} className={`px-3 py-2 rounded-md hover:bg-[#C10100]/10 transition-colors duration-300 tracking-wider text-lg`}>SERVICES</Link>
            <Link to="/rentals" onClick={handleNavLinkClick} className={`px-3 py-2 rounded-md hover:bg-[#C10100]/10 transition-colors duration-300 tracking-wider text-lg`}>OUR GEAR</Link>
            <Link to="/careers" onClick={handleNavLinkClick} className={`px-3 py-2 rounded-md hover:bg-[#C10100]/10 transition-colors duration-300 tracking-wider text-lg`}>CAREERS</Link>

            {/* --- "ABOUT US" DROPDOWN REMOVED --- */}

            <button
              onClick={handleMyPageClick}
              className="ml-4 border border-[#C10100] text-[#C10100] hover:bg-[#C10100] hover:text-white font-bold py-2 px-4 rounded-lg text-base transition-colors"
            >
              MY PAGE
            </button>
          </nav>
          <button ref={toggleButtonRef} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 -mr-2 rounded-full">
            <div className="relative w-6 h-6">{isMobileMenuOpen ? <X className="text-[#C10100]" /> : <Menu className="text-[#C10100]" />}</div>
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? "" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}`} onClick={closeAllMenus}></div>
        <div id="mobile-menu-panel" ref={menuRef} role="dialog" aria-modal="true" className={`absolute top-0 left-0 w-full transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"} ${isMobileMenuOpen ? "menu-open" : ""} bg-white border-b border-gray-200 shadow-2xl`}>
          <div className="safe-padding-top">
            <div className="container mx-auto px-6 pt-20 pb-8">
              <nav className="flex flex-col text-[#C10100]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <div key={item.name} className="menu-item border-b border-gray-900/10" style={{ transitionDelay: prefersReducedMotion ? "0ms" : `${100 + index * 40}ms` }}>
                      <Link to={item.href!} onClick={handleNavLinkClick} className={`relative block py-4 px-3 text-xl tracking-wider rounded-md hover:bg-[#C10100]/10 ${isActive ? "font-bold" : ""}`}>
                        {isActive && (<span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-[#C10100]/60 rounded-r-full"></span>)}
                        {item.name}
                      </Link> 
                    </div>
                  );
                })}
                <button
                  onClick={handleMyPageClick}
                  className="block mt-4 w-full border border-[#C10100] text-[#C10100] hover:bg-[#C10100] hover:text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                >
                  MY PAGE
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;