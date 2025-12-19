import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_FOOTER_DETAILS,
  GET_FOOTER_DETAIL,
  CREATE_FOOTER_DETAIL,
  UPDATE_FOOTER_DETAIL,
  DELETE_FOOTER_DETAIL
} from '@/lib/graphql/footer'

export interface SocialMediaLink {
  platform: string
  url: string
  iconUrl: string
}

export interface FooterDetail {
  _id: string
  logoUrl: string
  companyName: string
  cin: string
  address: string
  email: string
  phone: string
  exportEmail: string
  socialMediaTitle: string
  socialMediaLinks: SocialMediaLink[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFooterDetailInput {
  logoUrl?: string
  companyName: string
  cin: string
  address: string
  email: string
  phone: string
  exportEmail?: string
  socialMediaTitle?: string
  socialMediaLinks?: SocialMediaLink[]
  isActive?: boolean
}

export interface UpdateFooterDetailInput {
  logoUrl?: string
  companyName?: string
  cin?: string
  address?: string
  email?: string
  phone?: string
  exportEmail?: string
  socialMediaTitle?: string
  socialMediaLinks?: SocialMediaLink[]
  isActive?: boolean
}

export const useFooterDetails = () => {
  return useQuery(GET_FOOTER_DETAILS, {
    fetchPolicy: 'cache-and-network',
  })
}

export const useFooterDetail = (id: string) => {
  return useQuery(GET_FOOTER_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateFooterDetail = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_FOOTER_DETAIL, {
    refetchQueries: ['GetFooterDetails'],
    onError: (error: any) => {
      console.error('Create footer detail error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useUpdateFooterDetail = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_FOOTER_DETAIL, {
    refetchQueries: ['GetFooterDetails'],
    onError: (error: any) => {
      console.error('Update footer detail error:', error)
    }
  })

  return { mutate, loading, error }
}

export const useDeleteFooterDetail = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_FOOTER_DETAIL, {
    refetchQueries: ['GetFooterDetails'],
    onError: (error: any) => {
      console.error('Delete footer detail error:', error)
    }
  })

  return { mutate, loading, error }
}
