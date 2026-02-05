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
    console.log('Fetching active blogs...');
    console.log('GraphQL Endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

    // Debugging the query object structure
    const queryObj = GET_ACTIVE_BLOGS as any;
    console.log('Query Object Keys:', Object.keys(queryObj));

    // Attempting to extract query string safely
    const queryString = queryObj?.loc?.source?.body || queryObj?.value || queryObj?.toString();
    console.log('Query String present:', !!queryString);

    try {
        const data = await client.request<GetActiveBlogsResponse>(
            queryString
        );
        console.log('Active blogs fetched:', data.activeBlogs?.length);
        return data.activeBlogs;
    } catch (error) {
        console.error('Error fetching active blogs:', error);
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
        console.error(`Error fetching blog with slug ${slug}:`, error);
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
