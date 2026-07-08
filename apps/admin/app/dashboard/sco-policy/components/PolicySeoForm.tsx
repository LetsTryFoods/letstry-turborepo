"use client";

import { GenericSeoForm } from "@/components/seo/GenericSeoForm";
import { Policy } from "@/lib/policies/usePolicies";
import { SeoFormData } from "@/lib/validations/seo.schema";

interface PolicySeoFormProps {
    policy: Policy;
    existingSeo?: any | null;
    isLoading: boolean;
    onSubmit: (data: SeoFormData) => Promise<void>;
    onCancel: () => void;
}

export function PolicySeoForm({
    policy,
    existingSeo,
    isLoading,
    onSubmit,
    onCancel
}: PolicySeoFormProps) {
    return (
        <GenericSeoForm
            initialData={existingSeo}
            entityName={policy.title}
            entitySlug={policy.type} // Policies often use type as slug
            entityType="Policy"
            entityImageUrl="" // Policies don't usually have images
            onSubmit={onSubmit}
            isLoading={isLoading}
            onCancel={onCancel}
        />
    );
}
