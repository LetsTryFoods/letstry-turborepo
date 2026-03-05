import { graphqlClient } from '@/lib/graphql/client-factory';

const SUBMIT_CORPORATE_ENQUIRY_MUTATION = `
  mutation SubmitCorporateEnquiry($input: SubmitCorporateEnquiryInput!) {
    submitCorporateEnquiry(input: $input) {
      success
      message
    }
  }
`;

export interface CorporateEnquiryInput {
    companyName?: string;
    name: string;
    phone: string;
    email: string;
    purposeOfInquiry: string;
    otherPurpose?: string;
}

export async function submitCorporateEnquiry(
    input: CorporateEnquiryInput,
): Promise<{ success: boolean; message: string }> {
    const data = await graphqlClient.request(SUBMIT_CORPORATE_ENQUIRY_MUTATION, { input }) as {
        submitCorporateEnquiry: { success: boolean; message: string };
    };
    return data.submitCorporateEnquiry;
}
