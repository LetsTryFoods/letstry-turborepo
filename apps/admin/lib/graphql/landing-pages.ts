import { gql } from '@apollo/client'

const SECTION_FIELDS = `
  type
  title
  subtitle
  description
  imageUrl
  buttonText
  buttonLink
  productSlugs
  platformLinks {
    platform
    url
  }
  backgroundColor
  position
  isActive
`

const SEO_FIELDS = `
  metaTitle
  metaDescription
  metaKeywords
  canonicalUrl
  ogTitle
  ogDescription
  ogImage
`

const LANDING_PAGE_FIELDS = `
  _id
  slug
  title
  description
  thumbnailUrl
  isActive
  position
  sections {
    ${SECTION_FIELDS}
  }
  seo {
    ${SEO_FIELDS}
  }
  createdAt
  updatedAt
`

export const GET_LANDING_PAGES = gql`
  query GetLandingPages {
    landingPages {
      ${LANDING_PAGE_FIELDS}
    }
  }
`

export const GET_LANDING_PAGE = gql`
  query GetLandingPage($id: ID!) {
    landingPage(id: $id) {
      ${LANDING_PAGE_FIELDS}
    }
  }
`

export const CREATE_LANDING_PAGE = gql`
  mutation CreateLandingPage($input: CreateLandingPageInput!) {
    createLandingPage(input: $input) {
      ${LANDING_PAGE_FIELDS}
    }
  }
`

export const UPDATE_LANDING_PAGE = gql`
  mutation UpdateLandingPage($id: ID!, $input: UpdateLandingPageInput!) {
    updateLandingPage(id: $id, input: $input) {
      ${LANDING_PAGE_FIELDS}
    }
  }
`

export const UPDATE_LANDING_PAGE_ACTIVE = gql`
  mutation UpdateLandingPageActive($id: ID!, $isActive: Boolean!) {
    updateLandingPage(id: $id, input: { isActive: $isActive }) {
      _id
      isActive
    }
  }
`

export const DELETE_LANDING_PAGE = gql`
  mutation DeleteLandingPage($id: ID!) {
    deleteLandingPage(id: $id) {
      _id
      title
    }
  }
`
