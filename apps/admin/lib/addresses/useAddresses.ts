import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_ADDRESSES,
  GET_ADDRESS,
  CREATE_ADDRESS,
  UPDATE_ADDRESS,
  DELETE_ADDRESS
} from '@/lib/graphql/addresses'

export interface ManufacturingAddress {
  _id: string
  batchCode: string
  addressHeading: string
  subAddressHeading: string
  fssaiLicenseNumber: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  totalCount: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedAddresses {
  items: ManufacturingAddress[]
  meta: PaginationMeta
}

export interface PaginationInput {
  page?: number
  limit?: number
}

export interface CreateAddressInput {
  batchCode: string
  addressHeading: string
  subAddressHeading: string
  fssaiLicenseNumber: string
  isActive?: boolean
}

export interface UpdateAddressInput {
  batchCode?: string
  addressHeading?: string
  subAddressHeading?: string
  fssaiLicenseNumber?: string
  isActive?: boolean
}

export const useAddresses = (pagination: PaginationInput = { page: 1, limit: 10 }) => {
  return useQuery(GET_ADDRESSES, {
    variables: { pagination },
    fetchPolicy: 'cache-and-network',
  })
}

export const useAddress = (id: string) => {
  return useQuery(GET_ADDRESS, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateAddress = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_ADDRESS, {
    refetchQueries: ['GetAddresses'],
    onError: (error: any) => {
      console.error('Create address error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateAddress = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_ADDRESS, {
    refetchQueries: ['GetAddresses'],
    onError: (error: any) => {
      console.error('Update address error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useDeleteAddress = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_ADDRESS, {
    refetchQueries: ['GetAddresses'],
    onError: (error: any) => {
      console.error('Delete address error:', error)
    }
  })

  return { mutate, loading, error }
}
