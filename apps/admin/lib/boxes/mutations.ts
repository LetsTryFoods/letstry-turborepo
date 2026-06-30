import { gql } from '@apollo/client';

export const CREATE_BOX_SIZE = gql`
  mutation CreateBoxSize($input: CreateBoxSizeInput!) {
    createBoxSize(input: $input) {
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
      isActive
      photos
    }
  }
`;

export const UPDATE_BOX_SIZE = gql`
  mutation UpdateBoxSize($boxId: String!, $input: UpdateBoxSizeInput!) {
    updateBoxSize(boxId: $boxId, input: $input) {
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
      isActive
      photos
    }
  }
`;

export const DELETE_BOX_SIZE = gql`
  mutation DeleteBoxSize($boxId: String!) {
    deleteBoxSize(boxId: $boxId) {
      id
    }
  }
`;
