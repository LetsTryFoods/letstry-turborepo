"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeoStatsGrid } from "./SeoStatsGrid";

interface SeoPageLayoutProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    total: number;
    configured: number;
    loading?: boolean;
    onRefresh: () => void;
    children: React.ReactNode;
    statsLabels?: Parameters<typeof SeoStatsGrid>[0]['labels'];
}

export function SeoPageLayout({
    title,
    description,
    icon,
    total,
    configured,
    loading,
    onRefresh,
    children,
    statsLabels,
}: SeoPageLayoutProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {icon}
                        {title}
                    </h1>
                    <p className="text-muted-foreground mt-1">{description}</p>
                </div>
                <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <SeoStatsGrid
                total={total}
                configured={configured}
                labels={statsLabels}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Management</CardTitle>
                    <CardDescription>
                        Configure meta tags and social sharing settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
