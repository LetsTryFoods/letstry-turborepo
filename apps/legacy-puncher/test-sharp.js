const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, 'public/assets/logo.avif');

if (!fs.existsSync(logoPath)) {
  console.log('Logo not found at', logoPath);
  process.exit(0);
}

sharp(logoPath)
  .png()
  .toBuffer()
  .then(() => {
    console.log('Sharp processed logo successfully');
  })
  .catch(err => {
    console.error('Sharp failed to process logo:', err);
  });
