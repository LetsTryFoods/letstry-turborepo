"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCart } from "@/lib/cart/use-cart";
import { useCoupons } from "@/lib/coupon/use-coupons";
import { useAddresses } from "@/lib/address/use-addresses";
import { CartService } from "@/lib/cart/cart-service";
import { CouponService } from "@/lib/coupon/coupon-service";
import { AddressService } from "@/lib/address/address-service";

import { CartDrawer } from "./CartDrawer";
import { AddressFormData } from "./AddressDetailsModal";
import { LoginModal } from "@/components/auth/login-modal";
import { useAnalytics } from "@/hooks/use-analytics";
import { mpTrack } from "@/lib/analytics/mixpanel";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { CHECK_PINCODE_SERVICEABILITY } from "@/lib/queries/pincode";
import toast from "react-hot-toast";

export const CartContainer = () => {
  const { isOpen, closeCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { data: cartData, isLoading } = useCart();
  const { data: couponsData, isLoading: couponsLoading } = useCoupons();
  const { data: addressesData } = useAddresses();
  const queryClient = useQueryClient();
  const {
    trackRemoveFromCart,
    trackBeginCheckout,
    trackAddToCart,
    trackViewCart,
    trackAddShippingInfo,
    trackPaymentInitiated,
    trackCouponApplied,
    trackCouponRemoved,
  } = useAnalytics();
  const wasOpenRef = useRef(false);

  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddressDetailsModal, setShowAddressDetailsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPlaceData, setSelectedPlaceData] = useState<any>(null);
  const [pendingAddressData, setPendingAddressData] =
    useState<AddressFormData | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const items =
    (cartData as any)?.myCart?.items?.map((item: any) => ({
      id: item.productId,
      image: item.imageUrl || "https://placehold.co/100x100/png",
      title: item.name,
      size:
        item.packageSize ||
        item.attributes?.size ||
        item.attributes?.weight ||
        "",
      price: item.unitPrice,
      quantity: item.quantity,
      variant:
        item.packageSize ||
        item.attributes?.size ||
        item.attributes?.weight ||
        "",
      isUpdating: updatingItems.has(item.productId),
    })) || [];

  const totalPrice = (cartData as any)?.myCart?.totalsSummary?.grandTotal || 0;
  const appliedCouponCode = (cartData as any)?.myCart?.couponCode || null;

  const coupons = (couponsData as any)?.activeCoupons || [];
  const addresses = (addressesData as any)?.myAddresses || [];

  const priceBreakdown = {
    subtotal: (cartData as any)?.myCart?.totalsSummary?.subtotal || 0,
    discountAmount:
      (cartData as any)?.myCart?.totalsSummary?.discountAmount || 0,
    shippingCost: (cartData as any)?.myCart?.totalsSummary?.shippingCost || 0,
    estimatedTax: (cartData as any)?.myCart?.totalsSummary?.estimatedTax || 0,
    handlingCharge:
      (cartData as any)?.myCart?.totalsSummary?.handlingCharge || 0,
    freeDeliveryThreshold:
      (cartData as any)?.myCart?.totalsSummary?.freeDeliveryThreshold || 499,
    grandTotal: totalPrice,
  };

  useEffect(() => {
    if (isOpen && !wasOpenRef.current && items.length > 0) {
      trackViewCart({
        value: totalPrice,
        items: items.map((item: any) => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
        })),
      });
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const shippingAddressId = (cartData as any)?.myCart?.shippingAddressId;
  useEffect(() => {
    if (shippingAddressId && addresses.length > 0) {
      const addr = addresses.find((a: any) => a._id === shippingAddressId);
      if (addr) setSelectedAddress(addr);
    }
  }, [shippingAddressId, addresses]);

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const item = items.find((i: any) => i.id === productId);
      const oldQuantity = item?.quantity || 0;

      if (quantity === 0) {
        await CartService.removeFromCart(productId);

        if (item) {
          trackRemoveFromCart({
            id: item.id,
            name: item.title,
            price: item.price,
            quantity: oldQuantity,
            variant: item.variant,
          });
        }
      } else {
        await CartService.updateCartItem(productId, quantity);

        if (item) {
          if (quantity < oldQuantity) {
            trackRemoveFromCart({
              id: item.id,
              name: item.title,
              price: item.price,
              quantity: oldQuantity - quantity,
              variant: item.variant,
            });
          } else if (quantity > oldQuantity) {
            trackAddToCart({
              id: item.id,
              name: item.title,
              price: item.price,
              quantity: quantity - oldQuantity,
              variant: item.variant,
            });
          }
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const item = items.find((i: any) => i.id === productId);

      await CartService.removeFromCart(productId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      if (item) {
        trackRemoveFromCart({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant,
        });
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleAddSuggestion = async (productId: string) => {
    try {
      await CartService.addToCart(productId, 1);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    await CouponService.applyCoupon(code);
    queryClient.invalidateQueries({ queryKey: ["cart"] });

    trackCouponApplied({
      coupon_code: code,
      cart_value: totalPrice,
    });
  };

  const handleRemoveCoupon = async () => {
    const removedCouponCode = appliedCouponCode;
    await CouponService.removeCoupon();
    queryClient.invalidateQueries({ queryKey: ["cart"] });

    if (removedCouponCode) {
      trackCouponRemoved({
        coupon_code: removedCouponCode,
        cart_value: totalPrice,
      });
    }
  };

  const fireAddShippingInfo = (address: any) => {
    if (items.length === 0) return;
    trackAddShippingInfo({
      value: totalPrice,
      shippingTier: address?.city || address?.addressType || "default",
      items: items.map((item: any) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
      })),
    });
  };

  const handleSelectAddress = async (addressId: string) => {
    const address = addresses.find((addr: any) => addr._id === addressId);
    if (address) {
      try {
        await CartService.setShippingAddress(addressId);
        await queryClient.invalidateQueries({ queryKey: ["cart"] });

        setSelectedAddress(address);
        setShowAddressModal(false);
        fireAddShippingInfo(address);
      } catch (error) {
        console.error("Failed to set shipping address:", error);
      }
    }
  };

  const handleSelectPlace = async (placeId: string, description: string) => {
    try {
      const placeDetails = await AddressService.getPlaceDetails(placeId);
      setSelectedPlaceData(placeDetails);
      setShowAddressDetailsModal(true);
    } catch (error) {
      console.error("Failed to get place details:", error);
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
        addressLocality: placeDetails?.locality || "",
        addressRegion: placeDetails?.region || "",
        postalCode: (
          details.postalCode ||
          placeDetails?.postalCode ||
          ""
        ).trim(),
        googlePostalCode: (placeDetails?.postalCode || "").trim(), // Google-detected pincode kept separately
        addressCountry: placeDetails?.country || "India",
        isDefault: false,
        latitude: placeDetails?.latitude || 0,
        longitude: placeDetails?.longitude || 0,
        formattedAddress: placeDetails?.formattedAddress || "",
        placeId: placeDetails?.placeId,
      };

      const result = await AddressService.createAddress(addressInput);
      const newAddressId = (result as any)?.createAddress?._id;

      if (newAddressId) {
        // Set the shipping address on the cart immediately
        await CartService.setShippingAddress(newAddressId);

        // Build the address object right from what we already know — no cache race conditions.
        const immediateAddress = {
          _id: newAddressId,
          addressType: addressInput.addressType,
          recipientName: addressInput.recipientName,
          recipientPhone: addressInput.recipientPhone,
          buildingName: addressInput.buildingName,
          floor: addressInput.floor,
          streetArea: addressInput.streetArea,
          landmark: addressInput.landmark,
          formattedAddress: addressInput.formattedAddress,
          postalCode: addressInput.postalCode,
          googlePostalCode: addressInput.googlePostalCode,
          city: addressInput.addressLocality,
        };

        // Auto-select the new address immediately — no extra click needed.
        setSelectedAddress(immediateAddress);
        fireAddShippingInfo(immediateAddress);

        // Refresh the cache in the background so the address list stays up to date.
        queryClient.invalidateQueries({ queryKey: ["addresses"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }

      setSelectedPlaceData(null);
      setShowAddressModal(false);
      setShowAddressDetailsModal(false);
      setPendingAddressData(null);
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAddressData) {
      handleSaveAddressDetails(pendingAddressData);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayNow = async () => {
    if (!cartData || !(cartData as any)?.myCart?._id) {
      console.error("Cart not found");
      return;
    }

    // Collect both pincodes — user-typed (postalCode) and Google-detected (googlePostalCode).
    // Deduplicate and filter blanks so we don't make the same call twice.
    const pincodesToCheck = [
      ...new Set(
        [selectedAddress?.postalCode, selectedAddress?.googlePostalCode]
          .map((p) => (p || "").trim())
          .filter((p) => /^\d{6}$/.test(p)),
      ),
    ];

    if (pincodesToCheck.length > 0) {
      try {
        // Check each pincode against B2C Smart Express — allow if ANY ONE is deliverable.
        let isAnyDeliverable = false;
        for (const pincode of pincodesToCheck) {
          const result: any = await graphqlClient.request(
            CHECK_PINCODE_SERVICEABILITY,
            { pincode },
          );
          if (result?.checkPincodeServiceability?.isDeliverable) {
            isAnyDeliverable = true;
            break;
          }
        }
        if (!isAnyDeliverable) {
          // Pincode rejected — fire before returning so we capture this drop-off
          mpTrack("Pincode Rejected", {
            pincode: pincodesToCheck.join(","),
            cart_value: totalPrice,
          });
          toast.error(
            "Sorry, we currently do not deliver to your selected PIN code.",
          );
          return;
        }
      } catch (err: any) {
        console.error("Failed to check pincode serviceability:", err);
        const errorMsg =
          err?.response?.errors?.[0]?.message ||
          "Failed to verify delivery location. Please try again.";
        toast.error(errorMsg);
        return;
      }
    }

    trackBeginCheckout({
      value: totalPrice,
      items: items.map((item: any) => ({
        id: item.id,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      coupon: appliedCouponCode || undefined,
    });

    setShowPaymentModal(true);

    // Funnel Step 9 — payment gateway is about to open
    trackPaymentInitiated({
      payment_method: "razorpay",
      cart_value: totalPrice,
      gateway: "razorpay",
    });
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
    email: (cartData as any)?.myCart?.userId?.email || "guest@example.com", // Fallback or fetch from user profile
    name: selectedAddress?.recipientName || "Guest",
    phone: selectedAddress?.recipientPhone || "9999999999",
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
        onToggleAddressDetailsModal={() =>
          setShowAddressDetailsModal(!showAddressDetailsModal)
        }
        addresses={addresses}
        onSelectAddress={handleSelectAddress}
        onSelectPlace={handleSelectPlace}
        onSaveAddressDetails={handleSaveAddressDetails}
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
        cartId={(cartData as any)?.myCart?._id || ""}
        amount={totalPrice.toString()}
        userDetails={{
          email: user?.email || "",
          name: user?.name || "",
          phone: user?.phoneNumber || "",
        }}
        isAuthenticated={isAuthenticated}
        freeDeliveryThreshold={priceBreakdown.freeDeliveryThreshold}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || ""}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
};
