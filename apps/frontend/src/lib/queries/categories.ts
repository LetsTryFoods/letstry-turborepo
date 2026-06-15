import { graphql } from "@/gql";

export const GET_ROOT_CATEGORIES = graphql(`
  query GetRootCategories(
    $pagination: PaginationInput
    $includeArchived: Boolean
  ) {
    rootCategories(pagination: $pagination, includeArchived: $includeArchived) {
      items {
        id
        name
        slug
        imageUrl
        favourite
      }
      meta {
        totalCount
        totalPages
        page
        limit
        hasNextPage
        hasPreviousPage
      }
    }
  }
`);

export const GET_CATEGORY_WITH_PRODUCTS = graphql(`
  query GetCategoryWithProducts($id: ID!, $includeArchived: Boolean) {
    category(id: $id, includeArchived: $includeArchived) {
      id
      name
      slug
      description
      imageUrl
      codeValue
      inCodeSet
      productCount
      isArchived
      favourite
      products {
        _id
        name
        slug
        brand
        defaultVariant {
          sku
          price
          mrp
          discountPercent
          thumbnailUrl
          availabilityStatus
          stockQuantity
        }
        availableVariants {
          _id
          sku
          price
          mrp
          packageSize
          weight
          weightUnit
          availabilityStatus
        }
      }
      createdAt
      updatedAt
    }
  }
`);

export const GET_CATEGORY_BY_SLUG = graphql(`
  query GetCategoryBySlug($slug: String!, $includeArchived: Boolean) {
    categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
      id
      name
      slug
      description
      productCount
      imageUrl
      seo {
        metaTitle
        metaDescription
        metaKeywords
        canonicalUrl
        ogTitle
        ogDescription
        ogImage
      }
      products {
        _id
        name
        slug
        defaultVariant {
          thumbnailUrl
          price
          mrp
          packageSize
          availabilityStatus
        }
        availableVariants {
          _id
          sku
          price
          mrp
          packageSize
          weight
          weightUnit
          availabilityStatus
        }
        tags
      }
    }
  }
`);

export const GET_CATEGORY_WITH_CHILDREN = graphql(`
  query GetCategoryWithChildren($slug: String!, $includeArchived: Boolean) {
    categoryBySlug(slug: $slug, includeArchived: $includeArchived) {
      id
      name
      slug
      imageUrl
      children {
        id
        name
        slug
        imageUrl
        productCount
      }
    }
  }
`);
