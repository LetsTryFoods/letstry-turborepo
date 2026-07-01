import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_DISTRIBUTOR_FORM_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { success: false, error: "Distributor form sheet not configured" },
      { status: 500 },
    );
  }

  try {
    const payload = await request.json();

    console.log("[Distributor Form] Sending to Google Sheets:", JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    console.log("[Distributor Form] Response status:", response.status);

    const data = await response.json();
    console.log("[Distributor Form] Response:", JSON.stringify(data));

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Distributor Form] Error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
