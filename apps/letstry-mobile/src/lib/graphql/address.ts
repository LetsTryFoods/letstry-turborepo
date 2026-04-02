import { gql } from '@apollo/client';

export const GET_MY_ADDRESSES = gql`
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
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createAddress(input: $input) {
      _id
      addressType
      addressLocality
      postalCode
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: UpdateAddressInput!) {
    updateAddress(id: $id, input: $input) {
      _id
    }
  }
`;

export const REVERSE_GEOCODE = gql`
  query ReverseGeocode($input: ReverseGeocodeInput!) {
    reverseGeocode(input: $input) {
      formattedAddress
      locality
      region
      country
      postalCode
      latitude
      longitude
    }
  }
`;

export const SEARCH_PLACES = gql`
  query SearchPlaces($input: SearchPlacesInput!) {
    searchPlaces(input: $input) {
      placeId
      description
      mainText
      secondaryText
    }
  }
`;

export const GET_PLACE_DETAILS = gql`
  query GetPlaceDetails($input: PlaceDetailsInput!) {
    getPlaceDetails(input: $input) {
      latitude
      longitude
      formattedAddress
    }
  }
`;
