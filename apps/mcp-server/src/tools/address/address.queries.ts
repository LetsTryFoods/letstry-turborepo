import { gql } from 'graphql-request';

export const MY_ADDRESSES_QUERY = gql`
  query MyAddresses {
    myAddresses {
      _id
      addressType
      recipientName
      recipientPhone
      buildingName
      floor
      streetArea
      landmark
      addressLocality
      addressRegion
      postalCode
      addressCountry
      formattedAddress
      isDefault
      latitude
      longitude
    }
  }
`;
