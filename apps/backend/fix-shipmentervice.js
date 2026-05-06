const fs = require('fs');
const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/services/shipment.service.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const regex = /const provider = \(data as any\)\;provider \|\| 'DTDC'\;/;
code = code.replace(/provider \,/g, "provider: provider as 'DTDC' | 'SHIPROCKET',");
code = code.replace(/const adapter = this\.deliveryPartnerFactory\.getAdapter\(provider\);/, 
    "const adapter = this.deliveryPartnerFactory.getAdapter(provider as 'DTDC' | 'SHIPROCKET');");

fs.writeFileSync(filePath, code, 'utf-8');
console.log('fixed provider type');
