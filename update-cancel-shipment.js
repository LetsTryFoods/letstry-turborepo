const fs = require('fs');

const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/services/shipment.service.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regexCancel = /async cancelShipment\(awbNumber: string\): Promise<Shipment> {([\s\S]*?)return shipment;\n  }/;

const newCancelImplementation = `async cancelShipment(awbNumber: string): Promise<Shipment> {
    const shipment = await this.findByAwbNumber(awbNumber);
    if (!shipment) {
      throw new NotFoundException(\`Shipment with AWB \${awbNumber} not found\`);
    }

    if (shipment.isDelivered) {
      throw new BadRequestException('Cannot cancel delivered shipment');
    }

    const provider = shipment.provider || 'DTDC';
    const adapter = this.deliveryPartnerFactory.getAdapter(provider);
    await adapter.cancelShipment(awbNumber, shipment.providerOrderId);

    shipment.isCancelled = true;
    shipment.cancelledAt = new Date();
    shipment.currentStatusCode = 'CAN';
    shipment.currentStatusDescription = 'Cancelled';
    await shipment.save();

    return shipment;
  }`;

code = code.replace(regexCancel, newCancelImplementation);
fs.writeFileSync(filePath, code, 'utf-8');
console.log('cancelShipment modified successfully');
