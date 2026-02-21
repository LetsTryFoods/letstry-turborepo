import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import {
  GET_ALL_SHIPMENTS,
  GET_SHIPMENT_BY_ID,
  GET_SHIPMENT_BY_AWB,
  GET_SHIPMENT_WITH_TRACKING,
  CANCEL_SHIPMENT,
  GET_SHIPMENT_LABEL,
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

export const useShipmentLabel = () => {
  const [getLabel, { loading, error }] = useLazyQuery<{ getShipmentLabel: string }>(GET_SHIPMENT_LABEL, {
    fetchPolicy: 'network-only',
  })

  const downloadLabel = async (awbNumber: string) => {
    try {
      const response = await getLabel({ variables: { awbNumber } })
      const base64 = response.data?.getShipmentLabel

      if (!base64) {
        throw new Error('Label not found')
      }

      // Convert base64 to Blob and trigger download
      const binaryData = atob(base64)
      const arrayBuffer = new ArrayBuffer(binaryData.length)
      const uint8Array = new Uint8Array(arrayBuffer)

      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i)
      }

      const blob = new Blob([uint8Array], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `label-${awbNumber}.pdf`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (e) {
      console.error('Download failed', e)
      return false
    }
  }

  return { downloadLabel, loading, error }
}
