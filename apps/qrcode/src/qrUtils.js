const QRCode = require('qrcode');

/**
 * Generates a high-quality QR code image buffer encoding the specified URL.
 * Emulates the Python configurations: Version/Scale scaling, Error Correction Level H, and border margins.
 * 
 * Note: Logo embedding logic is disabled/commented out in the source Python service.
 * If needed in the future, the 'sharp' npm library can be used to overlay 'logo.png' onto this buffer.
 * 
 * @param {string} url - The destination URL to encode.
 * @returns {Promise<Buffer>} - Promise resolving to a PNG image buffer.
 */
async function generateQrCodeImage(url) {
  try {
    const buffer = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      margin: 4,
      scale: 12,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw error;
  }
}

module.exports = {
  generateQrCodeImage
};
