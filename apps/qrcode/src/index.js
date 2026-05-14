const express = require('express');
const requestIp = require('request-ip');
require('dotenv').config();

const { storeQrScan } = require('./db');
const { generateQrCodeImage } = require('./qrUtils');
const { getDeviceInfo, getLocation } = require('./analytics');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable client IP detection behind proxies
app.use(requestIp.mw());

/**
 * Route: GET /show_qr
 * Streams a dynamically generated PNG QR code image encoding the redirection server.
 */
app.get('/show_qr', async (req, res) => {
  try {
    const url = 'https://qr.letstryfoods.com/redirect';
    const buffer = await generateQrCodeImage(url);
    
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('❌ Error generating QR code route:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Route: GET /redirect
 * Captures real-time device metrics, registers scans in background MongoDB storage,
 * and dynamically injects adaptive deep-linking scripts targeting Android, iOS, or web fallback.
 */
app.get('/redirect', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.clientIp || req.ip || '127.0.0.1';
  
  const { deviceType, osFamily } = getDeviceInfo(userAgent);
  const location = getLocation(ipAddress);
  const timestamp = new Date().toISOString();

  const scanInfo = {
    device: deviceType,
    os: osFamily,
    user_agent: userAgent,
    ip_address: ipAddress,
    location: location
  };

  // Dispatch background database persistence non-blocking (FastAPI BackgroundTasks emulation)
  storeQrScan(scanInfo).catch(err => {
    console.error('❌ Error executing background storeQrScan task:', err);
  });

  console.log('=== QR Scan Event ===');
  console.log(`Time: ${timestamp}`);
  console.log(`IP: ${ipAddress}`);
  console.log(`Device: ${deviceType} | OS: ${osFamily}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Location: ${location}`);
  console.log('=====================');

  // Defined Deep Link & App Store targets
  const letstryAndroidStore = 'https://play.google.com/store/apps/details?id=com.letstryapp';
  const letstryAndroidDeepLink = 'intent://www.letstryfoods.com/app#Intent;scheme=https;package=com.letstryapp;end;';
  const letstryIosDeepLink = 'cskapp://MainApp';
  const letstryIosStore = 'https://apps.apple.com/in/app/lets-try/id6749929023';
  const fallbackWebsite = 'https://www.letstryfoods.com';

  const osLower = osFamily.toLowerCase();

  if (osLower.includes('android')) {
    const html = `
    <html>
    <head>
        <title>Redirecting...</title>
        <script type="text/javascript">
            window.location = "${letstryAndroidDeepLink}";
            setTimeout(function() {
                if (document.visibilityState === "visible") {
                    window.location.href = "${letstryAndroidStore}";
                }
            }, 1000);
        </script>
    </head>
    <body>
        
    </body>
    </html>
    `;
    return res.send(html);
  } else if (osLower.includes('ios') || osLower.includes('mac os x') && deviceType !== 'pc') {
    // Treat iOS platforms appropriately
    const html = `
    <html>
    <head>
        <title>Redirecting...</title>
        <script type="text/javascript">
            window.location = "${letstryIosDeepLink}";
            setTimeout(function() {
                if (document.visibilityState === "visible") {
                    window.location.href = "${letstryIosStore}";
                }
            }, 2000);
        </script>
    </head>
    <body>
        
    </body>
    </html>
    `;
    return res.send(html);
  } else {
    // Fallback direct redirection for desktops and other operating systems
    return res.redirect(fallbackWebsite);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Node.js QR tracking service active on port ${PORT}`);
});
