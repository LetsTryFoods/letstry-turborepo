import { graphql } from "@/gql";

export const GET_POLICIES_BY_TYPE = graphql(`
  query GetPoliciesByType($type: String!) {
    policiesByType(type: $type) {
      _id
      title
      content
      type
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      createdAt
      updatedAt
    }
  }
`);
