"use client";

import { ShoppingCart } from "lucide-react";

interface LogoutConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const LogoutConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: LogoutConfirmDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6">
                    Are you sure you want to log out?
                </h2>

                <div className="flex items-start gap-4 mb-8 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="relative flex-shrink-0">
                        <ShoppingCart className="w-12 h-12 text-gray-700" strokeWidth={1.5} />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">!</span>
                        </div>
                    </div>
                    <p className="text-base sm:text-lg text-gray-900 font-medium">
                        If you log out, all items in your cart will be lost!
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 rounded-xl bg-[#0C5273] text-white font-semibold hover:bg-[#0C5273]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        Stay logged in
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3.5 rounded-xl border-2 border-[#0C5273] text-[#0C5273] font-semibold hover:bg-[#0C5273]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Logging out..." : "Logout Anyway"}
                    </button>
                </div>
            </div>
        </div>
    );
};
