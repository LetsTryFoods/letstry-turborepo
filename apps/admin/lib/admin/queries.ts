import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

export const GET_ADMINS = gql`
  query GetAdmins {
    admins {
      _id
      email
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ADMIN = gql`
  mutation CreateAdmin($email: String!, $password: String!) {
    createAdmin(email: $email, password: $password)
  }
`;

export interface Admin {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAdminsData {
  admins: Admin[];
}

export function useAdmins() {
  return useQuery<GetAdminsData>(GET_ADMINS);
}

export function useCreateAdmin() {
  const [createAdmin, { loading, error }] = useMutation(CREATE_ADMIN, {
    refetchQueries: [{ query: GET_ADMINS }],
  });
  return { createAdmin, loading, error };
}
