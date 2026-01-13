import { gql } from "@apollo/client";

// Fragment for variant fields
const VARIANT_FIELDS = `
  _id
  sku
  name
  price
  mrp
  discountPercent
  discountSource
  weight
  weightUnit
  packageSize
  length
  height
  breadth
  stockQuantity
  availabilityStatus
  images {
    url
    alt
  }
  thumbnailUrl
  isDefault
  isActive
`;

// Fragment for SEO fields
const SEO_FIELDS = `
  _id
  productId
  metaTitle
  metaDescription
  metaKeywords
  canonicalUrl
  ogTitle
  ogDescription
  ogImage
  createdAt
  updatedAt
`;

export const GET_PRODUCTS = gql`
  query GetProducts($pagination: PaginationInput, $includeOutOfStock: Boolean, $includeArchived: Boolean) {
    products(pagination: $pagination, includeOutOfStock: $includeOutOfStock, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        categoryIds
        brand
        gtin
        mpn
        currency
        ingredients
        allergens
        shelfLife
        isVegetarian
        isGlutenFree
        variants {
          ${VARIANT_FIELDS}
        }
        rating
        ratingCount
        keywords
        tags
        isArchived
        favourite
        createdAt
        updatedAt
        category {
          _id
          name
          slug
        }
        defaultVariant {
          ${VARIANT_FIELDS}
        }
        priceRange {
          min
          max
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Product query for SEO page - includes SEO field and minimal info needed
export const GET_PRODUCTS_FOR_SEO = gql`
  query GetProductsForSeo($pagination: PaginationInput, $includeOutOfStock: Boolean) {
    products(pagination: $pagination, includeOutOfStock: $includeOutOfStock) {
      items {
        _id
        name
        slug
        description
        brand
        isArchived
        category {
          _id
          name
          slug
        }
        seo {
          ${SEO_FIELDS}
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

// Update product SEO via updateProduct mutation
export const UPDATE_PRODUCT_SEO = gql`
  mutation UpdateProductSeo($_id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $_id, input: $input) {
      _id
      name
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($_id: ID!) {
    product(id: $_id) {
      _id
      name
      slug
      description
      categoryIds
      brand
      gtin
      mpn
      currency
      ingredients
      allergens
      shelfLife
      isVegetarian
      isGlutenFree
      variants {
        ${VARIANT_FIELDS}
      }
      rating
      ratingCount
      keywords
      tags
      isArchived
      favourite
      createdAt
      updatedAt
      category {
        _id
        name
        slug
      }
      defaultVariant {
        ${VARIANT_FIELDS}
      }
      priceRange {
        min
        max
      }
      availableVariants {
        ${VARIANT_FIELDS}
      }
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      _id
      name
      slug
      description
      categoryIds
      brand
      gtin
      mpn
      currency
      ingredients
      allergens
      shelfLife
      isVegetarian
      isGlutenFree
      variants {
        ${VARIANT_FIELDS}
      }
      rating
      ratingCount
      keywords
      tags
      isArchived
      favourite
      createdAt
      updatedAt
      category {
        _id
        name
        slug
      }
      defaultVariant {
        ${VARIANT_FIELDS}
      }
      priceRange {
        min
        max
      }
      availableVariants {
        ${VARIANT_FIELDS}
      }
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!, $pagination: PaginationInput) {
    productsByCategory(categoryId: $categoryId, pagination: $pagination) {
      items {
        _id
        name
        slug
        description
        categoryIds
        brand
        gtin
        mpn
        currency
        ingredients
        allergens
        shelfLife
        isVegetarian
        isGlutenFree
        variants {
          ${VARIANT_FIELDS}
        }
        rating
        ratingCount
        keywords
        tags
        isArchived
        favourite
        createdAt
        updatedAt
        category {
          _id
          name
          slug
        }
        defaultVariant {
          ${VARIANT_FIELDS}
        }
        priceRange {
          min
          max
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($searchTerm: String!, $pagination: PaginationInput) {
    searchProducts(searchTerm: $searchTerm, pagination: $pagination) {
      items {
        _id
        name
        slug
        description
        categoryIds
        brand
        currency
        isArchived
        favourite
        createdAt
        updatedAt
        defaultVariant {
          ${VARIANT_FIELDS}
        }
        priceRange {
          min
          max
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      _id
      name
      slug
      description
      categoryIds
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($_id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $_id, input: $input) {
      _id
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($_id: ID!) {
    deleteProduct(id: $_id) {
      _id
      name
    }
  }
`;

export const ARCHIVE_PRODUCT = gql`
  mutation ArchiveProduct($_id: ID!) {
    archiveProduct(id: $_id) {
      _id
      name
      isArchived
    }
  }
`;

export const UNARCHIVE_PRODUCT = gql`
  mutation UnarchiveProduct($_id: ID!) {
    unarchiveProduct(id: $_id) {
      _id
      name
      isArchived
    }
  }
`;

export const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($_id: ID!, $quantity: Int!) {
    updateProductStock(id: $_id, quantity: $quantity) {
      _id
      name
      stockQuantity
      availabilityStatus
    }
  }
`;
