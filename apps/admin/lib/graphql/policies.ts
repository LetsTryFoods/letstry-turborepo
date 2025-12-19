import { gql } from '@apollo/client';

export const GET_POLICIES = gql`
  query GetPolicies {
    policies {
      _id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

export const GET_POLICIES_BY_TYPE = gql`
  query GetPoliciesByType($type: String!) {
    policiesByType(type: $type) {
      _id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

export const GET_POLICY = gql`
  query GetPolicy($id: ID!) {
    policy(id: $id) {
      _id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_POLICY = gql`
  mutation CreatePolicy($input: CreatePolicyInput!) {
    createPolicy(input: $input) {
      _id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_POLICY = gql`
  mutation UpdatePolicy($id: ID!, $input: UpdatePolicyInput!) {
    updatePolicy(id: $id, input: $input) {
      _id
      title
      content
      type
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_POLICY = gql`
  mutation DeletePolicy($id: ID!) {
    deletePolicy(id: $id) {
      _id
      title
    }
  }
`;
