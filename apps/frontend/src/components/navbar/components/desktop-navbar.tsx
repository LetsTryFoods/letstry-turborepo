import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "./logo";
import { LocationSelector } from "./location-selector";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { UserButton } from "./user-button";

interface DesktopNavbarProps {
  navigationLinks: Array<{
    href: string;
    label: string;
    hasDropdown?: boolean;
    dropdownItems?: Array<{ href: string; label: string }>;
    isLogin?: boolean;
  }>;
  cartItemCount: number;
  toggleCart: () => void;
  onUserClick: () => void;
  hoveredMenu: string | null;
  setHoveredMenu: (menu: string | null) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

export const DesktopNavbar = ({
  navigationLinks,
  cartItemCount,
  toggleCart,
  onUserClick,
  hoveredMenu,
  setHoveredMenu,
  isAuthenticated,
  onLoginClick,
}: DesktopNavbarProps) => {
  return (
    <div className="hidden md:flex h-20 items-center relative px-4">
      <div className="flex items-center gap-6">
        <Logo className="h-16 w-16" />
        {/* <LocationSelector className="hidden md:flex" /> */}
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:flex items-center gap-8">
        {navigationLinks.map((link) => (
          <div
            key={link.href}
            className="relative group flex items-center"
            onMouseEnter={() => link.hasDropdown && setHoveredMenu(link.label)}
            onMouseLeave={() => setHoveredMenu(null)}
          >
            {link.hasDropdown ? (
              <span className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors flex items-center gap-1 h-full cursor-default">
                {link.label}
                <ChevronDown className="h-4 w-4" />
              </span>
            ) : link.isLogin ? (
              <button
                onClick={onLoginClick}
                className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors flex items-center gap-1 h-full"
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className="text-lg font-medium text-gray-900 hover:text-yellow-600 transition-colors flex items-center gap-1 h-full"
              >
                {link.label}
              </Link>
            )}

            {link.hasDropdown && hoveredMenu === link.label && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-2 w-56 z-50">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  {link.dropdownItems?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <SearchBar className="w-64" />

        <CartButton itemCount={cartItemCount} onClick={toggleCart} />

        <UserButton onClick={onUserClick} />
      </div>
    </div>
  );
};
