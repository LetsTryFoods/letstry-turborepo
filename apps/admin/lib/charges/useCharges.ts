import { useMutation, useQuery } from '@apollo/client/react'
import { GET_CHARGES, CREATE_OR_UPDATE_CHARGES } from '@/lib/graphql/charges'

export interface Charges {
  _id: string
  active: boolean
  handlingCharge: number
  gstPercentage: number
  freeDeliveryThreshold: number
  deliveryDelhiBelowThreshold: number
  deliveryRestBelowThreshold: number
}

export interface CreateChargesInput {
  active?: boolean
  handlingCharge: number
  gstPercentage: number
  freeDeliveryThreshold: number
  deliveryDelhiBelowThreshold: number
  deliveryRestBelowThreshold: number
}

export const useCharges = () => {
  return useQuery(GET_CHARGES, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateOrUpdateCharges = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_OR_UPDATE_CHARGES, {
    refetchQueries: [{ query: GET_CHARGES }],
    onError: (error: any) => {
      console.error('Create/Update charges error:', error)
    }
  })

  const createOrUpdateCharges = async (input: CreateChargesInput) => {
    return mutate({ variables: { input } })
  }

  return { createOrUpdateCharges, loading, error }
}
