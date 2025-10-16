import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { CountryCodeData } from '../../data/forms/country-codes.data';

interface CountryDropdownProps {
  countries: CountryCodeData[];
  selectedCountry: CountryCodeData | null;
  onSelect: (country: CountryCodeData) => void;
  className?: string;
}

/**
 * Custom country dropdown component with dynamic sizing
 * Closed state: Shows only flag with perfect fit
 * Open state: Shows flag, name, and code for all options
 */
const CountryDropdown: React.FC<CountryDropdownProps> = ({
  countries,
  selectedCountry,
  onSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [flagDimensions, setFlagDimensions] = useState({ width: 20, height: 15 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const flagRef = useRef<HTMLImageElement>(null);

  // Calculate flag dimensions dynamically when flag loads
  useEffect(() => {
    if (flagRef.current && selectedCountry) {
      const img = new Image();
      img.onload = () => {
        // Use actual flag dimensions for perfect fit
        const height = 16; // Slightly larger base height for better visibility
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const width = Math.round(height * aspectRatio);
        
        setFlagDimensions({ width, height });
      };
      img.src = `https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`;
    }
  }, [selectedCountry]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleCountrySelect = (country: CountryCodeData) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef}
      className={`relative ${className}`}
    >
      {/* Closed State Button - Dynamically sized to flag */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`relative border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] bg-gray-50 hover:bg-gray-100 transition-colors ${
          // Apply error styling if needed
          className.includes('border-red-500') ? 'border-red-500' : 'border-gray-300'
        }`}
        style={{
          // Dynamic sizing based on flag dimensions with minimal padding
          width: `${flagDimensions.width + 16}px`, // flag width + 8px padding each side
          height: '42px', // Match input height
          minWidth: '40px' // Ensure minimum clickable area
        }}
        aria-label={selectedCountry ? `Selected country: ${selectedCountry.name}` : 'Select country'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Flag container with perfect centering */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            // Ensure flag is perfectly centered regardless of container size
            padding: '8px'
          }}
        >
          {selectedCountry && (
            <img
              ref={flagRef}
              src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
              alt={`${selectedCountry.name} flag`}
              className="object-contain"
              style={{
                width: `${flagDimensions.width}px`,
                height: `${flagDimensions.height}px`,
              }}
              loading="lazy"
            />
          )}
        </div>

        {/* Dropdown indicator - positioned absolutely to not affect sizing */}
        <ChevronDown 
          className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ pointerEvents: 'none' }}
        />
      </button>

      {/* Open State Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-[240px]">
          <div 
            role="listbox"
            aria-label="Country selection"
            className="py-1"
          >
            {countries.map((country) => (
              <button
                key={country.iso}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-3 transition-colors ${
                  selectedCountry?.iso === country.iso ? 'bg-[#FF5722]/10 text-[#FF5722]' : 'text-gray-900'
                }`}
                role="option"
                aria-selected={selectedCountry?.iso === country.iso}
              >
                {/* Flag with consistent sizing */}
                <img
                  src={`https://flagcdn.com/w20/${country.iso.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  className="flex-shrink-0"
                  style={{
                    width: '24px',
                    height: '18px',
                    objectFit: 'contain'
                  }}
                  loading="lazy"
                />
                
                {/* Country info with proper spacing */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate leading-tight">
                    {country.name}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {country.code}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryDropdown;