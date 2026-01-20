"use client";

import { useState, useCallback, useMemo } from "react";
import { LoginModal } from "@/components/auth";
import { useAuth } from "@/providers/auth-provider";
import { useLoginModalStore } from "@/stores/login-modal-store";
import { useCartStore } from "@/stores/cart-store";
import { useCart } from "@/lib/cart/use-cart";
import { useRouter } from "next/navigation";
import { DesktopNavbar } from "./components/desktop-navbar";
import { MobileNavbar } from "./components/mobile-navbar";

type NavbarProps = {
  initialAuth?: {
    isAuthenticated: boolean;
    isGuest: boolean;
    user: any;
  };
  categories?: Array<{ href: string; label: string }>;
};

export const Navbar = ({ initialAuth, categories = [] }: NavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated: clientAuth, user, logout } = useAuth();
  const {
    isOpen: showLoginModal,
    openModal,
    closeModal,
  } = useLoginModalStore();
  const { toggleCart } = useCartStore();
  const { data: cartData } = useCart();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const cartItemCount = (cartData as any)?.myCart?.items?.length || 0;
  const isAuthenticated = initialAuth?.isAuthenticated ?? clientAuth;

  const handleLoginSuccess = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleUserIconClick = useCallback(() => {
    if (isAuthenticated) {
      router.push("/profile");
    } else {
      openModal(`${process.env.NEXT_PUBLIC_API_URL}`);
    }
  }, [isAuthenticated, router, openModal]);

  const navigationLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "#", label: "Snacks", hasDropdown: true, dropdownItems: categories },
      { href: "/combo", label: "Combos"},
      // {href: "/blog", label: "Blog"},
      { href: "/about-us", label: "About us" },
    ],
    [categories]
  );

  return (
    <nav className="sticky top-0 z-40 w-full bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 ">
        <DesktopNavbar
          navigationLinks={navigationLinks}
          cartItemCount={cartItemCount}
          toggleCart={toggleCart}
          onUserClick={handleUserIconClick}
          setHoveredMenu={setHoveredMenu}
          hoveredMenu={hoveredMenu}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => openModal(`${process.env.NEXT_PUBLIC_API_URL}`)}
        />

        <MobileNavbar
          cartItemCount={cartItemCount}
          toggleCart={toggleCart}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigationLinks={navigationLinks}
          isAuthenticated={isAuthenticated}
          onProfileClick={() => router.push("/profile")}
        />
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModal}
        backendUrl={`${process.env.NEXT_PUBLIC_API_URL}`}
        onSuccess={handleLoginSuccess}
      />
    </nav>
  );
};

export default Navbar;