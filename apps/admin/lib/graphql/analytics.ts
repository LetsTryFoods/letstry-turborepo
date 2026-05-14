import { gql } from '@apollo/client'

export const GET_QR_ANALYTICS = gql`
  query GetQrAnalytics {
    qrAnalytics {
      totalScans
      uniqueScans
      totalOSSplit {
        android
        ios
        windows
        macOS
        other
      }
      uniqueOSSplit {
        android
        ios
        windows
        macOS
        other
      }
      recentScans {
        fingerprint
        device
        os
        userAgent
        ipAddress
        location
        timesScanned
        dateTime
      }
    }
  }
`
