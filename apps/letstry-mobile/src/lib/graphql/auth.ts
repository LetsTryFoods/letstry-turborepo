import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      _id
      firstName
      lastName
      email
      phoneNumber
      role
    }
  }
`;

export const SEND_OTP = gql`
  mutation SendOtp($phoneNumber: String!) {
    sendOtp(phoneNumber: $phoneNumber)
  }
`;

export const VERIFY_OTP_AND_LOGIN = gql`
  mutation VerifyOtpAndLogin($idToken: String!, $input: CreateUserInput) {
    verifyOtpAndLogin(idToken: $idToken, input: $input)
  }
`;

export const VERIFY_WHATSAPP_OTP = gql`
  mutation VerifyWhatsAppOtp($phoneNumber: String!, $otp: String!, $input: CreateUserInput) {
    verifyWhatsAppOtp(phoneNumber: $phoneNumber, otp: $otp, input: $input)
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
