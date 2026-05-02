const TILE_FIELDS = `
  name
  blurb
  imageUrl
  shopNowUrl
  position
`;

const FAQ_FIELDS = `
  question
  answer
  position
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
`;

export const GET_CATEGORY_LANDING_PAGE_BY_SLUG = `
  query GetCategoryLandingPageBySlug($slug: String!) {
    categoryLandingPageBySlug(slug: $slug) {
      ${CATEGORY_LANDING_PAGE_FIELDS}
    }
  }
`;
