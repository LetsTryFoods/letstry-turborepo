import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    className?: string;
}

export const SearchBar = ({ className }: SearchBarProps) => {
    return (
        <div className={cn("flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-2", className)}>
            <Search className="h-6 w-6 text-gray-400" />
            <Input
                type="text"
                placeholder="Search for products"
                className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
    );
};
