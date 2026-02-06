import { useMutation, useQuery } from '@apollo/client/react';
import {
    GET_BLOG_CATEGORIES,
    GET_ACTIVE_BLOG_CATEGORIES,
    CREATE_BLOG_CATEGORY,
    UPDATE_BLOG_CATEGORY,
    DELETE_BLOG_CATEGORY,
} from '../graphql/blog-categories';

export function useBlogCategories() {
    const { data, loading, error, refetch } = useQuery(GET_BLOG_CATEGORIES);

    const [createBlogCategory] = useMutation(CREATE_BLOG_CATEGORY, {
        refetchQueries: [{ query: GET_BLOG_CATEGORIES }],
    });

    const [updateBlogCategory] = useMutation(UPDATE_BLOG_CATEGORY, {
        refetchQueries: [{ query: GET_BLOG_CATEGORIES }],
    });

    const [deleteBlogCategory] = useMutation(DELETE_BLOG_CATEGORY, {
        refetchQueries: [{ query: GET_BLOG_CATEGORIES }],
    });

    return {
        categories: data?.blogCategories || [],
        categoriesLoading: loading,
        categoriesError: error,
        createBlogCategory,
        updateBlogCategory,
        deleteBlogCategory,
        refetchCategories: refetch,
    };
}

export function useActiveBlogCategories() {
    const { data, loading, error } = useQuery(GET_ACTIVE_BLOG_CATEGORIES);

    return {
        activeCategories: data?.activeBlogCategories || [],
        activeCategoriesLoading: loading,
        activeCategoriesError: error,
    };
}
