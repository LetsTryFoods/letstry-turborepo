"use client";

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { useCart } from '@/lib/cart/use-cart';
import { useCoupons } from '@/lib/coupon/use-coupons';
import { useAddresses } from '@/lib/address/use-addresses';
import { CartService } from '@/lib/cart/cart-service';
import { CouponService } from '@/lib/coupon/coupon-service';
import { AddressService } from '@/lib/address/address-service';

import { CartDrawer } from './CartDrawer';
import { AddressFormData } from './AddressDetailsModal';
import { LoginModal } from '@/components/auth/login-modal';
import { useAnalytics } from '@/hooks/use-analytics';

export const CartContainer = () => {
  const { isOpen, closeCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { data: cartData, isLoading } = useCart();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const { data: addressesData } = useAddresses();
  const queryClient = useQueryClient();
  const { trackRemoveFromCart } = useAnalytics();
  
  React.useEffect(() => {
    console.log('CartContainer - user:', user);
    console.log('CartContainer - isAuthenticated:', isAuthenticated);
  }, [user, isAuthenticated]);
  
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);
  const [pendingAddressData, setPendingAddressData] = useState<AddressFormData | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const items = (cartData as any)?.myCart?.items?.map((item: any) => ({
    id: item.productId,
    image: item.imageUrl || 'https://placehold.co/100x100/png',
    title: item.name,
    size: item.attributes?.size || item.attributes?.weight || '',
    price: item.unitPrice,
    quantity: item.quantity,
  })) || [];

  const totalPrice = (cartData as any)?.myCart?.totalsSummary?.grandTotal || 0;
  const appliedCouponCode = (cartData as any)?.myCart?.couponCode || null;
  
  const coupons = (couponsData as any)?.activeCoupons || [];
  const addresses = (addressesData as any)?.myAddresses || [];
  
  const priceBreakdown = {
    subtotal: (cartData as any)?.myCart?.totalsSummary?.subtotal || 0,
    discountAmount: (cartData as any)?.myCart?.totalsSummary?.discountAmount || 0,
    shippingCost: (cartData as any)?.myCart?.totalsSummary?.shippingCost || 0,
    estimatedTax: (cartData as any)?.myCart?.totalsSummary?.estimatedTax || 0,
    handlingCharge: (cartData as any)?.myCart?.totalsSummary?.handlingCharge || 0,
    grandTotal: totalPrice,
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity === 0) {
        await CartService.removeFromCart(productId);
      } else {
        await CartService.updateCartItem(productId, quantity);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const item = items.find((i: any) => i.id === productId);
      
      await CartService.removeFromCart(productId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      if (item) {
        trackRemoveFromCart({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
        });
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleAddSuggestion = async (productId: string) => {
    try {
      await CartService.addToCart(productId, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    await CouponService.applyCoupon(code);
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const handleRemoveCoupon = async () => {
    await CouponService.removeCoupon();
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const handleSelectAddress = (addressId: string) => {
    const address = addresses.find((addr: any) => addr._id === addressId);
    if (address) {
      setSelectedAddress(address);
      setShowAddressModal(false);
    }
  };

  const handleSelectPlace = async (placeId: string, description: string) => {
    try {
      const placeDetails = await AddressService.getPlaceDetails(placeId);
      setSelectedPlaceData(placeDetails);
      setShowAddressDetailsModal(true);
    } catch (error) {
      console.error('Failed to get place details:', error);
    }
  };

  const handleSaveAddressDetails = async (details: AddressFormData) => {
    try {
      const placeDetails = (selectedPlaceData as any)?.getPlaceDetails;
      
      const addressInput = {
        addressType: details.addressType,
        recipientPhone: details.recipientPhone,
        recipientName: details.recipientName,
        buildingName: details.buildingName,
        floor: details.floor,
        streetArea: details.streetArea,
        landmark: details.landmark,
        addressLocality: placeDetails?.locality || '',
        addressRegion: placeDetails?.region || '',
        postalCode: placeDetails?.postalCode || '',
        addressCountry: placeDetails?.country || 'India',
        isDefault: false,
        latitude: placeDetails?.latitude || 0,
        longitude: placeDetails?.longitude || 0,
        formattedAddress: placeDetails?.formattedAddress || '',
        placeId: placeDetails?.placeId,
      };

      await AddressService.createAddress(addressInput);
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      
      // Fetch updated addresses and select the newly created one
      const updatedAddresses = await queryClient.fetchQuery({ queryKey: ['addresses'] });
      const newAddress = (updatedAddresses as any)?.myAddresses?.[0];
      if (newAddress) {
        setSelectedAddress(newAddress);
      }
      
      setSelectedPlaceData(null);
      setShowAddressModal(false);
      setShowAddressDetailsModal(false);
      setPendingAddressData(null);
      setPendingPhone('');
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const handlePhoneValidationFailed = (phone: string, formData: AddressFormData) => {
    setPendingPhone(phone);
    setPendingAddressData(formData);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAddressData) {
      handleSaveAddressDetails(pendingAddressData);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayNow = () => {
    if (!cartData || !(cartData as any)?.myCart?._id) {
      console.error('Cart not found');
      return;
    }
    setShowPaymentModal(true);
  };

  const suggestions: Array<{
    id: string;
    image: string;
    title: string;
    price: number;
  }> = [];

  if (isLoading) {
    return null;
  }

  // Extract user details from cart or address
  const userDetails = {
    email: (cartData as any)?.myCart?.userId?.email || 'guest@example.com', // Fallback or fetch from user profile
    name: selectedAddress?.recipientName || 'Guest',
    phone: selectedAddress?.recipientPhone || '9999999999',
  };

  return (
    <>
      <CartDrawer
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        suggestions={suggestions}
        totalPrice={totalPrice}
        priceBreakdown={priceBreakdown}
        showPriceDetails={showPriceDetails}
        onTogglePriceDetails={() => setShowPriceDetails(!showPriceDetails)}
        showCoupons={showCoupons}
        onToggleCoupons={() => setShowCoupons(!showCoupons)}
        showAddressModal={showAddressModal}
        onToggleAddressModal={() => setShowAddressModal(!showAddressModal)}
        showAddressDetailsModal={showAddressDetailsModal}
        onToggleAddressDetailsModal={() => setShowAddressDetailsModal(!showAddressDetailsModal)}
        addresses={addresses}
        onSelectAddress={handleSelectAddress}
        onSelectPlace={handleSelectPlace}
        onSaveAddressDetails={handleSaveAddressDetails}
        onPhoneValidationFailed={handlePhoneValidationFailed}
        coupons={coupons}
        appliedCouponCode={appliedCouponCode}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        couponsLoading={couponsLoading}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddSuggestion={handleAddSuggestion}
        selectedAddress={selectedAddress}
        onPayNow={handlePayNow}
        showPaymentModal={showPaymentModal}
        onTogglePaymentModal={() => setShowPaymentModal(!showPaymentModal)}
        cartId={(cartData as any)?.myCart?._id}
        amount={totalPrice.toString()}
        userDetails={userDetails}
        isAuthenticated={isAuthenticated}
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || ''}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};

