import { NextRequest, NextResponse } from "next/server";
import { generateInvoice } from "@/lib/invoice/generator";

export async function POST(req: NextRequest) {
  try {
    const order = await req.json();

    if (!order) {
      return NextResponse.json({ error: "Missing order" }, { status: 400 });
    }

    const pdfBuffer = await generateInvoice(order);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.orderId}.pdf`,
      },
    });
  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
