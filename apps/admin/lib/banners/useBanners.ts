import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_BANNERS,
  GET_ACTIVE_BANNERS,
  GET_BANNER,
  CREATE_BANNER,
  UPDATE_BANNER,
  UPDATE_BANNER_ACTIVE,
  DELETE_BANNER
} from '@/lib/graphql/banners'

export interface Banner {
  _id: string
  name: string
  headline: string
  subheadline: string
  description?: string
  imageUrl: string
  mobileImageUrl: string
  thumbnailUrl?: string
  url: string
  ctaText: string
  position: number
  isActive: boolean
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBannerInput {
  name: string
  headline: string
  subheadline: string
  description?: string
  imageUrl: string
  mobileImageUrl: string
  thumbnailUrl?: string
  url: string
  ctaText: string
  position: number
  isActive?: boolean
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
}

export interface UpdateBannerInput {
  name?: string
  headline?: string
  subheadline?: string
  description?: string
  imageUrl?: string
  mobileImageUrl?: string
  thumbnailUrl?: string
  url?: string
  ctaText?: string
  position?: number
  isActive?: boolean
  startDate?: string
  endDate?: string
  backgroundColor?: string
  textColor?: string
}

export const useBanners = () => {
  return useQuery(GET_BANNERS, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useActiveBanners = () => {
  return useQuery(GET_ACTIVE_BANNERS, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useBanner = (id: string) => {
  return useQuery(GET_BANNER, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateBanner = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }, { query: GET_ACTIVE_BANNERS }],
    onError: (error: any) => {
      console.error('Create banner error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateBanner = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }, { query: GET_ACTIVE_BANNERS }],
    onError: (error: any) => {
      console.error('Update banner error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateBannerActive = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_BANNER_ACTIVE, {
    refetchQueries: [{ query: GET_BANNERS }, { query: GET_ACTIVE_BANNERS }],
    onError: (error: any) => {
      console.error('Update banner active error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useDeleteBanner = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_BANNER, {
    refetchQueries: [{ query: GET_BANNERS }, { query: GET_ACTIVE_BANNERS }],
    onError: (error: any) => {
      console.error('Delete banner error:', error)
    }
  })

  return { mutate, loading, error }
}