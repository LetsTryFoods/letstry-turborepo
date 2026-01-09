"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, BarChart3 } from "lucide-react";

interface SeoStatsGridProps {
    total: number;
    configured: number;
    labels?: {
        total?: string;
        configured?: string;
        notConfigured?: string;
        coverage?: string;
    };
}

export function SeoStatsGrid({ total, configured, labels = {} }: SeoStatsGridProps) {
    const notConfigured = total - configured;
    const coverage = total > 0 ? Math.round((configured / total) * 100) : 0;

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{labels.total || "Total Items"}</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{labels.configured || "SEO Configured"}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{configured}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{labels.notConfigured || "Not Configured"}</CardTitle>
                    <XCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{notConfigured}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{labels.coverage || "Coverage"}</CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{coverage}%</div>
                </CardContent>
            </Card>
        </div>
    );
}
