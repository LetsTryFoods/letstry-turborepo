import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_POLICY_SEO, GET_POLICY_SEO } from "../graphql/policies-seo";

export interface PolicySeo {
    _id: string;
    policyId: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PolicySeoInput {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

export function useUpdatePolicySeo() {
    const [updateMutation, { loading }] = useMutation(UPDATE_POLICY_SEO);

    const updatePolicySeo = async (policyId: string, seoInput: PolicySeoInput) => {
        return updateMutation({
            variables: { policyId, input: seoInput },
            refetchQueries: ['GetPoliciesWithSeo'],
        });
    };

    return { updatePolicySeo, loading };
}

export function useGetPolicySeo(policyId: string) {
    const { data, loading, error } = useQuery<{ policySeo: PolicySeo }>(GET_POLICY_SEO, {
        variables: { policyId },
        skip: !policyId,
    });

    return {
        policySeo: data?.policySeo as PolicySeo | null,
        loading,
        error,
    };
}
