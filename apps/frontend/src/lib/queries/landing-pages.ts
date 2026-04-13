const LANDING_PAGE_SECTION_FIELDS = `
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
`;

const SEO_FIELDS = `
  metaTitle
  metaDescription
  metaKeywords
  canonicalUrl
  ogTitle
  ogDescription
  ogImage
`;

const LANDING_PAGE_FIELDS = `
  _id
  slug
  title
  description
  thumbnailUrl
  isActive
  position
  sections {
    ${LANDING_PAGE_SECTION_FIELDS}
  }
  seo {
    ${SEO_FIELDS}
  }
  createdAt
  updatedAt
`;

export const GET_ACTIVE_LANDING_PAGES_QUERY = `
  query GetActiveLandingPages {
    activeLandingPages {
      ${LANDING_PAGE_FIELDS}
    }
  }
`;

export const GET_LANDING_PAGE_BY_SLUG_QUERY = `
  query GetLandingPageBySlug($slug: String!) {
    landingPageBySlug(slug: $slug) {
      ${LANDING_PAGE_FIELDS}
    }
  }
`;

export const GET_PRODUCTS_BY_SLUG_LIST_QUERY = `
  query GetProductsBySlugList($slugs: [String!]!) {
    productsBySlugList(slugs: $slugs) {
      _id
      name
      slug
      defaultVariant {
        price
        mrp
        discountPercent
        thumbnailUrl
        availabilityStatus
      }
    }
  }
`;
