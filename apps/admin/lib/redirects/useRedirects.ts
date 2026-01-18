import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_REDIRECTS,
  GET_REDIRECT,
  CREATE_REDIRECT,
  UPDATE_REDIRECT,
  DELETE_REDIRECT,
  GET_ALL_ACTIVE_REDIRECTS
} from '@/lib/redirects/queries'

export interface Redirect {
  _id: string
  fromPath: string
  toPath: string
  statusCode: number
  isActive: boolean
  description?: string
  source: string
  createdAt: string
  updatedAt: string
}

export const useRedirects = (page = 1, limit = 20, search?: string) => {
  return useQuery(GET_REDIRECTS, {
    variables: { page, limit, search: search || undefined },
    fetchPolicy: 'network-only',
  })
}

export const useRedirect = (id: string) => {
  return useQuery(GET_REDIRECT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateRedirect = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_REDIRECT, {
    refetchQueries: [{ query: GET_REDIRECTS, variables: { page: 1, limit: 20 } }],
    onError: (error: any) => {
      console.error('Create redirect error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateRedirect = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_REDIRECT, {
    refetchQueries: [{ query: GET_REDIRECTS, variables: { page: 1, limit: 20 } }],
    onError: (error: any) => {
      console.error('Update redirect error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useDeleteRedirect = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_REDIRECT, {
    refetchQueries: [{ query: GET_REDIRECTS, variables: { page: 1, limit: 20 } }],
    onError: (error: any) => {
      console.error('Delete redirect error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useActiveRedirects = () => {
  return useQuery(GET_ALL_ACTIVE_REDIRECTS, {
    fetchPolicy: 'cache-and-network',
  })
}
