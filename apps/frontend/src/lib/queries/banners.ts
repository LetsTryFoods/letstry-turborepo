import { graphql } from '@/gql';

export const GET_ACTIVE_BANNERS = graphql(`
  query GetActiveBanners {
    activeBanners {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      thumbnailUrl
      url
      ctaText
      position
      isActive
      startDate
      endDate
      backgroundColor
      textColor
    }
  }
`);
