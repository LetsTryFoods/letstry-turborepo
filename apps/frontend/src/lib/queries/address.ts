import { graphql } from '@/gql';

export const SEARCH_PLACES = graphql(`
  query SearchPlaces($query: String!, $sessionToken: String) {
    searchPlaces(input: { query: $query, sessionToken: $sessionToken }) {
      placeId
      description
      mainText
      secondaryText
    }
  }
`);

export const GET_PLACE_DETAILS = graphql(`
  query GetPlaceDetails($placeId: String!, $sessionToken: String) {
    getPlaceDetails(input: { placeId: $placeId, sessionToken: $sessionToken }) {
      placeId
      formattedAddress
      streetAddress
      locality
      region
      postalCode
      country
      latitude
      longitude
    }
  }
`);

export const GET_MY_ADDRESSES = graphql(`
  query GetMyAddresses {
    myAddresses {
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
      latitude
      longitude
      formattedAddress
      placeId
    }
  }
`);

export const CREATE_ADDRESS = graphql(`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      _id
      addressType
      formattedAddress
      isDefault
    }
  }
`);

export const CHECK_PHONE_EXISTS = graphql(`
  query CheckPhoneExists($phoneNumber: String!) {
    checkPhoneExists(phoneNumber: $phoneNumber) {
      exists
      requiresLogin
      message
    }
  }
`);
