import { NextRequest, NextResponse } from "next/server";
import { generateDeliveryLabel } from "@/lib/label/generator";

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();

    if (!order) {
      return NextResponse.json({ error: "Missing order" }, { status: 400 });
    }

    const pdfBuffer = await generateDeliveryLabel(order);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=label-${order.orderId}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Label generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
