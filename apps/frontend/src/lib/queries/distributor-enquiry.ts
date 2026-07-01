export interface DistributorEnquiryInput {
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNo: string;
  fssaiNo: string;
  location: string;
  totalVehicles: string;
  manpower: string;
  godownSpaceSqft: string;
  annualTurnover: string;
  currentCompany: string;
}

export async function submitDistributorEnquiry(
  input: DistributorEnquiryInput,
): Promise<{ success: boolean; error?: string }> {
  const response = await fetch("/api/distributor-form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Failed to submit enquiry");
  }

  return data;
}
