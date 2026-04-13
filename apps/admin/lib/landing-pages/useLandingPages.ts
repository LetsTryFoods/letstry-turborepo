import { useMutation, useQuery } from '@apollo/client/react'
import {
  GET_LANDING_PAGES,
  GET_LANDING_PAGE,
  CREATE_LANDING_PAGE,
  UPDATE_LANDING_PAGE,
  UPDATE_LANDING_PAGE_ACTIVE,
  DELETE_LANDING_PAGE,
} from '@/lib/graphql/landing-pages'

export interface SectionPlatformLink {
  platform: string
  url: string
}

export interface LandingPageSection {
  type: string
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  buttonText?: string
  buttonLink?: string
  productSlugs: string[]
  platformLinks: SectionPlatformLink[]
  backgroundColor?: string
  position: number
  isActive: boolean
}

export interface LandingPageSeo {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

export interface LandingPage {
  _id: string
  slug: string
  title: string
  description?: string
  thumbnailUrl?: string
  sections: LandingPageSection[]
  seo?: LandingPageSeo
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export const useLandingPages = () => {
  return useQuery(GET_LANDING_PAGES, { fetchPolicy: 'cache-and-network' })
}

export const useLandingPage = (id: string) => {
  return useQuery(GET_LANDING_PAGE, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  })
}

export const useCreateLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(CREATE_LANDING_PAGE, {
    refetchQueries: [{ query: GET_LANDING_PAGES }],
  })
  return { mutate, loading, error }
}

export const useUpdateLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_LANDING_PAGE, {
    refetchQueries: [{ query: GET_LANDING_PAGES }],
  })
  return { mutate, loading, error }
}

export const useUpdateLandingPageActive = () => {
  const [mutate, { loading, error }] = useMutation(UPDATE_LANDING_PAGE_ACTIVE, {
    refetchQueries: [{ query: GET_LANDING_PAGES }],
  })
  return { mutate, loading, error }
}

export const useDeleteLandingPage = () => {
  const [mutate, { loading, error }] = useMutation(DELETE_LANDING_PAGE, {
    refetchQueries: [{ query: GET_LANDING_PAGES }],
  })
  return { mutate, loading, error }
}
