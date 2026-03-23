import { gql } from '@apollo/client'

export const GET_TRACKING_ANALYTICS = gql`
  query GetTrackingAnalytics($startDate: String, $endDate: String, $limit: Int) {
    getTrackingAnalytics(startDate: $startDate, endDate: $endDate, limit: $limit) {
      totalSearches
      successfulSearches
      successRate
      searchTypeBreakdown {
        _id
        count
      }
      recentSearches {
        id
        searchQuery
        searchType
        foundResult
        createdAt
        userAgent
        ipAddress
      }
    }
  }
`;