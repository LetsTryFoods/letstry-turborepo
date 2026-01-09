import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_ALL_PACKERS,
  GET_PACKER_BY_ID,
  GET_PACKER_STATS,
  CREATE_PACKER,
  UPDATE_PACKER,
  DELETE_PACKER
} from '@/lib/graphql/packers'

export interface Packer {
  id: string
  employeeId: string
  name: string
  phone: string
  email: string
  isActive: boolean
  totalOrdersPacked: number
  accuracyRate: number
  averagePackTime: number
  lastActiveAt?: string
}

export interface PackerStats {
  packerId: string
  totalOrders: number
  accuracyRate: number
  averagePackTime: number
  ordersPackedToday: number
  errorsByType: Array<{
    errorType: string
    count: number
  }>
}

export interface CreatePackerInput {
  employeeId: string
  name: string
  phone: string
  email: string
}

export interface UpdatePackerInput {
  name?: string
  phone?: string
  email?: string
  isActive?: boolean
}

export const usePackers = (isActive?: boolean) => {
  const result = useQuery(GET_ALL_PACKERS, {
    variables: { isActive: isActive ?? null },
    fetchPolicy: 'cache-and-network',
  })
  return result
}

export const usePackerById = (id: string) => {
  return useQuery(GET_PACKER_BY_ID, {
    variables: { packerId: id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const usePackerStats = (packerId: string, startDate?: Date, endDate?: Date) => {
  return useQuery(GET_PACKER_STATS, {
    variables: { packerId, startDate, endDate },
    fetchPolicy: 'cache-and-network',
    skip: !packerId,
  })
}

export const useCreatePacker = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_PACKER, {
    refetchQueries: [{ query: GET_ALL_PACKERS }],
  })
  return { mutate, loading, error }
}

export const useUpdatePacker = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_PACKER, {
    refetchQueries: [{ query: GET_ALL_PACKERS }],
  })
  return { mutate, loading, error }
}

export const useDeletePacker = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_PACKER, {
    refetchQueries: [{ query: GET_ALL_PACKERS }],
  })
  return { mutate, loading, error }
}
