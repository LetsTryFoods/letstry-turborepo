import { useMutation, useQuery } from '@apollo/client/react'
import {
    GET_BLOGS,
    GET_ACTIVE_BLOGS,
    GET_BLOG,
    CREATE_BLOG,
    UPDATE_BLOG,
    DELETE_BLOG
} from '@/lib/graphql/blogs'

export interface Blog {
    _id: string
    slug: string
    title: string
    excerpt: string
    content: string
    image: string
    date: string
    author: string
    category: string
    isActive: boolean
    position: number
    createdAt: string
    updatedAt: string
}

export interface CreateBlogInput {
    slug: string
    title: string
    excerpt: string
    content: string
    image: string
    date: string
    author: string
    category: string
    isActive?: boolean
    position?: number
}

export interface UpdateBlogInput {
    slug?: string
    title?: string
    excerpt?: string
    content?: string
    image?: string
    date?: string
    author?: string
    category?: string
    isActive?: boolean
    position?: number
}

export const useBlogs = () => {
    return useQuery(GET_BLOGS, {
        fetchPolicy: 'cache-and-network',
    })
}

export const useActiveBlogs = () => {
    return useQuery(GET_ACTIVE_BLOGS, {
        fetchPolicy: 'cache-and-network',
    })
}

export const useBlog = (id: string) => {
    return useQuery(GET_BLOG, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-and-network',
    })
}

export const useCreateBlog = () => {
    const [mutate, { loading, error }] = useMutation(CREATE_BLOG, {
        refetchQueries: [{ query: GET_BLOGS }, { query: GET_ACTIVE_BLOGS }],
        onError: (error: any) => {
            console.error('Create blog error:', error)
        }
    })

    return { mutate, loading, error }
}

export const useUpdateBlog = () => {
    const [mutate, { loading, error }] = useMutation(UPDATE_BLOG, {
        refetchQueries: [{ query: GET_BLOGS }, { query: GET_ACTIVE_BLOGS }],
        onError: (error: any) => {
            console.error('Update blog error:', error)
        }
    })

    return { mutate, loading, error }
}

export const useDeleteBlog = () => {
    const [mutate, { loading, error }] = useMutation(DELETE_BLOG, {
        refetchQueries: [{ query: GET_BLOGS }, { query: GET_ACTIVE_BLOGS }],
        onError: (error: any) => {
            console.error('Delete blog error:', error)
        }
    })

    return { mutate, loading, error }
}
