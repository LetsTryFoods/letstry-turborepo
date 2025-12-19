"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LoginModal } from "@/components/auth";
import { useAuth } from "@/providers/auth-provider";
import { useLoginModalStore } from "@/stores/login-modal-store";
import { useCartStore } from "@/stores/cart-store";
import { useCart } from "@/lib/cart/use-cart";
import { useRouter } from "next/navigation";

type NavbarProps = {
  initialAuth?: {
    isAuthenticated: boolean;
    isGuest: boolean;
    user: any;
  };
};

export const Navbar = ({ initialAuth }: NavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated: clientAuth, user, logout } = useAuth();
  const { isOpen: showLoginModal, openModal, closeModal } = useLoginModalStore();
  const { toggleCart } = useCartStore();
  const { data: cartData } = useCart();

  const cartItemCount = (cartData as any)?.myCart?.items?.length || 0;

  const isAuthenticated = initialAuth?.isAuthenticated ?? clientAuth;

  const handleLoginSuccess = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleUserIconClick = useCallback(() => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      openModal(`${process.env.NEXT_PUBLIC_API_URL}`);
    }
  }, [isAuthenticated, router, openModal]);

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/snacks", label: "Snacks" },
    { href: "/combos", label: "Combos" },
    { href: "/about", label: "About us" },

  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.webp"
                alt="Let's Try"
                width={64}
                height={64}
                className="h-16 w-16"
                priority
              />
            </Link>

            <button className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-yellow-600 transition-colors">
              Select location
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 w-64">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for products"
                className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex relative hover:bg-gray-100"
              aria-label="Shopping cart"
              onClick={toggleCart}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                {cartItemCount}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-gray-100"
              aria-label="User account"
              onClick={handleUserIconClick}
            >
              <User className="h-5 w-5" />
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-gray-100"
                  aria-label="Menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 py-6">
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-yellow-600 transition-colors">
                    <MapPin className="h-4 w-4" />
                    Select location
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search for products"
                      className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      aria-label="Shopping cart"
                      onClick={() => {
                        toggleCart();
                        setIsOpen(false);
                      }}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Cart ({cartItemCount})
                    </Button>
                    {isAuthenticated && (
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        aria-label="User account"
                        onClick={() => {
                          router.push('/profile');
                          setIsOpen(false);
                        }}
                      >
                        <User className="h-5 w-5 mr-2" />
                        Account
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
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
