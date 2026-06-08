import { gql } from '@apollo/client';

export const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings {
    getGlobalSettings {
      _id
      isPackerScanBypassEnabled
    }
  }
`;

export const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings($isPackerScanBypassEnabled: Boolean!) {
    updateGlobalSettings(isPackerScanBypassEnabled: $isPackerScanBypassEnabled) {
      _id
      isPackerScanBypassEnabled
    }
  }
`;
