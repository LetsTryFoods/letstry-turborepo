const fs = require('fs');

const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/services/shipment.service.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regex = /async createShipment\(data: CreateShipmentData\): Promise<{ shipment: Shipment; awbNumber: string; labelUrl: string }> {([\s\S]*?)return { shipment, awbNumber: [a-zA-Z]+, labelUrl };\n  }/;

const newImplementation = `async createShipment(data: CreateShipmentData): Promise<{ shipment: Shipment; awbNumber: string; labelUrl: string }> {
    const provider = (data as any).provider || 'DTDC';

    if (provider === 'DTDC') {
      const serviceable = await this.dtdcApiService.checkPincode(
        data.originDetails.pincode,
        data.destinationDetails.pincode,
      );

      if (!serviceable) {
        throw new BadRequestException('Destination pincode not serviceable');
      }
    }

    const adapter = this.deliveryPartnerFactory.getAdapter(provider);
    const result = await adapter.bookShipment(data);

    const trackingValidityDays = this.configService.get<number>('dtdc.defaults.trackingValidityDays') || 90;
    const trackingDisabledAfter = new Date();
    trackingDisabledAfter.setDate(trackingDisabledAfter.getDate() + trackingValidityDays);

    const shipment = await this.shipmentModel.create({
      orderId: data.orderId ? new Types.ObjectId(data.orderId) : undefined,
      provider,
      awbNumber: result.awbNumber,
      dtdcAwbNumber: result.awbNumber, // keep for backward compat
      providerOrderId: result.providerOrderId,
      pickupLocationName: (data as any).pickupLocationName,
      dtdcReferenceNumber: provider === 'DTDC' ? result.providerOrderId : null,
      customerCode: this.configService.get<string>('dtdc.customerCode') || provider,
      serviceType: data.serviceType,
      loadType: data.loadType,
      originCity: data.originDetails.city,
      destinationCity: data.destinationDetails.city,
      weight: data.weight,
      declaredValue: data.declaredValue,
      bookedOn: new Date(),
      dimensions: data.dimensions,
      originDetails: data.originDetails,
      destinationDetails: data.destinationDetails,
      codAmount: data.codAmount,
      codCollectionMode: data.codCollectionMode,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      ewayBill: data.ewayBill,
      commodityId: data.commodityId,
      numPieces: data.numPieces || 1,
      piecesDetail: data.piecesDetail,
      trackingDisabledAfter,
      labelUrl: result.labelUrl,
      currentStatusCode: 'BKD',
      currentStatusDescription: 'Booked',
    });

    this.shipmentLogger.logShipmentBooked(result.awbNumber, data.orderId || '', shipment._id.toString());
    return { shipment, awbNumber: result.awbNumber, labelUrl: result.labelUrl };
  }`;

code = code.replace(regex, newImplementation);
fs.writeFileSync(filePath, code, 'utf-8');
console.log('createShipment modified successfully');
