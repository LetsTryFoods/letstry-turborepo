"use client";

import { User, Bell, Package, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutConfirmDialog } from "@/components/auth/logout-confirm-dialog";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  action?: React.ReactNode;
  disabled?: boolean;
}

const SidebarItem = ({ icon: Icon, label, href, onClick, isActive, action, disabled }: SidebarItemProps) => {
  const content = (
    <div
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer",
        isActive && "bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      {action || <ChevronRight className="w-4 h-4 text-gray-400" />}
    </div>
  );

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

export const ProfileSidebar = () => {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setShowLogoutDialog(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 overflow-hidden h-fit">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
          <User className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user?.name || "Guest User"}</h3>
          <p className="text-sm text-gray-500">{user?.phoneNumber || user?.email || "guest@example.com"}</p>
        </div>
      </div>

      <div className="flex flex-col">
        <SidebarItem
          icon={User}
          label="My Profile"
          href="/profile"
          isActive={pathname === "/profile"}
          disabled={isLoggingOut}
        />
        {/* <SidebarItem
          icon={Bell}
          label="Notifications"
          action={<span className="text-xs text-gray-400 font-medium">Allow</span>}
          disabled={isLoggingOut}
        /> */}
        <SidebarItem
          icon={Package}
          label="My orders"
          href="/profile/orders"
          isActive={pathname === "/profile/orders"}
          disabled={isLoggingOut}
        />
        <SidebarItem
          icon={LogOut}
          label={isLoggingOut ? "Logging out..." : "Log Out"}
          onClick={handleLogoutClick}
          disabled={isLoggingOut}
        />
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </div>
  );
};
