import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartButtonProps {
    itemCount: number;
    onClick: () => void;
    className?: string;
}

export const CartButton = ({ itemCount, onClick, className }: CartButtonProps) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("relative hover:bg-gray-100", className)}
            aria-label="Shopping cart"
            onClick={onClick}
        >
            <ShoppingCart className="h-8 w-8" />

            {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white">
                    {itemCount}
                </span>
            )}
        </Button>
    );
};
