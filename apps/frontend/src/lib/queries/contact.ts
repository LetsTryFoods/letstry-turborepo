import { graphqlClient } from '@/lib/graphql/client-factory';

const SUBMIT_CONTACT_MESSAGE_MUTATION = `
  mutation SubmitContactMessage($input: SubmitContactInput!) {
    submitContactMessage(input: $input) {
      success
      message
    }
  }
`;

export interface SubmitContactInput {
  name: string;
  phone: string;
  message: string;
}

export async function submitContactMessage(
  input: SubmitContactInput,
): Promise<{ success: boolean; message: string }> {
  const data = await graphqlClient.request(SUBMIT_CONTACT_MESSAGE_MUTATION, { input }) as {
    submitContactMessage: { success: boolean; message: string };
  };
  return data.submitContactMessage;
}
