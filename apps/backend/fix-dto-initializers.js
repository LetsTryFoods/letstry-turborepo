const fs = require('fs');
const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/dto/create-shipment.dto.ts';
let code = fs.readFileSync(filePath, 'utf-8');

// Replace all standard non-optional properties with a bang (!) so TS strict mode stops complaining.
// e.g. name: string; -> name!: string;
// Ensure we don't mess up already optional properties e.g. name?: string;
code = code.replace(/(\w+):\s([A-Za-z]+)\;/g, (match, p1, p2) => {
    return `${p1}!: ${p2};`;
});

fs.writeFileSync(filePath, code, 'utf-8');
console.log('DTO initializers fixed');
