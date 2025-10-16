// @ts-nocheck
import React, { useState, useEffect } from "react";
import { ArrowRight, CircleCheck as CheckCircle, ShoppingCart, Loader as Loader2 } from "lucide-react";
import { getRentalEquipment } from "../lib/supabase/operations";
import type { RentalItemDisplay } from "../lib/supabase/operations";
import { supabase } from "../lib/supabase/client";
import { useCart } from "../contexts/CartContext";
import RentalDetailModal from "../components/RentalDetailModal";

const RentalsPage = () => {
  const [equipmentList, setEquipmentList] = useState<RentalItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRental, setSelectedRental] = useState<RentalItemDisplay | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      const { data, error: fetchError } = await getRentalEquipment();
      if (fetchError) {
        setError("Could not load equipment. Please try again later.");
        console.error("Fetch Error:", fetchError);
      } else {
        setEquipmentList(data || []);
      }
      setLoading(false);
    };

    fetchEquipment();

    const channel = supabase
      .channel('public:rental_gear')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_gear' }, () => {
        fetchEquipment();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleOpenDetails = (equipment: RentalItemDisplay) => {
    setSelectedRental(equipment);
  };
  
  const handleAddToCart = (equipment: RentalItemDisplay) => {
    // Cast to 'any' for now due to deep type structure inconsistency between old mock and new DB type
    addToCart(equipment as any); 
    setJustAdded(equipment.title);
    setTimeout(() => setJustAdded(null), 1500);
  };
  
  return (
    <>
      {/* Screen-reader announcement for add-to-cart */}
      <div className="sr-only" aria-live="polite">
        {justAdded ? `${justAdded} added to cart` : ''}
      </div>

      <section
        id="rentals"
        className="py-16 md:py-24 bg-white"
        aria-busy={loading ? "true" : "false"}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@700;800&family=Manrope:wght@700;800&display=swap');
          .animated-gradient-text { background-image: linear-gradient(90deg, #111 0%, #111 28%, #FF5722 50%, #111 72%, #111 100%); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: sheen-move 3s ease-in-out infinite; }
          @keyframes sheen-move { 0% { background-position: 200% 0; } 50% { background-position: 100% 0; } 100% { background-position: -200% 0; } }
          .heading-underline { position: absolute; left: 0; right: 0; height: 3px; bottom: -8px; border-radius: 9999px; background: linear-gradient(90deg, rgba(255,87,34,0) 0%, rgba(255,87,34,.85) 35%, rgba(255,87,34,.85) 65%, rgba(255,87,34,0) 100%); transform-origin: left; transform: scaleX(0); animation: underline-reveal 3s ease forwards 400ms; opacity: 0.95; }
          @keyframes underline-reveal { from { transform: scaleX(0); } to { transform: scaleX(1); } }

          /* Motion-safe micro-lift for cards (GPU accelerated) */
          @media (prefers-reduced-motion: no-preference) {
            .card { transition: transform 300ms, box-shadow 300ms; transform: translateZ(0); }
            .card:hover { transform: translateY(-2px); }
          }
        `}</style>

        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight" style={{ fontFamily: '"Inter Tight","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif' }}>
              <span className="animated-gradient-text relative inline-block">
                Professional Tools. Affordable Access.
                <span className="heading-underline" />
              </span>
            </h2>
            <p className="text-sm text-gray-600 mt-4 max-w-3xl mx-auto">
              We provide creators and SMEs with high-quality equipment at fair rates, so you can produce world-class content without compromise. Call us today and bring your production to life.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : equipmentList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No equipment is currently available for rent.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {equipmentList.map((product) => {
                const isAdded = justAdded === product.title;
                const isAvailable = product.status === 'Available'; 
                return (
                  <div
                    key={product.id} // Use ID as key now that data is live
                    onClick={() => handleOpenDetails(product)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenDetails(product);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="card bg-white rounded-2xl shadow-md overflow-hidden group flex flex-col cursor-pointer hover:shadow-2xl"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: '384px' }}
                  >
                    <div>
                      <img
                        src={product.images?.[0]}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        className="w-full h-48 object-contain bg-gray-50 will-change-transform transform-gpu"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                            aria-label={isAvailable ? 'Available' : 'Unavailable'}
                            title={isAvailable ? 'Available' : 'Unavailable'}
                          />
                          <p className="text-xs text-gray-500" title={`Category: ${product.category} • Price: GHS ${product.price}/day`}>
                            {product.category} • GHS {product.price}/day
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAvailable) handleAddToCart(product);
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 z-10 ${
                            isAdded ? 'bg-green-600 text-white'
                            : !isAvailable ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#FF5722] text-white hover:bg-[#E64A19]'
                          }`}
                          aria-disabled={!isAvailable || isAdded}
                          aria-label={
                            isAdded ? `${product.title} added to cart`
                            : !isAvailable ? `${product.title} unavailable`
                            : `Add ${product.title} to cart`
                          }
                          disabled={!isAvailable || isAdded}
                        >
                          {isAdded ? ( <><CheckCircle size={14} /> Added!</> )
                          : !isAvailable ? ( `Unavailable` )
                          : ( <><ShoppingCart size={14} /> Add to Cart</> )
                          }
                        </button>
                        
                        <div className="inline-flex items-center text-sm font-semibold text-[#FF5722]">
                          View Details
                          <ArrowRight className="ml-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ); 
              })}
            </div>
          )}
        </div>
      </section>

      <RentalDetailModal
        isOpen={!!selectedRental}
        onClose={() => setSelectedRental(null)}
        rental={selectedRental}
        anchorId={selectedRental ? `card-${selectedRental.title}` : null}
      />
    </>
  );
};

export default RentalsPage;