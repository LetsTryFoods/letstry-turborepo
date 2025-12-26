import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    navigationLinks: Array<{ href: string; label: string }>;
    cartItemCount: number;
    toggleCart: () => void;
    isAuthenticated: boolean;
    onProfileClick: () => void;
}

export const MobileMenu = ({
    isOpen,
    setIsOpen,
    navigationLinks,
    cartItemCount,
    toggleCart,
    isAuthenticated,
    onProfileClick,
}: MobileMenuProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-10 p-0">
                    <Menu className="size-8 text-black stroke-[1.5]" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" hideClose className="w-full sm:w-full border-none p-6 flex flex-col gap-8">
                <div className="flex items-center justify-between w-full">
                    <div className="bg-[#FFCC00] rounded-full w-14 h-14 flex items-center justify-center overflow-hidden">
                        <Image
                            src="/logo.webp"
                            alt="Let's Try"
                            width={56}
                            height={56}
                            className="w-full h-full object-contain"
                            priority
                        />
                    </div>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 p-0">
                            <X className="size-8 text-gray-500" />
                        </Button>
                    </SheetClose>
                </div>

                <nav className="flex flex-col gap-6 mt-4">
                    <Link
                        href="/"
                        className="text-xl font-bold text-black hover:text-yellow-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/combos"
                        className="text-xl font-bold text-black hover:text-yellow-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Combos
                    </Link>
                    <button
                        className="text-left text-xl font-bold text-black hover:text-yellow-600 transition-colors"
                        onClick={() => {
                            toggleCart();
                            setIsOpen(false);
                        }}
                    >
                        Cart
                    </button>
                    <Link
                        href="/about"
                        className="text-xl font-bold text-black hover:text-yellow-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        About Us
                    </Link>
                    <button
                        className="text-left text-xl font-bold text-black hover:text-yellow-600 transition-colors"
                        onClick={() => {
                            onProfileClick();
                            setIsOpen(false);
                        }}
                    >
                        Account
                    </button>
                </nav>
            </SheetContent>
        </Sheet>
    );
};
