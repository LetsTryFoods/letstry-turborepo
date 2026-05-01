import { gql } from "@apollo/client";

const PILLAR_FIELDS = `
  _id
  slug
  title
  intro
  heroImageUrl
  categoryTiles {
    categorySlug
    name
    blurb
  }
  featuredProductIds
  sections {
    heading
    body
    speakable
    featuredProductIds
  }
  faqs {
    question
    answer
  }
  relatedPillarSlugs
  isActive
  position
  seo {
    metaTitle
    metaDescription
    metaKeywords
    canonicalUrl
    ogTitle
    ogDescription
    ogImage
    twitterCard
    twitterTitle
    twitterDescription
    twitterImage
    robots
    internalNote
  }
  createdAt
  updatedAt
`;

export const GET_PILLARS = gql`
  query GetPillars {
    pillars {
      ${PILLAR_FIELDS}
    }
  }
`;

export const GET_ACTIVE_PILLARS = gql`
  query GetActivePillars {
    activePillars {
      ${PILLAR_FIELDS}
    }
  }
`;

export const GET_PILLAR = gql`
  query GetPillar($id: ID!) {
    pillar(id: $id) {
      ${PILLAR_FIELDS}
    }
  }
`;

export const GET_PILLAR_BY_SLUG = gql`
  query GetPillarBySlug($slug: String!) {
    pillarBySlug(slug: $slug) {
      ${PILLAR_FIELDS}
    }
  }
`;

export const CREATE_PILLAR = gql`
  mutation CreatePillar($input: CreatePillarInput!) {
    createPillar(input: $input) {
      ${PILLAR_FIELDS}
    }
  }
`;

export const UPDATE_PILLAR = gql`
  mutation UpdatePillar($id: ID!, $input: UpdatePillarInput!) {
    updatePillar(id: $id, input: $input) {
      ${PILLAR_FIELDS}
    }
  }
`;

export const REMOVE_PILLAR = gql`
  mutation RemovePillar($id: ID!) {
    removePillar(id: $id) {
      _id
      slug
    }
  }
`;
