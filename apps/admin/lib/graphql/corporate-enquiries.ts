import { gql } from '@apollo/client';

export const GET_ALL_CORPORATE_ENQUIRIES = gql`
  query GetAllCorporateEnquiries {
    getAllCorporateEnquiries {
      _id
      companyName
      name
      phone
      email
      purposeOfInquiry
      otherPurpose
      createdAt
    }
  }
`;
