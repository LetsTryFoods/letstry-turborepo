"use client";

import { useCorporateEnquiries } from "@/lib/corporate-enquiries/useCorporateEnquiries";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURPOSE_LABELS: Record<string, string> = {
    FestiveGifting: "Festive Gifting",
    WholesaleRetail: "Wholesale / Retail",
    WeddingGifting: "Wedding Gifting",
    CorporateGifting: "Corporate Gifting",
    PantrySnacking: "Pantry Snacking",
    PersonalGifting: "Personal Gifting",
    EmployeeGifting: "Employee Gifting",
    Others: "Others",
};

export default function CorporateEnquiriesPage() {
    const { enquiries, loading, refetch } = useCorporateEnquiries();

    return (
        <div className="space-y-6 mx-6 mb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Corporate Enquiries
                    </h1>
                    <p className="text-muted-foreground">
                        Business enquiries submitted via the Bulk & Corporate page
                    </p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Enquiries
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{enquiries.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            Loading...
                        </div>
                    ) : enquiries.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            No enquiries yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Purpose</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enquiries.map((enquiry) => (
                                    <TableRow key={enquiry._id}>
                                        <TableCell className="font-medium">
                                            {enquiry.companyName || "—"}
                                        </TableCell>
                                        <TableCell>{enquiry.name}</TableCell>
                                        <TableCell>{enquiry.phone}</TableCell>
                                        <TableCell>{enquiry.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {PURPOSE_LABELS[enquiry.purposeOfInquiry] ||
                                                    enquiry.purposeOfInquiry}
                                            </Badge>
                                            {enquiry.purposeOfInquiry === "Others" &&
                                                enquiry.otherPurpose && (
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        ({enquiry.otherPurpose})
                                                    </span>
                                                )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
