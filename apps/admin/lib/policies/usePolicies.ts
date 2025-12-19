import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_POLICIES,
  GET_POLICIES_BY_TYPE,
  GET_POLICY,
  CREATE_POLICY,
  UPDATE_POLICY,
  DELETE_POLICY
} from '@/lib/graphql/policies'

export interface Policy {
  _id: string
  title: string
  content: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface CreatePolicyInput {
  title: string
  content: string
  type: string
}

export interface UpdatePolicyInput {
  title?: string
  content?: string
  type?: string
}

export const usePolicies = () => {
  return useQuery(GET_POLICIES, {
    fetchPolicy: 'cache-and-network',
  })
}

export const usePoliciesByType = (type: string) => {
  return useQuery(GET_POLICIES_BY_TYPE, {
    variables: { type },
    skip: !type,
    fetchPolicy: 'cache-and-network',
  })
}

export const usePolicy = (id: string) => {
  return useQuery(GET_POLICY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreatePolicy = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_POLICY, {
    refetchQueries: [{ query: GET_POLICIES }],
    onError: (error: any) => {
      console.error('Create policy error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdatePolicy = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_POLICY, {
    refetchQueries: [{ query: GET_POLICIES }],
    onError: (error: any) => {
      console.error('Update policy error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useDeletePolicy = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_POLICY, {
    refetchQueries: [{ query: GET_POLICIES }],
    onError: (error: any) => {
      console.error('Delete policy error:', error)
    }
  })

  return { mutate, loading, error }
}
