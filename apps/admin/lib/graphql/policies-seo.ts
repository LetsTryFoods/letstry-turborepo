import { gql } from "@apollo/client";

export const GET_POLICIES_WITH_SEO = gql`
  query GetPoliciesWithSeo {
    policies {
      _id
      title
      type
      seo {
        _id
        policyId
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_POLICY_SEO = gql`
  query GetPolicySeo($policyId: ID!) {
    policySeo(policyId: $policyId) {
      _id
      policyId
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POLICY_SEO = gql`
  mutation UpdatePolicySeo($policyId: ID!, $input: PolicySeoInput!) {
    updatePolicySeo(policyId: $policyId, input: $input) {
      _id
      policyId
      metaTitle
      metaDescription
      metaKeywords
      canonicalUrl
      ogTitle
      ogDescription
      ogImage
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POLICY_SEO = gql`
  mutation DeletePolicySeo($policyId: ID!) {
    deletePolicySeo(policyId: $policyId)
  }
`;
