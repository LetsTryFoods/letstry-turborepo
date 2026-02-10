import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_ACTIVE_BLOGS, GET_BLOG_BY_SLUG, GET_ALL_BLOGS } from '@/lib/queries/blogs';

export interface Blog {
    _id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image?: string | null;
    date?: string | null;
    author: string;
    category: string;
    seo?: {
        metaTitle?: string | null;
        metaDescription?: string | null;
        metaKeywords?: string[] | null;
        canonicalUrl?: string | null;
        ogTitle?: string | null;
        ogDescription?: string | null;
        ogImage?: string | null;
    } | null;
    isActive?: boolean | null;
    position?: number | null;
    createdAt: string;
    updatedAt: string;
}

interface GetActiveBlogsResponse {
    activeBlogs: Blog[];
}

interface GetBlogBySlugResponse {
    blogBySlug: Blog | null;
}

interface GetAllBlogsResponse {
    blogs: Blog[];
}

export async function getActiveBlogs(): Promise<Blog[]> {
    const client = createServerGraphQLClient();

    // Debugging the query object structure
    const queryObj = GET_ACTIVE_BLOGS as any;

    // Attempting to extract query string safely
    const queryString = queryObj?.loc?.source?.body || queryObj?.value || queryObj?.toString();

    try {
        const data = await client.request<GetActiveBlogsResponse>(
            queryString
        )
        return data.activeBlogs;
    } catch (error) {
        return [];
    }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
    const client = createServerGraphQLClient();

    const queryString = (GET_BLOG_BY_SLUG as unknown as { value: string }).value;

    try {
        const data = await client.request<GetBlogBySlugResponse>(
            queryString,
            { slug }
        );
        return data.blogBySlug;
    } catch (error) {
        return null;
    }
}

export async function getAllBlogs(): Promise<Blog[]> {
    const client = createServerGraphQLClient();

    const queryString = (GET_ALL_BLOGS as unknown as { value: string }).value;

    try {
        const data = await client.request<GetAllBlogsResponse>(
            queryString
        );
        return data.blogs;
    } catch (error) {
        console.error('Error fetching all blogs:', error);
        return [];
    }
}
