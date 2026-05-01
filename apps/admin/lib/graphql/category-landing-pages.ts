import { gql } from '@apollo/client'

const TILE_FIELDS = `
  name
  blurb
  imageUrl
  shopNowUrl
  position
`

const FAQ_FIELDS = `
  question
  answer
  position
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

const CATEGORY_LANDING_PAGE_FIELDS = `
  _id
  slug
  pageTitle
  description
  tilesHeading
  faqHeading
  tiles {
    ${TILE_FIELDS}
  }
  faqs {
    ${FAQ_FIELDS}
  }
  seo {
    ${SEO_FIELDS}
  }
  isActive
  createdAt
  updatedAt
`

export const GET_CATEGORY_LANDING_PAGES = gql`
  query GetCategoryLandingPages {
    categoryLandingPages {
      ${CATEGORY_LANDING_PAGE_FIELDS}
    }
  }
`

export const GET_CATEGORY_LANDING_PAGE = gql`
  query GetCategoryLandingPage($id: ID!) {
    categoryLandingPage(id: $id) {
      ${CATEGORY_LANDING_PAGE_FIELDS}
    }
  }
`

export const CREATE_CATEGORY_LANDING_PAGE = gql`
  mutation CreateCategoryLandingPage($input: CreateCategoryLandingPageInput!) {
    createCategoryLandingPage(input: $input) {
      ${CATEGORY_LANDING_PAGE_FIELDS}
    }
  }
`

export const UPDATE_CATEGORY_LANDING_PAGE = gql`
  mutation UpdateCategoryLandingPage($id: ID!, $input: UpdateCategoryLandingPageInput!) {
    updateCategoryLandingPage(id: $id, input: $input) {
      ${CATEGORY_LANDING_PAGE_FIELDS}
    }
  }
`

export const UPDATE_CATEGORY_LANDING_PAGE_ACTIVE = gql`
  mutation UpdateCategoryLandingPageActive($id: ID!, $isActive: Boolean!) {
    updateCategoryLandingPage(id: $id, input: { isActive: $isActive }) {
      _id
      isActive
    }
  }
`

export const DELETE_CATEGORY_LANDING_PAGE = gql`
  mutation DeleteCategoryLandingPage($id: ID!) {
    deleteCategoryLandingPage(id: $id) {
      _id
      pageTitle
    }
  }
`
