import { NextRequest, NextResponse } from 'next/server';
import { ShiprocketClient, DtdcClient } from '@/lib/logistics/clients';

export async function POST(req: NextRequest) {
  try {
    const { order, provider } = await req.json();

    if (!order || !provider) {
      return NextResponse.json({ success: false, error: 'Missing order or provider' }, { status: 400 });
    }

    let result;
    if (provider === 'SHIPROCKET') {
      result = await ShiprocketClient.bookShipment(order);
    } else if (provider === 'DTDC') {
      result = await DtdcClient.bookShipment(order);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid provider' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
