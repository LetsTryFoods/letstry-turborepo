import { gql } from "@apollo/client";

export const GET_ALL_CUSTOMERS = gql`
  query GetAllCustomers($input: GetCustomersInput!) {
    getAllCustomers(input: $input) {
      customers {
        _id
        identityId
        status
        phoneNumber
        firstName
        lastName
        email
        isPhoneVerified
        isEmailVerified
        lastLoginAt
        registeredAt
        lastActiveAt
        lifetimeValue
        marketingSmsOptIn
        signupSource
        ipAddress
        deviceInfo
        role
        createdAt
        updatedAt
        totalOrders
        totalSpent
        activeCartItemsCount
        displayPhone
        isGuest
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
      summary {
        totalCustomers
        totalGuests
        totalRegistered
        totalRevenue
        newThisMonth
        platformStats {
          android
          ios
          web
        }
        statusStats {
          guest
          registered
          verified
          active
          suspended
        }
      }
    }
  }
`;

export const GET_CUSTOMER_DETAILS = gql`
  query GetCustomerDetails($id: ID!) {
    getCustomerDetails(id: $id) {
      _id
      identityId
      status
      phoneNumber
      firstName
      lastName
      email
      isPhoneVerified
      isEmailVerified
      lastLoginAt
      registeredAt
      lastActiveAt
      lifetimeValue
      marketingSmsOptIn
      signupSource
      ipAddress
      deviceInfo
      lastIp
      role
      createdAt
      updatedAt
      totalOrders
      totalSpent
      isGuest
      orders
      activeCart
      addresses {
        _id
        addressType
        recipientPhone
        recipientName
        buildingName
        floor
        streetArea
        landmark
        addressLocality
        addressRegion
        postalCode
        addressCountry
        isDefault
        formattedAddress
        createdAt
      }
    }
  }
`;
