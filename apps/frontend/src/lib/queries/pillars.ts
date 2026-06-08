/**
 * Frontend GraphQL queries for the Pillar collection.
 *
 * Consumed by both the CMS-driven /p/[slug] template and the
 * llms-full.txt route handler so the answer-engine context stays in
 * sync with whatever the content team publishes.
 *
 * Note: fields are inlined rather than using a shared template-literal
 * fragment because graphql-codegen-cli only parses static query strings;
 * interpolated values get dropped from the codegen output, shrinking the
 * generated types.
 */

import { gql } from "graphql-request";

export const GET_PILLAR_BY_SLUG = gql`
  query GetPillarBySlug($slug: String!) {
    pillarBySlug(slug: $slug) {
      _id
      slug
      customRoute
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

export const GET_PILLAR_BY_CUSTOM_ROUTE = gql`
  query GetPillarByCustomRoute($route: String!) {
    pillarByCustomRoute(route: $route) {
      _id
      slug
      customRoute
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
