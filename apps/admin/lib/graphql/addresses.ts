import { gql } from '@apollo/client'

export const GET_ADDRESSES = gql`
  query GetAddresses($pagination: PaginationInput!) {
    manufacturingAddresses(pagination: $pagination) {
      items {
        _id
        batchCode
        addressHeading
        subAddressHeading
        fssaiLicenseNumber
        isActive
        createdAt
        updatedAt
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_ADDRESS = gql`
  query GetAddress($id: ID!) {
    manufacturingAddress(id: $id) {
      _id
      batchCode
      addressHeading
      subAddressHeading
      fssaiLicenseNumber
      isActive
      createdAt
      updatedAt
    }
  }
`

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateManufacturingAddressInput!) {
    createManufacturingAddress(input: $input) {
      _id
      batchCode
      addressHeading
      subAddressHeading
      fssaiLicenseNumber
      isActive
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $input: UpdateManufacturingAddressInput!) {
    updateManufacturingAddress(id: $id, input: $input) {
      _id
      batchCode
      addressHeading
      subAddressHeading
      fssaiLicenseNumber
      isActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($id: ID!) {
    deleteManufacturingAddress(id: $id) {
      _id
      batchCode
    }
  }
`
