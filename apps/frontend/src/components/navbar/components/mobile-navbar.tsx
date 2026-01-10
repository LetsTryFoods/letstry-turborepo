import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./mobile-menu";
import { useSearchStore } from "@/stores/search-store";

interface MobileNavbarProps {
    cartItemCount: number;
    toggleCart: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    navigationLinks: Array<{ href: string; label: string }>;
    isAuthenticated: boolean;
    onProfileClick: () => void;
}

export const MobileNavbar = ({
    cartItemCount,
    toggleCart,
    isOpen,
    setIsOpen,
    navigationLinks,
    isAuthenticated,
    onProfileClick,
}: MobileNavbarProps) => {
    const { openSearch } = useSearchStore();

    return (
        <div className="flex md:hidden h-20 items-center justify-between relative px-2">
            {/* Left: Delivering at */}
            {/* <div className="flex flex-col flex-1 min-w-0">
                <span className="text-md font-bold text-black leading-tight">Delivering at</span>
                <span className="text-sm text-gray-600 truncate pr-4 ">
                    Netaji Subhash Place
                </span>
            </div> */}

            {/* Center: Logo */}
            {/* <div className="absolute left-1/2 -translate-x-1/2 z-10"> */}
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

            {/* Right: Icons */}
            <div className="flex items-center -mr-2">
                <Button variant="ghost" size="icon" className="h-12 w-10 p-0" onClick={openSearch}>
                    <Search className="size-6 text-black stroke-[1.5]" />
                </Button>

                <Button variant="ghost" size="icon" className="h-12 w-10 p-0 relative" onClick={toggleCart}>
                    <div className="relative">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-black">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <div className="absolute -right-1 -bottom-1 bg-white rounded-full border border-black w-4 h-4 flex items-center justify-center">
                            <span className="text-black text-[10px] font-bold">+</span>
                        </div>
                    </div>
                </Button>

                <MobileMenu
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    navigationLinks={navigationLinks}
                    cartItemCount={cartItemCount}
                    toggleCart={toggleCart}
                    isAuthenticated={isAuthenticated}
                    onProfileClick={onProfileClick}
                />
            </div>
        </div>
    );
};
