import { graphql } from "@/gql";

export const CHECK_PINCODE_SERVICEABILITY = graphql(`
  query CheckPincodeServiceability($pincode: String!) {
    checkPincodeServiceability(pincode: $pincode) {
      isDeliverable
      estimatedDays
      city
      state
    }
  }
`);
