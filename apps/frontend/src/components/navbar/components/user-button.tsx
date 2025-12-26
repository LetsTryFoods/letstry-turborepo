import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserButtonProps {
    onClick: () => void;
    className?: string;
}

export const UserButton = ({ onClick, className }: UserButtonProps) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("hover:bg-gray-100", className)}
            aria-label="User account"
            onClick={onClick}
        >
            <User className="h-5 w-5" />
        </Button>
    );
};
