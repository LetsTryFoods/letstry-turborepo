import { gql } from "@apollo/client";

export const GET_ALL_PACKERS = gql`
  query GetAllPackers($isActive: Boolean) {
    getAllPackers(isActive: $isActive) {
      id
      employeeId
      name
      phone
      email
      isActive
      totalOrdersPacked
      accuracyRate
      averagePackTime
      lastActiveAt
    }
  }
`;

export const GET_PACKER_BY_ID = gql`
  query GetPackerById($packerId: String!) {
    getPackerById(packerId: $packerId) {
      id
      employeeId
      name
      phone
      email
      isActive
      totalOrdersPacked
      accuracyRate
      averagePackTime
      lastActiveAt
    }
  }
`;

export const GET_PACKER_STATS = gql`
  query GetPackerStats($packerId: String!, $startDate: DateTime, $endDate: DateTime) {
    getPackerStats(packerId: $packerId, startDate: $startDate, endDate: $endDate) {
      packerId
      totalOrders
      accuracyRate
      averagePackTime
      ordersPackedToday
      errorsByType {
        errorType
        count
      }
    }
  }
`;

export const CREATE_PACKER = gql`
  mutation CreatePacker($input: CreatePackerInput!) {
    createPacker(input: $input) {
      packer {
        id
        employeeId
        name
        phone
        email
        isActive
        totalOrdersPacked
        accuracyRate
        averagePackTime
        lastActiveAt
      }
      generatedPassword
    }
  }
`;

export const UPDATE_PACKER = gql`
  mutation UpdatePacker($packerId: String!, $input: UpdatePackerInput!) {
    updatePacker(packerId: $packerId, input: $input) {
      id
      employeeId
      name
      phone
      email
      isActive
      totalOrdersPacked
      accuracyRate
      averagePackTime
      lastActiveAt
    }
  }
`;

export const DELETE_PACKER = gql`
  mutation DeletePacker($packerId: String!) {
    deletePacker(packerId: $packerId)
  }
`;
