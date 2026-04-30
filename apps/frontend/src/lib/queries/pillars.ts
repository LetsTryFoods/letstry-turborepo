/**
 * Frontend GraphQL queries for the Pillar collection.
 *
 * Consumed by both the CMS-driven /p/[slug] template and the
 * llms-full.txt route handler so the answer-engine context stays in
 * sync with whatever the content team publishes.
 */

import { gql } from 'graphql-request';

export const GET_PILLAR_BY_SLUG = gql`
  query GetPillarBySlug($slug: String!) {
    pillarBySlug(slug: $slug) {
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
      }
    }
  }
`;

export const GET_ACTIVE_PILLARS = gql`
  query GetActivePillars {
    activePillars {
      _id
      slug
      title
      intro
      isActive
      position
    }
  }
`;
