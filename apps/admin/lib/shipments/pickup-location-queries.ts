import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

export const GET_PICKUP_LOCATIONS = gql`
  query GetPickupLocations {
    getPickupLocations {
      _id
      name
      phone
      addressLine1
      addressLine2
      city
      state
      pincode
      country
      isDefault
      provider
    }
  }
`;

export const CREATE_PICKUP_LOCATION = gql`
  mutation CreatePickupLocation($input: CreatePickupLocationInput!) {
    createPickupLocation(input: $input) {
      _id
      name
      phone
      addressLine1
      city
      state
      pincode
      country
      provider
    }
  }
`;

export const REMOVE_PICKUP_LOCATION = gql`
  mutation RemovePickupLocation($id: String!) {
    removePickupLocation(id: $id)
  }
`;

export interface PickupLocation {
  _id: string;
  name: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
  provider?: string;
}

export function usePickupLocations() {
  const { data, loading, error, refetch } = useQuery(GET_PICKUP_LOCATIONS, {
    fetchPolicy: 'network-only',
  });

  return {
    pickupLocations: (data?.getPickupLocations || []) as PickupLocation[],
    loading,
    error,
    refetch,
  };
}

export function useCreatePickupLocation() {
  const [createPickupLocation, { loading, error }] = useMutation(CREATE_PICKUP_LOCATION, {
    refetchQueries: [{ query: GET_PICKUP_LOCATIONS }],
  });

  return {
    createPickupLocation: async (input: Omit<PickupLocation, '_id'>) => {
      return createPickupLocation({ variables: { input } });
    },
    loading,
    error,
  };
}

export function useRemovePickupLocation() {
  const [removePickupLocation, { loading, error }] = useMutation(REMOVE_PICKUP_LOCATION, {
    refetchQueries: [{ query: GET_PICKUP_LOCATIONS }],
  });

  return {
    removePickupLocation: async (id: string) => {
      return removePickupLocation({ variables: { id } });
    },
    loading,
    error,
  };
}
