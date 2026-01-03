import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_ASSIGNED_ORDER,
  GET_BOX_RECOMMENDATION,
  SCAN_ITEM,
  UPLOAD_EVIDENCE,
  COMPLETE_PACKING,
  FLAG_PACKING_ERROR
} from '@/lib/graphql/packing'

export interface PackingOrderItem {
  ean: string
  productName: string
  quantity: number
  scannedQuantity: number
  imageUrl?: string
}

export interface RetrospectiveError {
  errorType: string
  description: string
  flaggedAt: string
}

export interface PackingOrder {
  _id: string
  orderId: string
  assignedTo: string
  status: string
  items: PackingOrderItem[]
  recommendedBoxCode?: string
  actualBoxCode?: string
  packingStartedAt?: string
  packingCompletedAt?: string
  prePackImages?: string[]
  retrospectiveErrors?: RetrospectiveError[]
  createdAt: string
  updatedAt: string
}

export interface BoxSize {
  _id: string
  code: string
  name: string
  length: number
  width: number
  height: number
  maxWeight: number
  volumetricWeight: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ScanLog {
  _id: string
  packingOrderId: string
  packerId: string
  ean: string
  action: string
  timestamp: string
  isError: boolean
  errorType?: string
}

export interface ScanItemInput {
  packingOrderId: string
  ean: string
}

export interface UploadEvidenceInput {
  packingOrderId: string
  prePackImages?: string[]
  actualBoxCode?: string
}

export interface FlagErrorInput {
  packingOrderId: string
  ean: string
  errorType: string
  description?: string
}

export const useAssignedOrder = () => {
  return useQuery(GET_ASSIGNED_ORDER, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useBoxRecommendation = (packingOrderId: string) => {
  return useQuery(GET_BOX_RECOMMENDATION, {
    variables: { packingOrderId },
    fetchPolicy: 'cache-and-network',
    skip: !packingOrderId,
  })
}

export const useScanItem = () => {
  const [mutate, { loading, error }] = useMutation(SCAN_ITEM)
  return { mutate, loading, error }
}

export const useUploadEvidence = () => {
  const [mutate, { loading, error }] = useMutation(UPLOAD_EVIDENCE)
  return { mutate, loading, error }
}

export const useCompletePacking = () => {
  const [mutate, { loading, error }] = useMutation(COMPLETE_PACKING)
  return { mutate, loading, error }
}

export const useFlagPackingError = () => {
  const [mutate, { loading, error }] = useMutation(FLAG_PACKING_ERROR)
  return { mutate, loading, error }
}
