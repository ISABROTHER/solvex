// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, CircleCheck as CheckCircle, Loader2 } from "lucide-react";
import { getServices, Service } from "../lib/supabase/operations";
import { supabase } from "../lib/supabase/client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const useIntersectionObserver = (ref: React.RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true);
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => { if (element) observer.unobserve(element); };
  }, [ref]);
  return [isVisible];
};

const ServicesPage = () => {
  const location = useLocation();
  // --- RECONNECT TO SUPABASE ---
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  // --- END RECONNECT ---
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const backBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isServicesVisible] = useIntersectionObserver(servicesRef);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchLiveServices = async () => {
      setLoading(true);
      const { data, error } = await getServices();
      if (error) {
        console.error("Failed to fetch services:", error);
        setServices([]);
      } else {
        const publishedServices = data?.filter(s => s.status === 'published') || [];
        setServices(publishedServices);
      }
      setLoading(false);
    };

    fetchLiveServices();

    const channel = supabase
      .channel('public:services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchLiveServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Manrope:wght@700;800&display=swap');
      .animated-gradient-text { background-image: linear-gradient(90deg, #111 0%, #111 28%, #FF5722 50%, #111 72%, #111 100%); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: sheen-move 3s ease-in-out infinite; }
      @keyframes sheen-move { 0% { background-position: 200% 0; } 50% { background-position: 100% 0; } 100% { background-position: -200% 0; } }
      .heading-underline { position: absolute; left: 0; right: 0; height: 3px; bottom: -8px; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,87,34,0) 0%, rgba(255,87,34,.85) 35%, rgba(255,87,34,.85) 65%, rgba(255,87,34,0) 100%); transform-origin: left; transform: scaleX(0); animation: underline-reveal 3s ease forwards 400ms; opacity: 0.95; }
      @keyframes underline-reveal { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    `;
    style.id = `animated-headings-${Date.now()}`;
    document.head.appendChild(style);
    return () => {
      const styleElement = document.getElementById(style.id);
      if (styleElement) document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (location.state?.selectedServiceTitle) {
      const service = services.find(s => s.title === location.state.selectedServiceTitle);
      if (service) setSelectedService(service);
    }
  }, [location.state, services]);

  useEffect(() => {
    if (selectedService) {
      servicesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      backBtnRef.current?.focus();
    }
  }, [selectedService]);

  const spring = { type: "spring", stiffness: 260, damping: 24, mass: 0.6 };
  const listVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: prefersReducedMotion ? { duration: 0 } : { staggerChildren: 0.08 } } };
  const itemVariants = {
    hidden: prefersReducedMotion ? {} : { opacity: 0, y: 16 },
    show: prefersReducedMotion ? {} : { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.65, 0.3, 1] } },
    hover: prefersReducedMotion ? {} : { y: -4, transition: { type: "spring", stiffness: 420, damping: 24 } },
  };

  return (
    <section ref={servicesRef as any} id="services" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          {!selectedService ? (
            <motion.div key="list" initial="hidden" animate={isServicesVisible ? "show" : "hidden"} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: '"Inter Tight","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}>
                  <span className="animated-gradient-text relative inline-block">Our Services<span className="heading-underline" /></span>
                </h2>
                <p className="text-sm text-gray-600 mt-4 max-w-3xl mx-auto">We deliver growth solutions. Every offering is designed to solve a real problem businesses face in Ghana today.</p>
              </div>

              {/* --- ROBUST LOADING & EMPTY STATES --- */}
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
              ) : services.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No services are available at the moment.</p>
                    <p className="mt-2">Please check back later!</p>
                </div>
              ) : (
                <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" variants={listVariants}>
                  {services.map((service) => (
                    <motion.div key={service.id} className="group relative bg-white rounded-2xl shadow-md overflow-hidden ring-1 ring-gray-100 hover:ring-[#FF5722]/30 cursor-pointer" variants={itemVariants} whileHover="hover" layout transition={spring} onClick={() => setSelectedService(service)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedService(service); }} layoutId={`card-${service.id}`}>
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5722] to-transparent opacity-60" />
                      <span className="pointer-events-none absolute inset-0 card-sheen" />
                      <motion.div className="overflow-hidden" layoutId={`image-${service.id}`}>
                        <motion.img className="w-full h-48" src={service.image_url || ''} alt={service.title} style={{ objectFit: (service.image_fit || 'cover') as any, objectPosition: service.image_position || 'center', transform: `rotate(${service.image_rotation || 0}deg)` }} loading="lazy" whileHover={prefersReducedMotion ? {} : { scale: 1.04 }} transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }} />
                      </motion.div>
                      <div className="absolute -top-5 right-4"><div className="rounded-full bg-white/90 backdrop-blur px-3 py-2 shadow ring-1 ring-gray-200 transition-transform duration-300 group-hover:-translate-y-1"><CheckCircle className="w-5 h-5 text-[#FF5722]" /></div></div>
                      <div className="p-6">
                        <h3 className={`text-xl font-bold ${service.title_color} underline-sweep`}>{service.title}</h3>
                        <p className="text-gray-600 mt-2 text-base transition-colors duration-300 group-hover:text-gray-700">{service.summary}</p>
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"><span className="h-1.5 w-1.5 rounded-full bg-[#FF5722] animate-pulse" /><span>Tap to view details</span></div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="motion-reduce:transition-none">
              <div className="max-w-4xl mx-auto">
                <button ref={backBtnRef} onClick={() => setSelectedService(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black mb-8 transition-colors"><ArrowLeft className="w-4 h-4" />Back to all services</button>
                <motion.div layoutId={`card-${selectedService.id}`} layout transition={spring} className="bg-white rounded-2xl shadow-md ring-1 ring-gray-100">
                  <motion.div layoutId={`image-${selectedService.id}`} className="overflow-hidden rounded-t-2xl">
                    <img className="w-full h-56" src={selectedService.image_url || ''} alt={selectedService.title} style={{ objectFit: (selectedService.image_fit || 'cover') as any, objectPosition: selectedService.image_position || 'center', transform: `rotate(${selectedService.image_rotation || 0}deg)` }} />
                  </motion.div>
                  <div className="p-6">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{selectedService.title}</h2>
                    <p className="text-base text-gray-600 mb-8 leading-relaxed whitespace-pre-line">{selectedService.description}</p>
                    <div className="border-t pt-8">
                      <h3 className="text-xl font-bold mb-4">We help you:</h3>
                      <ul className="space-y-4">
                        {(selectedService.sub_services || []).map((sub, index) => (
                          <li key={index} className="flex items-start"><CheckCircle className="w-5 h-5 text-[#FF5722] mr-3 flex-shrink-0 mt-0.5" /><p className="text-sm text-gray-700">{sub}</p></li>
                        ))}
                      </ul>
                      <div className="mt-8 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 p-[1px]"><div className="bg-white rounded-[11px] p-6 shadow-sm"><h4 className="font-bold text-gray-800">Outcome:</h4><p className="text-sm text-gray-600 mt-2">{selectedService.outcome}</p></div></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        .underline-sweep { position: relative; }
        .underline-sweep::after { content: ""; position: absolute; left: 0; bottom: -6px; height: 2px; width: 0%; background: linear-gradient(90deg, #ff8a50, #FF5722 40%, #ff8a50); transition: width 300ms ease; border-radius: 999px; }
        .group:hover .underline-sweep::after { width: 100%; }
        .card-sheen { background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.5) 40%, rgba(255, 255, 255, 0) 60%, transparent 100%); transform: translateX(-110%); transition: transform 800ms ease; will-change: transform; }
        .group:hover .card-sheen { transform: translateX(110%); }
      `}</style>
    </section>
  );
};

export default ServicesPage;