import { gql } from '@apollo/client';

export const BULK_UPSERT_PINCODES = gql`
  mutation BulkUpsertPincodes($pincodes: [PincodeInput!]!) {
    bulkUpsertPincodes(pincodes: $pincodes)
  }
`;

export const CHECK_PINCODE_SERVICEABILITY = gql`
  query CheckPincodeServiceability($pincode: String!) {
    checkPincodeServiceability(pincode: $pincode) {
      isDeliverable
      estimatedDays
      city
      state
    }
  }
`;
