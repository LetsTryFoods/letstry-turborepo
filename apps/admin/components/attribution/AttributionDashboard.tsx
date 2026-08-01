"use client";

import { useState } from "react";
import { useAttributionAnalytics } from "@/lib/attribution/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Globe, Smartphone, Link2, ShoppingBag } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  "Affiliate": "bg-purple-100 text-purple-700 border-purple-300",
  "Meta": "bg-blue-100 text-blue-700 border-blue-300",
  "Google": "bg-red-100 text-red-700 border-red-300",
  "Instagram": "bg-pink-100 text-pink-700 border-pink-300",
  "WhatsApp": "bg-green-100 text-green-700 border-green-300",
  "Direct": "bg-gray-100 text-gray-700 border-gray-300",
  "YouTube": "bg-red-100 text-red-700 border-red-300",
  "Twitter": "bg-sky-100 text-sky-700 border-sky-300",
};

function getSourceColor(sourceLabel: string): string {
  const key = Object.keys(SOURCE_COLORS).find((k) =>
    sourceLabel.toLowerCase().includes(k.toLowerCase())
  );
  return key ? SOURCE_COLORS[key] : "bg-indigo-100 text-indigo-700 border-indigo-300";
}

export function AttributionDashboard() {
  const [days, setDays] = useState(30);
  const { data, loading } = useAttributionAnalytics(days);

  const maxOrders = data?.sources?.[0]?.orderCount || 1;

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-base font-semibold">
            Order Source Attribution
          </CardTitle>
          {data && (
            <Badge variant="outline" className="text-[11px] ml-1">
              {data.totalAttributedOrders} tracked orders
            </Badge>
          )}
        </div>
        <Select
          value={String(days)}
          onValueChange={(v) => setDays(Number(v))}
        >
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 1 year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        )}

        {!loading && data && data.sources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">No attribution data yet</p>
            <p className="text-xs mt-1">
              Place an order using a UTM link to start tracking
            </p>
          </div>
        )}

        {data && data.sources.length > 0 && (
          <div className="space-y-2.5">
            {data.sources.map((source) => {
              const pct = Math.round((source.orderCount / maxOrders) * 100);
              return (
                <div key={source.sourceLabel} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <Badge
                        variant="outline"
                        className={`text-[11px] px-2 py-0 h-5 font-medium ${getSourceColor(source.sourceLabel)}`}
                      >
                        {source.sourceLabel}
                      </Badge>
                    </div>
                    <span className="text-[12px] font-bold text-foreground tabular-nums">
                      {source.orderCount} order{source.orderCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
