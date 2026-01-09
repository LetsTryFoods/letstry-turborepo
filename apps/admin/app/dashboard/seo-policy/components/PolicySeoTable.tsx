"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PolicySeoForm } from "./PolicySeoForm";
import { DeletePolicySeoDialog } from "./DeletePolicySeoDialog";
import { PolicySeo } from "@/lib/policy-seo/usePolicySeo";
import { GenericSeoTable } from "@/components/seo/GenericSeoTable";

interface Policy {
    _id: string;
    title: string;
    type: string;
    seo?: PolicySeo | null;
}

interface PolicySeoTableProps {
    policies: Policy[];
    onRefresh: () => void;
}

export function PolicySeoTable({ policies, onRefresh }: PolicySeoTableProps) {
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<Policy | null>(null);

    const handleEdit = (policy: Policy) => {
        setSelectedPolicy(policy);
        setIsFormOpen(true);
    };

    const handleDelete = (policy: Policy) => {
        setPolicyToDelete(policy);
        setDeleteDialogOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setSelectedPolicy(null);
        onRefresh();
    };

    const handleDeleteSuccess = () => {
        setDeleteDialogOpen(false);
        setPolicyToDelete(null);
        onRefresh();
    };

    const columns = [
        {
            header: "Policy Title",
            render: (policy: Policy) => <span className="font-medium">{policy.title}</span>,
        },
        {
            header: "Type",
            render: (policy: Policy) => <span className="font-mono text-xs uppercase">{policy.type}</span>,
        },
    ];

    return (
        <>
            <GenericSeoTable
                items={policies}
                columns={columns}
                hasSeo={(p) => !!p.seo}
                getSeoTitle={(p) => p.seo?.metaTitle}
                getSeoDesc={(p) => p.seo?.metaDescription}
                onEdit={handleEdit}
                onDelete={handleDelete}
                rowKey={(p) => p._id}
            />

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedPolicy?.seo ? "Edit" : "Add"} SEO for {selectedPolicy?.title}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPolicy && (
                        <PolicySeoForm
                            policy={selectedPolicy}
                            existingSeo={selectedPolicy.seo}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {policyToDelete && (
                <DeletePolicySeoDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    policy={policyToDelete}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </>
    );
}
