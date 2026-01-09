import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_CATEGORY_SEO, GET_CATEGORY_SEO } from "../graphql/categories-seo";

export interface CategorySeo {
    _id: string;
    categoryId: string;
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

export interface CategorySeoInput {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
}

export function useUpdateCategorySeo() {
    const [updateMutation, { loading }] = useMutation(UPDATE_CATEGORY_SEO);

    const updateCategorySeo = async (categoryId: string, seoInput: CategorySeoInput) => {
        return updateMutation({
            variables: { categoryId, input: seoInput },
            refetchQueries: ['GetCategoriesWithSeo'],
        });
    };

    return { updateCategorySeo, loading };
}

export function useGetCategorySeo(categoryId: string) {
    const { data, loading, error } = useQuery<{ categorySeo: CategorySeo }>(GET_CATEGORY_SEO, {
        variables: { categoryId },
        skip: !categoryId,
    });

    return {
        categorySeo: data?.categorySeo as CategorySeo | null,
        loading,
        error,
    };
}
