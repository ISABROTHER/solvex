// @ts-nocheck
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
} from "lucide-react";
import { businessServicesData } from "../data/business/services.data";
import { getRentalEquipment } from "../lib/supabase/operations";
import { BusinessService } from "../types/business.types";
import type { RentalItemDisplay } from "../lib/supabase/operations";

const useIntersectionObserver = (ref: React.RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref]);

  return [isVisible];
};

const useTypewriterEffect = (text: string, typingSpeed: number = 80) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsTypingComplete(true);
      return;
    }

    if (displayedText.length === text.length) {
      const completionTimer = setTimeout(() => setIsTypingComplete(true), 500);
      return () => clearTimeout(completionTimer);
    }

    const typingTimer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, typingSpeed);

    return () => clearTimeout(typingTimer);
  }, [displayedText, text, typingSpeed, prefersReducedMotion]);

  return { displayedText, isTypingComplete };
};

const HomePage = () => {
  const homeServicesRef = useRef(null);
  const rentalsRef = useRef(null);
  const navigate = useNavigate();
  const [rentalEquipmentData, setRentalEquipmentData] = useState<RentalItemDisplay[]>([]);

  const headlineText =
    "WITHOUT MARKETING, NO ONE SEES YOU.\nWITHOUT BRANDING, NO ONE TRUSTS YOU.";
  const { displayedText, isTypingComplete } = useTypewriterEffect(headlineText);

  const typedLines = displayedText.split("\n");

  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700;900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [isHomeServicesVisible] = useIntersectionObserver(homeServicesRef, {});
  const [isRentalsVisible] = useIntersectionObserver(rentalsRef, {});

  useEffect(() => {
    const fetchRentals = async () => {
      const { data } = await getRentalEquipment();
      if (data) setRentalEquipmentData(data.slice(0, 6));
    };
    fetchRentals();
  }, []);

  const getAnimationClass = (index: number) => {
    const pattern = index % 3;
    if (pattern === 0) return "animate-fade-in-left";
    if (pattern === 1) return "animate-slide-up";
    return "animate-fade-in-right";
  };

  const handleHomeServiceClick = (service: BusinessService) => {
    navigate("/services", { state: { selectedServiceTitle: service.title } });
  };

  const rentalCarouselRef = useRef<HTMLDivElement | null>(null);
  const [activeRentalIndex, setActiveRentalIndex] = useState(0);

  const handleRentalScroll = useCallback(() => {
    const el = rentalCarouselRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;

    const cardWidth = first.offsetWidth;
    const gap = 16;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    const clamped = Math.max(
      0,
      Math.min(idx, rentalEquipmentData.slice(0, 6).length - 1)
    );
    setActiveRentalIndex(clamped);
  }, []);

  const scrollRentalToIndex = (idx: number) => {
    const el = rentalCarouselRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (child) {
      const left = child.offsetLeft - 24;
      el.scrollTo({ left, behavior: "smooth" });
    }
  };

  const createSlug = (title: string) => title?.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '') || '';

  return (
    <div>
      <style>{`
        @keyframes blink { 50% { opacity: 0.25; } }
        .cursor-blink { animation: blink 1s step-end infinite; filter: drop-shadow(0 0 6px rgba(255,87,34,0.8)); }

        @keyframes aurora-sweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .neo-text {
          background-image: linear-gradient(90deg,
            #ffffff 0%,
            #FFD6C7 25%,
            #FF5722 50%,
            #FFD6C7 75%,
            #ffffff 100%
          );
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: aurora-sweep 8s ease-in-out infinite;
          text-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .glass-bar {
          backdrop-filter: blur(10px);
          background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        }

        .fx-softglow {
          filter: drop-shadow(0 2px 12px rgba(255,87,34,0.35));
        }
      `}</style>

      <section className="relative h-screen w-full flex items-center justify-center text-center text-white overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/solvex-fallback.jpg"
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://videos.pexels.com/video-files/7821854/7821854-hd_1920_1080_30fps.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/60"></div>

        <div className="pointer-events-none absolute inset-0"
             style={{
               background:
                 "radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.65) 60%)"
             }}
        />

        <div className="container mx-auto px-6 relative">
          <h1
            className="mx-auto max-w-[52rem] md:max-w-[66rem] text-center"
            style={{ fontFamily: "'Noto Sans', sans-serif" }}
          >
            {typedLines.map((line, idx) => (
              <span
                key={`typed-line-${idx}`}
                className={[
                  "block font-black uppercase leading-[1.05]",
                  "neo-text fx-softglow select-none",
                  "text-[clamp(1.75rem,5vw,4rem)] md:text-[clamp(3rem,5.5vw,4.5rem)]",
                  idx < typedLines.length - 1 ? "mb-2 md:mb-3" : ""
                ].join(" ")}
              >
                <span className="whitespace-normal">{line || "\u00A0"}</span>
              </span>
            ))}
            <span className="cursor-blink text-[#FF5722] inline-block align-top ml-1">|</span>
          </h1>

          <p
            className={`text-[clamp(0.95rem,2.4vw,1.35rem)] md:text-[clamp(1.1rem,2vw,1.5rem)] font-semibold text-gray-200 max-w-3xl md:max-w-4xl mx-auto mt-6 md:mt-8 transition-opacity duration-500 ${
              isTypingComplete ? "opacity-100 animate-fade" : "opacity-0"
            }`}
            style={{ animationDelay: "140ms" }}
          >
            YOUR BUSINESS NEEDS BOTH.
          </p>

          <div
            className={`glass-bar mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-4 px-4 py-3 md:px-6 md:py-4 rounded-2xl transition-opacity duration-500 ${
              isTypingComplete ? "opacity-100 animate-slide-up" : "opacity-0"
            }`}
            style={{ animationDelay: "260ms" }}
          >
            <Link
              to="/partner-program"
              className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-2.5 px-5 md:py-3 md:px-7 rounded-lg text-sm md:text-base transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(255,87,34,0.35)]"
            >
              Become Noticed
            </Link>
            <Link
              to="/contact"
              className="text-white/90 hover:text-white font-bold py-2.5 px-5 md:py-3 md:px-7 rounded-lg text-sm md:text-base transition duration-300 ease-in-out transform hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Book a Free Brand Audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={homeServicesRef}
        className="py-16 md:py-24 bg-gray-50 border-t border-gray-200 relative"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div
              className={`opacity-0 ${
                isHomeServicesVisible ? "animate-fade-in-left" : ""
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                Explore Our Expertise
              </h2>
              <div
                className={`h-1.5 bg-[#FF5722] mt-4 rounded-full opacity-0 ${
                  isHomeServicesVisible ? "animate-fade-in-right" : ""
                }`}
                style={{ animationDelay: "200ms", width: "6rem" }}
              />
            </div>
            <div
              className={`opacity-0 ${
                isHomeServicesVisible ? "animate-fade-in-right" : ""
              }`}
              style={{ animationDelay: "400ms" }}
            >
              <p className="text-lg text-gray-600">
                At SolveX Studios, we deliver solutions that grow businesses and
                brands. Every strategy we create addresses real challenges,
                increases sales, builds customer trust, and delivers lasting
                results
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businessServicesData.map((service, index) => {
              return (
                <div
                  key={service.title}
                  onClick={() =>
                    handleHomeServiceClick(service)
                  }
                  className={`group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 opacity-0 ${
                    isHomeServicesVisible ? getAnimationClass(index) : ""
                  }`}
                  style={{
                    animationDelay: isHomeServicesVisible
                      ? `${index * 150}ms`
                      : "0ms",
                  }}
                >
                  <img
                    src={service.imageUrl}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-all duration-300 group-hover:from-black/90"></div>
                  <div className="relative h-80 p-8 flex flex-col justify-end text-white">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                      <h3 className="text-2xl font-bold">
                        {service.title}
                      </h3>
                      <p
                        className={`mt-2 text-sm text-white/80 overflow-hidden opacity-0 ${
                          isHomeServicesVisible ? "animate-reveal-text" : ""
                        }`}
                        style={{
                          animationDelay: isHomeServicesVisible
                            ? `${index * 150 + 400}ms`
                            : "0ms",
                        }}
                      >
                        {service.summary.substring(0, 100)}
                        {service.summary.length > 100 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-8 right-8 flex items-center gap-2 text-white text-sm font-semibold opacity-0 ${
                      isHomeServicesVisible ? "animate-pulse-fade-in" : ""
                    }`}
                    style={{
                      animationDelay: isHomeServicesVisible
                        ? `${index * 150 + 800}ms`
                        : "0ms",
                    }}
                  >
                    <span className="hidden lg:inline">See More</span>
                    <div className="bg-white/20 group-hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-colors">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        ref={rentalsRef}
        className="py-16 md:py-24 bg-gray-50 border-t border-gray-200 relative"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div
              className={`opacity-0 ${
                isRentalsVisible ? "animate-fade-in-left" : ""
              }`}
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                Featured Rentals
              </h2>
              <div className="h-1.5 bg-[#FF5722] mt-4 rounded-full w-24"></div>
            </div>
            <Link
              to="/rentals"
              className={`text-[#FF5722] font-bold flex items-center gap-2 transition-opacity duration-500 opacity-0 ${
                isRentalsVisible ? "animate-fade" : ""
              }`}
              style={{ animationDelay: "300ms" }}
            >
              <span>See all rentals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:hidden relative">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-50 to-transparent" />

            <div
              ref={rentalCarouselRef}
              onScroll={handleRentalScroll}
              className={`flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 -mx-6 pb-2 opacity-0 ${
                isRentalsVisible ? "animate-slide-up" : ""
              }`}
              style={{
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch" as any,
              }}
            >
              {rentalEquipmentData.slice(0, 6).map((rental) => (
                <div key={rental.id} className="snap-center shrink-0 w-[82%]">
                  <Link
                    to={`/rentals/${createSlug(rental.name)}`}
                    className="group relative rounded-xl overflow-hidden shadow-md cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
                  >
                    <img
                      src={rental.image_url}
                      alt={rental.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="relative h-64 p-4 flex flex-col justify-end text-white">
                      <h3 className="text-base font-bold">{rental.name}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {rentalEquipmentData.slice(0, 6).map((_, i) => (
                <button
                  key={`rental-dot-${i}`}
                  aria-label={`Go to rental ${i + 1}`}
                  onClick={() => scrollRentalToIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeRentalIndex ? "w-6 bg-[#FF5722]" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
            {rentalEquipmentData.slice(0, 6).map((rental, index) => (
              <Link
                to={`/rentals/${createSlug(rental.name)}`}
                key={rental.id}
                className={`group relative rounded-xl overflow-hidden shadow-md cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 opacity-0 ${
                  isRentalsVisible ? "animate-slide-up" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={rental.image_url}
                  alt={rental.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="relative h-64 p-4 flex flex-col justify-end text-white">
                  <h3 className="text-base font-bold">{rental.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
