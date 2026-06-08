"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeoStatusBadgeProps {
  hasSeo: boolean;
}

export function SeoStatusBadge({ hasSeo }: SeoStatusBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex justify-center">
            {hasSeo ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasSeo ? "SEO configured" : "No SEO configured"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
