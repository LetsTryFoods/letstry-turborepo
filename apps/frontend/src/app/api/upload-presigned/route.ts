import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  try {
    const body = await request.json();

    const response = await fetch(`${backendUrl}/files/presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[Upload Presigned] Error:", err);
    return NextResponse.json({ error: "Failed to get upload URL" }, { status: 500 });
  }
}
