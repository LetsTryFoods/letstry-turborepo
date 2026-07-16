import { graphqlClient } from "@/lib/graphql/client-factory";

const SUBMIT_CONTACT_MESSAGE_MUTATION = `
  mutation SubmitContactMessage($input: SubmitContactInput!) {
    submitContactMessage(input: $input) {
      success
      message
      contactId
    }
  }
`;


export type SubmitContactInput = {
  name: string;
  phone: string;
  email: string;
  queryType: string;
  orderId?: string;
  productNames?: string[];
  imageUrls?: string[];
  message: string;
};

const QUERY_TYPE_LABELS: Record<string, string> = {
  GENERAL: "General Inquiry",
  ORDER_ISSUE: "Order Issue",
  PRODUCT_INQUIRY: "Product Inquiry",
  COMPLAINT: "Complaint",
  FEEDBACK: "Feedback",
  RETURN_REQUEST: "Return Request",
};

export async function submitContactMessage(
  input: SubmitContactInput
): Promise<{ success: boolean; message: string }> {

  // ── API CALL 1: Save to backend (MongoDB via GraphQL) ────────────────────
  console.log("[Contact] Calling backend GraphQL API...");
  const data = (await graphqlClient.request(SUBMIT_CONTACT_MESSAGE_MUTATION, {
    input,
  })) as { submitContactMessage: { success: boolean; message: string } };
  const result = data.submitContactMessage;
  console.log("[Contact] Backend response:", result);

  if (!result.success) return result;

  // ── API CALL 2: Send to Google Sheets ────────────────────────────────────
  const googleSheetsUrl = process.env.NEXT_PUBLIC_COMPLAINT_TRACKER_URL;
  console.log("[Contact] Google Sheets URL:", googleSheetsUrl);

  if (!googleSheetsUrl) {
    console.warn("[Contact] NEXT_PUBLIC_COMPLAINT_TRACKER_URL not set — skipping Google Sheets");
    return result;
  }

  const queryTypeLabel = QUERY_TYPE_LABELS[input.queryType] || input.queryType;
  const googleSheetsPayload = {
    customer_name: input.name,
    contact: `${input.email} | ${input.phone}`,
    platform: "Website",
    product: input.productNames || [],
    description: [
      `Query Type: ${queryTypeLabel}`,
      input.orderId ? `Order ID: ${input.orderId}` : null,
      "",
      input.message,
    ]
      .filter(Boolean)
      .join("\n"),
    images: input.imageUrls || [],
  };

  console.log("[Contact] Sending to Google Sheets payload:", googleSheetsPayload);

  try {
    const sheetsResponse = await fetch("/api/complaint-tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleSheetsPayload),
    });
    const sheetsData = await sheetsResponse.json();
    console.log("[Contact] Google Sheets response:", sheetsData);

    if (sheetsData.success) {
      console.log("[Contact] Google Sheets saved. ID:", sheetsData.id);
    } else {
      console.error("[Contact] Google Sheets failed:", sheetsData.error);
    }
  } catch (err) {
    console.error("[Contact] Google Sheets network error:", err);
  }

  return result;
}
