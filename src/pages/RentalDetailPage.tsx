// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, User, Mail, Phone, Building, FileText, MapPin, Shield, Truck } from 'lucide-react';
import RentalBookingForm from '../../src/components/forms/RentalBookingForm';
import { getRentalEquipment } from '../lib/supabase/operations';
import type { RentalItemDisplay } from '../lib/supabase/operations'; // Use the correct mapped type

const RentalDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState<RentalItemDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Fetch data from Supabase and find by slug
  useEffect(() => {
    if (!slug) return;
    
    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      
      // Fetch all available equipment using the live function
      // NOTE: This fetches only available items due to RLS/function logic
      const { data, error: fetchError } = await getRentalEquipment(); 
      
      if (fetchError) {
        setError("Failed to load details. Check RLS policy.");
        setLoading(false);
        return;
      }
      
      if (data) {
        // Find equipment by slug (slug is typically a hyphenated version of the title)
        const foundEquipment = data.find(
          // Slugify the live title for comparison
          item => item.title.toLowerCase().replace(/\s/g, '-') === slug
        );
        
        if (foundEquipment) {
          setEquipment(foundEquipment);
        } else {
          // If not found, check if it exists in the *unavailable* list (for better error messaging)
          setError("This equipment is not available for rental or does not exist.");
          // No redirect: keep the user on the page with a clear error
        }
      }
      setLoading(false);
    };

    fetchEquipment();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5722]"></div>
      </div>
    );
  }
  
  if (error || !equipment) {
      return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold p-8">{error || "Equipment not found or is currently unavailable."}</div>;
  }

  // NOTE: Assuming the correct fields are mapped from DB: price -> price, description -> subtitle
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/rentals"
              className="flex items-center gap-2 text-gray-600 hover:text-[#FF5722] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Rentals</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{equipment.title}</h1>
              <p className="text-sm text-gray-600">{equipment.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Media */}
          <div className="space-y-6">
            {/* Video */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={equipment.videoUrl || ''}
                title={`${equipment.title} product video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">GHS {equipment.price}</p>
                  <p className="text-sm text-gray-600">per day</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {equipment.status}
                </span>
              </div>
              
              <button
                onClick={() => setShowBookingForm(true)}
                className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] transition-colors"
                disabled={equipment.status !== 'Available'}
              >
                Rent Now
              </button>
            </div>

            {/* Equipment Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Equipment Details</h3>
              <p className="text-gray-600 mb-6">{equipment.subtitle}</p>
              
              <h4 className="font-semibold text-gray-900 mb-4">Key Features</h4>
              <ul className="space-y-3">
                {(equipment.features || []).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rental Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rental Information</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#FF5722]" />
                  <span>Minimum rental period: 1 day</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#FF5722]" />
                  <span>Insurance coverage available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-[#FF5722]" />
                  <span>Delivery and pickup services available</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#FF5722]" />
                  <span>Professional support included</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Need Help Choosing?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Phone className="w-8 h-8 text-[#FF5722] mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Call Us</h4>
              <p className="text-gray-600 text-sm">Speak with our equipment specialists</p>
              <p className="text-[#FF5722] font-medium mt-1">+233 XX XXX XXXX</p>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 text-[#FF5722] mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
              <p className="text-gray-600 text-sm">Get detailed equipment information</p>
              <p className="text-[#FF5722] font-medium mt-1">rentals@solvexstudios.com</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 text-[#FF5722] mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Visit Us</h4>
              <p className="text-gray-600 text-sm">See equipment in person</p>
              <p className="text-[#FF5722] font-medium mt-1">Accra, Ghana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Booking Form Modal */}
      <RentalBookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        equipment={equipment}
      />
    </div>
  );
};

export default RentalDetailPage;