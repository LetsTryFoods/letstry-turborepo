'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";

interface MobileNavbarProps {
    cartItemCount: number;
    toggleCart: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    navigationLinks: Array<{ href: string; label: string; hasDropdown?: boolean; dropdownItems?: Array<{ href: string; label: string }>; isLogin?: boolean; disableActive?: boolean; }>;
    isAuthenticated: boolean;
    onProfileClick: () => void;
    onLoginClick: () => void;
}

export const MobileNavbar = ({
    cartItemCount,
    toggleCart,
    isOpen,
    setIsOpen,
    navigationLinks,
    isAuthenticated,
    onProfileClick,
    onLoginClick,
}: MobileNavbarProps) => {
    const router = useRouter();

    return (
        <div className="flex md:hidden h-20 items-center justify-between relative px-2">
            <div>
                <Link href="/" className="block gold-border-logo">
                    <div className="bg-[#FFCC00] rounded-full  w-10 h-10 flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo.webp"
                            alt="Let's Try"
                            width={20}
                            height={20}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>

            <div className="flex items-center -mr-2">
                <Button variant="ghost" size="icon" className="h-12 w-10 p-0" onClick={() => router.push('/search')}>
                    <Search className="size-6 text-black stroke-[1.5]" />
                </Button>

                <CartButton itemCount={cartItemCount} onClick={toggleCart} />

                <MobileMenu
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    navigationLinks={navigationLinks}
                    cartItemCount={cartItemCount}
                    toggleCart={toggleCart}
                    isAuthenticated={isAuthenticated}
                    onProfileClick={onProfileClick}
                    onLoginClick={onLoginClick}
                />
            </div>
        </div>
    );
};
