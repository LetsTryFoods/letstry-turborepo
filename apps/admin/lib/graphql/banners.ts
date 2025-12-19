import { gql } from '@apollo/client'

export const GET_BANNERS = gql`
  query GetBanners {
    banners {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      thumbnailUrl
      url
      ctaText
      position
      isActive
      startDate
      endDate
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`

export const GET_ACTIVE_BANNERS = gql`
  query GetActiveBanners {
    activeBanners {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      thumbnailUrl
      url
      ctaText
      position
      isActive
      startDate
      endDate
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`

export const GET_BANNER = gql`
  query GetBanner($id: ID!) {
    banner(id: $id) {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      thumbnailUrl
      url
      ctaText
      position
      isActive
      startDate
      endDate
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`

export const CREATE_BANNER = gql`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      thumbnailUrl
      url
      ctaText
      position
      isActive
      startDate
      endDate
      backgroundColor
      textColor
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_BANNER = gql`
  mutation UpdateBanner($id: ID!, $input: UpdateBannerInput!) {
    updateBanner(id: $id, input: $input) {
      _id
    }
  }
`

export const UPDATE_BANNER_ACTIVE = gql`
  mutation UpdateBannerActive($id: ID!, $isActive: Boolean!) {
    updateBanner(id: $id, input: { isActive: $isActive }) {
      _id
      isActive
    }
  }
`

export const DELETE_BANNER = gql`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(id: $id) {
      _id
      name
    }
  }
`