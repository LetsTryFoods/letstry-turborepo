const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  next();
});

const ZAAKPAY_API = 'https://api.zaakpay.com/api/paymentTransact/V8';
const ZAAKPAY_STAGING = 'https://zaakstaging.zaakpay.com/api/paymentTransact/V8';

const MERCHANT_ID = 'ec1aef36b2074f3790e193627ee7c7ca';
const SECRET_KEY = 'a3833da3c2234d218568a690c1714e5d';

function calculateChecksum(params, secretKey) {
  const sortedKeys = Object.keys(params).sort();
  console.log('[Checksum] Sorted keys:', sortedKeys);
  
  const stringToSign = sortedKeys
    .map(key => `${key}=${params[key]}&`)
    .join('');
  
  console.log('[Checksum] ─────────────────────────────────────────');
  console.log('[Checksum] FULL String to sign:');
  console.log(stringToSign);
  console.log('[Checksum] ─────────────────────────────────────────');
  console.log('[Checksum] Secret key:', secretKey);
  
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('hex');
  
  console.log('[Checksum] Calculated HMAC-SHA256:', hmac);
  return hmac;
}

app.get('/', (req, res) => {
  console.log('\n🏠 Home page accessed (serving zaakpay-debugger.html)');
  res.sendFile(path.join(__dirname, '../scripts/zaakpay-debugger.html'));
});

app.post('/payment/direct-html', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 FLOW 1: Direct HTML Form Submission');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { amount, buyerEmail, orderId, txnType = '1', ...otherParams } = req.body;

  console.log('Request Body received:');
  console.log('  amount:', amount);
  console.log('  buyerEmail:', buyerEmail);
  console.log('  orderId:', orderId);
  console.log('  txnType:', txnType);
  console.log('  otherParams:', otherParams);

  if (!amount || !buyerEmail || !orderId) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const params = {
    amount: (parseFloat(amount) * 100).toString(),
    buyerEmail,
    orderId,
    merchantIdentifier: MERCHANT_ID,
    currency: 'INR',
    txnType,
    ...otherParams,
  };

  console.log('Params built:');
  console.log(params);

  const filtered = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== '')
  );

  console.log('Filtered params:');
  console.log(filtered);

  const checksum = calculateChecksum(filtered, SECRET_KEY);
  console.log('Checksum calculated:', checksum);

  const urlParams = new URLSearchParams({ ...filtered, checksum });
  const paymentUrl = `${ZAAKPAY_API}?${urlParams.toString()}`;

  console.log('Final Payment URL:');
  console.log(paymentUrl.substring(0, 200) + '...');

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Zaakpay Payment - Direct HTML</title>
      <style>
        body { font-family: Arial; background: #f0f0f0; padding: 2rem; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
        h1 { color: #333; margin-bottom: 1rem; }
        .info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; margin-bottom: 1rem; font-size: 0.9rem; color: #1565c0; }
        .code { background: #f5f5f5; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; overflow-x: auto; margin: 1rem 0; }
        button { padding: 0.8rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
        button:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚡ FLOW 1: Direct HTML Form → Zaakpay (Working)</h1>
        <div class="info">
          ✅ This is how the working HTML debugger submissions work. Click below to auto-post to Zaakpay.
        </div>
        
        <h3>Testing Info:</h3>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Amount (Paisa):</strong> ${filtered.amount || 'N/A'}</p>
        <p><strong>txnType:</strong> ${txnType}</p>
        <p><strong>Checksum:</strong> ${checksum}</p>
        
        <h3>Now opening Zaakpay...</h3>
        <button onclick="document.getElementById('paymentForm').submit()">
          🚀 Open Zaakpay Payment Page
        </button>
        
        <form id="paymentForm" action="${ZAAKPAY_API}" method="GET" style="display:none;">
          ${Object.entries(filtered)
            .map(([k, v]) => `<input type="hidden" name="${k}" value="${v.toString().replace(/"/g, '&quot;')}">`)
            .join('')}
          <input type="hidden" name="checksum" value="${checksum}">
        </form>
        
        <hr style="margin: 2rem 0;">
        <button onclick="history.back()" style="background: #666;">← Back to Debugger</button>
      </div>
    </body>
    </html>
  `);
});

app.post('/payment/backend-redirect', async (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 FLOW 2: Backend POST to Zaakpay');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const { amount, buyerEmail, orderId, txnType = '1', useStaging = false, ...otherParams } = req.body;

  console.log('Request Body received:');
  console.log('  amount:', amount);
  console.log('  buyerEmail:', buyerEmail);
  console.log('  orderId:', orderId);
  console.log('  txnType:', txnType);
  console.log('  useStaging:', useStaging);
  console.log('  otherParams:', otherParams);

  if (!amount || !buyerEmail || !orderId) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const API_URL = useStaging ? ZAAKPAY_STAGING : ZAAKPAY_API;
  console.log('API Endpoint:', API_URL);

  const params = {
    amount: (parseFloat(amount) * 100).toString(),
    buyerEmail,
    orderId,
    merchantIdentifier: MERCHANT_ID,
    currency: 'INR',
    txnType,
    returnUrl: `http://localhost:${PORT}/payment/callback`,
    ...otherParams,
  };

  console.log('Params built:');
  console.log(params);

  const filtered = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== '')
  );

  console.log('Filtered params:');
  console.log(filtered);

  const checksum = calculateChecksum(filtered, SECRET_KEY);
  filtered.checksum = checksum;

  console.log('Checksum calculated:', checksum);
  console.log('\n🔵 Sending POST to Zaakpay:');
  console.log('URL:', API_URL);
  console.log('Data:', filtered);

  try {
    const response = await axios.post(API_URL, querystring.stringify(filtered), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 0,
      validateStatus: () => true,
    });

    console.log('\n🟢 Response received from Zaakpay');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('\nResponse Headers:');
    console.log(response.headers);
    
    if (response.data) {
      console.log('\nResponse Body (first 1000 chars):');
      console.log(response.data.substring(0, 1000));
      console.log('\nResponse Body (full):');
      console.log(response.data);
    }

    let redirectUrl = '';
    let responseHtml = '';

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      redirectUrl = response.headers['location'];
      console.log('\n✅ Got redirect from Zaakpay');
      console.log('Redirect URL:', redirectUrl);
    } else if (response.status === 200 && response.data) {
      console.log('\n✅ Got 200 OK with HTML response from Zaakpay');
      responseHtml = response.data;
      lastZaakpayResponse = response.data;
      console.log('HTML response stored for /view-zaakpay-response endpoint');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Zaakpay Backend Flow - Debug</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial; background: #f0f0f0; padding: 2rem; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
          h1 { color: #333; margin-bottom: 1rem; }
          h2 { color: #555; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #ddd; padding-bottom: 0.5rem; }
          .section { margin-bottom: 2rem; padding: 1rem; background: #f9f9f9; border-radius: 4px; }
          .success { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 1rem; margin-bottom: 1rem; color: #2e7d32; }
          .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin-bottom: 1rem; color: #e65100; }
          button { padding: 0.8rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-right: 0.5rem; margin-top: 1rem; }
          button:hover { background: #45a049; }
          button.secondary { background: #666; }
          button.secondary:hover { background: #555; }
          pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; max-height: 300px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
          .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
          .tab-btn { padding: 0.6rem 1rem; background: #f0f0f0; border: 1px solid #ddd; cursor: pointer; border-radius: 4px 4px 0 0; }
          .tab-btn.active { background: #2196f3; color: white; border-color: #2196f3; }
          .tab-content { display: none; }
          .tab-content.active { display: block; }
          iframe { width: 100%; height: 500px; border: 1px solid #ddd; border-radius: 4px; }
        </style>
        <script>
          function showTab(tabName) {
            const tabs = document.querySelectorAll('.tab-content');
            const btns = document.querySelectorAll('.tab-btn');
            tabs.forEach(t => t.classList.remove('active'));
            btns.forEach(b => b.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
          }
        </script>
      </head>
      <body>
        <div class="container">
          <h1>📡 FLOW 2: Backend POST to Zaakpay Redirect Flow</h1>
          
          <div class="success">
            ✅ Backend received response from Zaakpay (Status ${response.status})
          </div>

          <h2>📤 Request Sent to Zaakpay</h2>
          <div class="section">
            <p><strong>URL:</strong> ${API_URL}</p>
            <p><strong>Method:</strong> POST</p>
            <table>
              <tr style="background: #f0f0f0;"><th>Parameter</th><th>Value</th></tr>
              ${Object.entries(filtered)
                .map(([k, v]) => `<tr><td style="color: #2196f3; font-weight: bold;">${k}</td><td style="font-family: monospace; font-size: 0.9rem; word-break: break-all;">${v}</td></tr>`)
                .join('')}
            </table>
          </div>

          <h2>📥 Zaakpay Response</h2>
          <div class="section">
            <p><strong>Status:</strong> ${response.status}</p>
          </div>

          ${redirectUrl ? `
            <h2>🔗 Success: Got Redirect</h2>
            <div class="success">✅ Zaakpay returned a redirect URL</div>
            <div class="section">
              <p><strong>Redirect URL:</strong></p>
              <pre>${redirectUrl}</pre>
              <button onclick="window.open('${redirectUrl}', '_blank')">🚀 Open Payment Page</button>
            </div>
          ` : ''}

          ${responseHtml ? `
            <h2>📄 Zaakpay Response: HTML Payment Page</h2>
            <div class="success">
              ✅ Zaakpay returned HTML (Status ${response.status}). Click below to view it.
            </div>
            <div class="section">
              <button onclick="window.open('/view-zaakpay-response', '_blank', 'width=1000,height=800')">
                🔗 Open Payment Page in New Window
              </button>
              
              <h3 style="margin-top: 1.5rem;">HTML Source (first 2500 characters):</h3>
              <pre style="max-height: 350px; font-size: 0.8rem;">${responseHtml.slice(0, 2500).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              
              <h3 style="margin-top: 1.5rem;">📊 Analysis:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                <tr style="background: #f0f0f0;"><th style="border: 1px solid #ddd; padding: 0.5rem;">Check</th><th style="border: 1px solid #ddd; padding: 0.5rem;">Result</th></tr>
                <tr><td style="border: 1px solid #ddd; padding: 0.5rem;">HTML Size</td><td style="border: 1px solid #ddd; padding: 0.5rem;">${responseHtml.length} bytes</td></tr>
                <tr style="background: #f9f9f9;"><td style="border: 1px solid #ddd; padding: 0.5rem;">Contains &lt;form&gt;</td><td style="border: 1px solid #ddd; padding: 0.5rem;">${responseHtml.includes('<form') ? '✅ Yes' : '❌ No'}</td></tr>
                <tr><td style="border: 1px solid #ddd; padding: 0.5rem;">Contains "UPI"</td><td style="border: 1px solid #ddd; padding: 0.5rem;">${responseHtml.toLowerCase().includes('upi') ? '✅ Found' : '❌ Not found'}</td></tr>
                <tr style="background: #f9f9f9;"><td style="border: 1px solid #ddd; padding: 0.5rem;">Contains "submit"</td><td style="border: 1px solid #ddd; padding: 0.5rem;">${responseHtml.includes('submit') ? '✅ Found' : '❌ Not found'}</td></tr>
              </table>
            </div>
          ` : ''}

          <h2>🔍 Analysis</h2>
          <div class="warning">
            <strong>Status ${response.status}:</strong> ${response.status === 200 ? 'Zaakpay returns HTML (payment page/form)' : response.status === 302 ? 'Zaakpay returns redirect' : 'Other response'}
            <br><br>
            <strong>Possible Issue:</strong> When backend POSTs (vs browser direct POST):
            <ul style="margin-left: 2rem; margin-top: 0.5rem;">
              <li>Zaakpay detects non-browser User-Agent (Axios)</li>
              <li>May not preserve txnType in response</li>
              <li>May not set proper session cookies</li>
              <li>Payment modes may be missing from returned HTML</li>
            </ul>
          </div>

          <div style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #ddd;">
            <button class="secondary" onclick="history.back()">← Back to Debugger</button>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('\n❌ Error during POST to Zaakpay:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Full error:', error);
    
    res.status(500).send(`
      <html>
      <head>
        <title>Error</title>
        <style>
          body { font-family: Arial; padding: 2rem; }
          .error { background: #ffebee; border-left: 4px solid #d32f2f; padding: 1rem; color: #c62828; }
        </style>
      </head>
      <body>
        <div class="error">
          <h2>❌ Request Failed</h2>
          <p>${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.post('/payment/callback', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Payment Callback Received');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Request Body:', req.body);
  console.log('Request Query:', req.query);
  console.log('Request Headers:', req.headers);

  res.send(`
    <html>
    <body style="font-family: Arial; padding: 2rem;">
      <h1>✅ Payment Callback Received</h1>
      <p>All callback data logged to server console</p>
      <pre>${JSON.stringify(req.body, null, 2)}</pre>
    </body>
    </html>
  `);
});

let lastZaakpayResponse = null;

app.get('/view-zaakpay-response', (req, res) => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👁️  Viewing Zaakpay Response');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (lastZaakpayResponse) {
    console.log('✅ Sending stored Zaakpay response');
    console.log('Response size:', lastZaakpayResponse.length, 'bytes');
    res.send(lastZaakpayResponse);
  } else {
    console.log('❌ No response stored yet');
    res.send('<html><body><h1>No response stored. Make a payment request first.</h1></body></html>');
  }
});

app.get('/test', (req, res) => {
  console.log('\n📊 Test page accessed');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Zaakpay Flow Tester</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { text-align: center; margin-bottom: 2rem; color: #333; }
        .flows { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .flow { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); padding: 2rem; }
        .flow h2 { color: #2196f3; margin-bottom: 1rem; }
        .flow p { color: #666; line-height: 1.6; margin-bottom: 1rem; }
        button { padding: 0.8rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; width: 100%; margin-top: 1rem; }
        button:hover { background: #45a049; }
        input { width: 100%; padding: 0.5rem; margin: 0.5rem 0; border: 1px solid #ddd; border-radius: 4px; }
        .note { background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin-top: 1rem; font-size: 0.9rem; color: #e65100; }
        @media (max-width: 768px) { .flows { grid-template-columns: 1fr; } }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚡ Zaakpay Flow Comparison</h1>
        
        <div class="flows">
          <div class="flow">
            <h2>✅ FLOW 1: Direct HTML</h2>
            <p>Browser → Zaakpay API (direct, no server proxy)</p>
            <form action="/payment/direct-html" method="POST">
              <input type="hidden" name="amount" value="153">
              <input type="hidden" name="buyerEmail" value="test@example.com">
              <input type="hidden" name="orderId" value="TEST_${Date.now()}">
              <input type="hidden" name="txnType" value="1">
              <input type="hidden" name="buyerFirstName" value="Test">
              <input type="hidden" name="buyerCity" value="Gurugram">
              <input type="hidden" name="buyerState" value="Haryana">
              <input type="hidden" name="buyerPincode" value="201016">
              <input type="hidden" name="buyerCountry" value="India">
              <input type="hidden" name="buyerAddress" value="Test">
              <input type="hidden" name="productDescription" value="Test Payment">
              <button type="submit">🚀 Test FLOW 1</button>
            </form>
            <div class="note">Payment modes: ✅ WORKING</div>
          </div>

          <div class="flow">
            <h2>❌ FLOW 2: Backend POST</h2>
            <p>Browser → Your Server → Zaakpay API (server proxy)</p>
            <form action="/payment/backend-redirect" method="POST">
              <input type="hidden" name="amount" value="153">
              <input type="hidden" name="buyerEmail" value="test@example.com">
              <input type="hidden" name="orderId" value="TEST_${Date.now()}">
              <input type="hidden" name="txnType" value="1">
              <input type="hidden" name="buyerFirstName" value="Test">
              <input type="hidden" name="buyerCity" value="Gurugram">
              <input type="hidden" name="buyerState" value="Haryana">
              <input type="hidden" name="buyerPincode" value="201016">
              <input type="hidden" name="buyerCountry" value="India">
              <input type="hidden" name="buyerAddress" value="Test">
              <input type="hidden" name="productDescription" value="Test Payment">
              <button type="submit">🚀 Test FLOW 2</button>
            </form>
            <div class="note">Payment modes: ❌ BROKEN (missing UPI, etc)</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🚀 Zaakpay Redirect Flow Debugger Server              ║');
  console.log('║                  WITH COMPREHENSIVE LOGGING                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 Server started on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:\n');
  console.log(`  🏠 Home                : http://localhost:${PORT}/`);
  console.log(`  🧪 Flow Tester         : http://localhost:${PORT}/test`);
  console.log(`  👁️  View Response       : http://localhost:${PORT}/view-zaakpay-response`);
  console.log(`\n📡 POST Endpoints:\n`);
  console.log(`  ✅ FLOW 1              : POST /payment/direct-html`);
  console.log(`  ❌ FLOW 2              : POST /payment/backend-redirect`);
  console.log(`  🔄 Callback            : POST /payment/callback`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Server ready. All requests and responses will be logged to console.\n');
});
