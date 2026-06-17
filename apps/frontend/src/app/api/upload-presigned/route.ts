import { NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  // Derive from NEXT_PUBLIC_GRAPHQL_URL first (set to production backend in .env)
  // e.g. https://apiv3.letstryfoods.com/graphql → https://apiv3.letstryfoods.com
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/, "");
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();
  const endpoint = `${backendUrl}/files/presigned-url`;

  try {
    const body = await request.json();

    console.log("[Upload Presigned] Calling:", endpoint, body);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("[Upload Presigned] Response:", response.status, data);

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("[Upload Presigned] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
