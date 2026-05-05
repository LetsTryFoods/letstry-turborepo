const fs = require('fs');

const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/services/shipment.service.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regexActive = /async findActiveShipmentsForTracking\(\): Promise<Shipment\[\]> {([\s\S]*?)return this.shipmentModel.find\(query\).exec\(\);\n  }/;

const newActiveImplementation = `async findActiveShipmentsForTracking(provider?: string): Promise<Shipment[]> {
    const query: any = {
      isDelivered: false,
      isCancelled: false,
      isRto: false,
      dtdcAwbNumber: { $ne: null },
    };
    if (provider) {
      query.provider = provider;
    }
    return this.shipmentModel.find(query).exec();
  }`;

if (code.match(regexActive)) {
    code = code.replace(regexActive, newActiveImplementation);
} else {
    console.log("Could not find findActiveShipmentsForTracking!");
}

fs.writeFileSync(filePath, code, 'utf-8');
console.log('findActiveShipmentsForTracking modified successfully');
