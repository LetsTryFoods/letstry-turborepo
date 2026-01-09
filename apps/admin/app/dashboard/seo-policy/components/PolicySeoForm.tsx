"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { policySeoSchema, PolicySeoFormData } from "@/lib/validations/policy-seo.schema";
import { FileText } from "lucide-react";
import { useUpdatePolicySeo, PolicySeo } from "@/lib/policy-seo/usePolicySeo";
import { SeoFields } from "@/components/seo/SeoFields";

interface Policy {
    _id: string;
    title: string;
    type: string;
}

interface PolicySeoFormProps {
    policy: Policy;
    existingSeo?: PolicySeo | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PolicySeoForm({ policy, existingSeo, onSuccess, onCancel }: PolicySeoFormProps) {
    const { updatePolicySeo, loading: isLoading } = useUpdatePolicySeo();

    const defaultMetaTitle = `${policy.title} - Policy | LetsTry Foods`;
    const defaultMetaDescription = `Read our ${policy.title.toLowerCase()} policy to understand our terms and commitments.`;

    const methods = useForm<PolicySeoFormData>({
        resolver: zodResolver(policySeoSchema),
        defaultValues: {
            policyId: policy._id,
            metaTitle: existingSeo?.metaTitle || defaultMetaTitle,
            metaDescription: existingSeo?.metaDescription || defaultMetaDescription,
            metaKeywords: existingSeo?.metaKeywords || [],
            canonicalUrl: existingSeo?.canonicalUrl || `https://letstryfoods.com/policies/${policy.type}`,
            ogTitle: existingSeo?.ogTitle || "",
            ogDescription: existingSeo?.ogDescription || "",
            ogImage: existingSeo?.ogImage || "",
        },
    });

    const handleSubmit = async (data: PolicySeoFormData) => {
        try {
            await updatePolicySeo(policy._id, data);
            onSuccess();
        } catch (error) {
            console.error("Failed to save policy SEO:", error);
        }
    };

    return (
        <FormProvider {...methods}>
            <Form {...methods}>
                <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Policy Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Title:</span>
                                <p className="font-medium">{policy.title}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Type:</span>
                                <p className="font-mono text-xs bg-background px-2 py-1 rounded">{policy.type}</p>
                            </div>
                        </div>
                    </div>

                    <input type="hidden" {...methods.register("policyId")} />

                    <Separator />

                    <SeoFields />

                    <div className="flex justify-end space-x-4 pt-4 border-t sticky bottom-0 bg-background py-4">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : existingSeo?._id ? "Update SEO" : "Save SEO"}
                        </Button>
                    </div>
                </form>
            </Form>
        </FormProvider>
    );
}
