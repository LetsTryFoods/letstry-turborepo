import Link from "next/link";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { UserButton } from "./user-button";

interface DesktopNavbarProps {
    navigationLinks: Array<{ href: string; label: string }>;
    cartItemCount: number;
    toggleCart: () => void;
    onUserClick: () => void;
}

export const DesktopNavbar = ({
    navigationLinks,
    cartItemCount,
    toggleCart,
    onUserClick,
}: DesktopNavbarProps) => {
    return (
        <div className="hidden md:flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                <Logo className="h-16 w-16" />
                <LocationSelector className="hidden md:flex" />
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
                <SearchBar className="w-64" />
                <CartButton itemCount={cartItemCount} onClick={toggleCart} />
                <UserButton onClick={onUserClick} />
            </div>
        </div>
    );
};
