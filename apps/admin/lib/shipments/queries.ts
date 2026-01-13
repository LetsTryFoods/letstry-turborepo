import { useQuery, useMutation } from '@apollo/client/react'
import {
  GET_ALL_SHIPMENTS,
  GET_SHIPMENT_BY_ID,
  GET_SHIPMENT_BY_AWB,
  GET_SHIPMENT_WITH_TRACKING,
  CANCEL_SHIPMENT,
} from '../graphql/shipments'
import {
  Shipment,
  ShipmentFilters,
  ShipmentListData,
  ShipmentByIdData,
  ShipmentByAwbData,
  ShipmentWithTrackingData,
  CancelShipmentData,
  CancelShipmentInput,
} from './types'

export const useAllShipments = (filters?: ShipmentFilters) => {
  const { data, loading, error, refetch } = useQuery<ShipmentListData>(
    GET_ALL_SHIPMENTS,
    {
      variables: { filters },
      fetchPolicy: 'cache-and-network',
    }
  )

  return {
    shipments: data?.listShipments?.shipments || [],
    total: data?.listShipments?.total || 0,
    loading,
    error,
    refetch,
  }
}

export const useShipmentById = (id: string) => {
  const { data, loading, error, refetch } = useQuery<ShipmentByIdData>(
    GET_SHIPMENT_BY_ID,
    {
      variables: { id },
      skip: !id,
      fetchPolicy: 'cache-and-network',
    }
  )

  return {
    shipment: data?.getShipmentById,
    loading,
    error,
    refetch,
  }
}

export const useShipmentByAwb = (awbNumber: string) => {
  const { data, loading, error, refetch } = useQuery<ShipmentByAwbData>(
    GET_SHIPMENT_BY_AWB,
    {
      variables: { awbNumber },
      skip: !awbNumber,
      fetchPolicy: 'cache-and-network',
    }
  )

  return {
    shipment: data?.getShipmentByAwb,
    loading,
    error,
    refetch,
  }
}

export const useShipmentWithTracking = (awbNumber: string) => {
  const { data, loading, error, refetch } = useQuery<ShipmentWithTrackingData>(
    GET_SHIPMENT_WITH_TRACKING,
    {
      variables: { awbNumber },
      skip: !awbNumber,
      fetchPolicy: 'cache-and-network',
    }
  )

  return {
    shipment: data?.getShipmentWithTracking,
    trackingHistory: data?.getShipmentWithTracking?.trackingHistory || [],
    loading,
    error,
    refetch,
  }
}

export const useCancelShipment = () => {
  const [cancelShipmentMutation, { loading, error }] =
    useMutation<CancelShipmentData>(CANCEL_SHIPMENT)

  const cancelShipment = async (input: CancelShipmentInput) => {
    const result = await cancelShipmentMutation({
      variables: { input },
      refetchQueries: ['ListShipments'],
    })
    return result.data?.cancelShipment
  }

  return {
    cancelShipment,
    loading,
    error,
  }
}
