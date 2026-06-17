import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_COMPLAINT_TRACKER_URL;
  if (!apiUrl) {
    return NextResponse.json({ success: false, error: "Tracker not configured" }, { status: 500 });
  }

  try {
    const payload = await request.json();

    console.log("[Complaint Tracker] Sending to Google Sheets:", JSON.stringify(payload));

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    console.log("[Complaint Tracker] Response status:", response.status);

    const data = await response.json();
    console.log("[Complaint Tracker] Response:", JSON.stringify(data));

    return NextResponse.json(data);
  } catch (err) {
    console.error("[Complaint Tracker] Error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
