"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@apollo/client/react";
import { DELETE_POLICY_SEO } from "@/lib/graphql/policies-seo";

interface Policy {
    _id: string;
    title: string;
    seo?: {
        _id: string;
    } | null;
}

interface DeletePolicySeoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policy: Policy;
    onSuccess: () => void;
}

export function DeletePolicySeoDialog({
    open,
    onOpenChange,
    policy,
    onSuccess,
}: DeletePolicySeoDialogProps) {
    const [deleteMutation, { loading }] = useMutation(DELETE_POLICY_SEO);

    const handleDelete = async () => {
        if (!policy._id) return;

        try {
            await deleteMutation({
                variables: { policyId: policy._id },
                refetchQueries: ['GetPoliciesWithSeo'],
            });
            onSuccess();
        } catch (error) {
            console.error("Failed to delete policy SEO:", error);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete SEO Configuration</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the SEO configuration for "{policy.title}"?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
