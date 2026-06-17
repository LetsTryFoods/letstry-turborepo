import { NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/, "");
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "upload";
    const contentType =
      searchParams.get("contentType") ||
      request.headers.get("content-type") ||
      "application/octet-stream";

    console.log("[Upload Image] filename:", filename, "contentType:", contentType);

    // Step 1: get Cloudflare R2 presigned URL from backend (server→server, no CORS)
    const presignedRes = await fetch(`${backendUrl}/files/presigned-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, contentType }),
    });
    if (!presignedRes.ok) {
      const err = await presignedRes.text();
      console.error("[Upload Image] Presigned URL failed:", presignedRes.status, err);
      throw new Error(`Failed to get upload URL (${presignedRes.status})`);
    }
    const { uploadUrl, finalUrl } = await presignedRes.json();
    console.log("[Upload Image] Got presigned URL, finalUrl:", finalUrl);

    // Step 2: upload file to Cloudflare R2 from server (no browser CORS issue)
    // R2 uses S3-compatible API — X-Amz-Algorithm in presigned URL is normal for R2
    const buffer = await request.arrayBuffer();
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: buffer,
      headers: { "Content-Type": contentType },
    });
    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("[Upload Image] R2 PUT failed:", uploadRes.status, err);
      throw new Error(`Cloudflare R2 upload failed (${uploadRes.status})`);
    }

    console.log("[Upload Image] Upload success:", finalUrl);
    return NextResponse.json({ url: finalUrl });
  } catch (err) {
    console.error("[Upload Image] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
