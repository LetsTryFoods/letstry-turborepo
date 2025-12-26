import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationSelectorProps {
    className?: string;
    showIcon?: boolean;
}

export const LocationSelector = ({ className, showIcon = false }: LocationSelectorProps) => {
    return (
        <button className={cn("flex items-center gap-2 text-sm font-medium hover:text-yellow-600 transition-colors", className)}>
            {showIcon && <MapPin className="h-4 w-4" />}
            Select location
            <ChevronDown className="h-4 w-4" />
        </button>
    );
};
