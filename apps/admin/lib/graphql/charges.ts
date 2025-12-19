import { gql } from '@apollo/client'

export const GET_CHARGES = gql`
  query GetCharges {
    charges {
      _id
      active
      handlingCharge
      gstPercentage
      freeDeliveryThreshold
      deliveryDelhiBelowThreshold
      deliveryRestBelowThreshold
    }
  }
`

export const CREATE_OR_UPDATE_CHARGES = gql`
  mutation CreateOrUpdateCharges($input: CreateChargesInput!) {
    createOrUpdateCharges(input: $input) {
      _id
      active
      handlingCharge
      gstPercentage
      freeDeliveryThreshold
      deliveryDelhiBelowThreshold
      deliveryRestBelowThreshold
    }
  }
`
