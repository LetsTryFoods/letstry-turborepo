import { gql } from '@apollo/client'

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password)
  }
`

export const ADMIN_REGISTER = gql`
  mutation AdminRegister($email: String!, $password: String!) {
    createAdmin(email: $email, password: $password)
  }
`