import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useSearchPlaces } from '@/lib/address/use-search-places';

interface Address {
  _id: string;
  addressType: string;
  formattedAddress: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  onSelectAddress: (addressId: string) => void;
  onSelectPlace: (placeId: string, description: string) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addresses,
  onSelectAddress,
  onSelectPlace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading } = useSearchPlaces(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePlaceSelect = (placeId: string, description: string) => {
    onSelectPlace(placeId, description);
    setSearchQuery('');
    onClose();
  };

  const handleAddressSelect = (addressId: string) => {
    onSelectAddress(addressId);
    onClose();
  };

  const showSearchResults = searchQuery.length > 2;
  const places = (searchResults as any)?.searchPlaces || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-[#0F4A6A]">Add Location</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search a new address"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent text-gray-700 placeholder-gray-400"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-[#0F4A6A] animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {showSearchResults && places.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[#0F4A6A] mb-3">Search Results</h3>
                  <div className="space-y-2">
                    {places.map((place: any) => (
                      <button
                        key={place.placeId}
                        onClick={() => handlePlaceSelect(place.placeId, place.description)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#0F4A6A] hover:bg-[#0F4A6A]/5 transition-all group flex items-start gap-3"
                      >
                        <MapPin className="w-5 h-5 text-gray-400 group-hover:text-[#0F4A6A] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 mb-1 group-hover:text-[#0F4A6A]">
                            {place.mainText}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {place.secondaryText}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!showSearchResults && addresses.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#0F4A6A] mb-3">Saved addresses</h3>
                  <div className="space-y-2">
                    {addresses.map((addr) => (
                      <button
                        key={addr._id}
                        onClick={() => handleAddressSelect(addr._id)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#0F4A6A] hover:bg-[#0F4A6A]/5 transition-all group"
                      >
                        <div className="font-semibold text-gray-900 mb-1 group-hover:text-[#0F4A6A]">
                          {addr.addressType}
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {addr.formattedAddress}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!showSearchResults && addresses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No saved addresses yet
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
