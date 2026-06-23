import { gql } from '@apollo/client';

export const GET_ALL_BOX_SIZES = gql`
  query GetAllBoxSizes {
    getAllBoxSizes {
      id
      code
      name
      internalDimensions {
        l
        w
        h
      }
      type
      chargeableWeight
      fixedCourierCost
      lengthInches
      breadthInches
      heightInches
      lengthCm
      breadthCm
      heightCm
      maxWeight
      cost
      isActive
      photos
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACTIVE_BOX_SIZES = gql`
  query GetActiveBoxSizes {
    getActiveBoxSizes {
      id
      code
      name
      type
      chargeableWeight
      fixedCourierCost
      lengthInches
      breadthInches
      heightInches
      lengthCm
      breadthCm
      heightCm
      maxWeight
      cost
      isActive
      photos
    }
  }
`;
