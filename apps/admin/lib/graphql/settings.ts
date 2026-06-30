import { gql } from '@apollo/client';

export const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings {
    getGlobalSettings {
      _id
      isPackerScanBypassEnabled
      minAppVersionAndroid
      minAppVersionIos
    }
  }
`;

export const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings(
    $isPackerScanBypassEnabled: Boolean!
    $minAppVersionAndroid: String
    $minAppVersionIos: String
  ) {
    updateGlobalSettings(
      isPackerScanBypassEnabled: $isPackerScanBypassEnabled
      minAppVersionAndroid: $minAppVersionAndroid
      minAppVersionIos: $minAppVersionIos
    ) {
      _id
      isPackerScanBypassEnabled
      minAppVersionAndroid
      minAppVersionIos
    }
  }
`;
