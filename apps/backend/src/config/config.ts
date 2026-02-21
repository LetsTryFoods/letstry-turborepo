export default () => ({
  database: {
    uri: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME || 'letstry_dev',
    options: {},
  },
  port: {
    server_port: process.env.PORT,
  },
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log',
    debugFile: process.env.DEBUG_LOG_FILE || 'logs/debug.log',
    redisFile: process.env.REDIS_LOG_FILE || 'logs/redis.log',
    guestConversionFile:
      process.env.GUEST_CONVERSION_LOG_FILE || 'logs/guest-conversion.log',
    packingFile: process.env.PACKING_LOG_FILE || 'logs/packing.log',
    scanFile: process.env.SCAN_LOG_FILE || 'logs/scan.log',
    shipmentFile: process.env.SHIPMENT_LOG_FILE || 'logs/shipment.log',
    trackingFile: process.env.TRACKING_LOG_FILE || 'logs/tracking.log',
  },
  packing: {
    acceptTimeoutHours: parseInt(
      process.env.PACKING_ACCEPT_TIMEOUT_HOURS || '12',
      10,
    ),
    completeTimeoutMinutes: parseInt(
      process.env.PACKING_COMPLETE_TIMEOUT_MINUTES || '30',
      10,
    ),
    reassignmentCheckInterval: parseInt(
      process.env.REASSIGNMENT_CHECK_INTERVAL_MINUTES || '30',
      10,
    ),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.BUCKET_NAME,
    region: process.env.AWS_REGION,
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  },
  whatsapp: {
    apiUrl:
      process.env.WHATSAPP_API_URL ||
      'https://nurenaiautomatic-b7hmdnb4fzbpbtbh.canadacentral-01.azurewebsites.net/webhook/send-template',
    jwtToken:
      process.env.WHATSAPP_JWT_TOKEN ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxldHNUcnkiLCJhZG1pbiI6dHJ1ZX0.gJvhuRhqKjVS_Gc0T87vjE9EAGKBzfx09SpJVpUcb1I',
  },
  cart: {
    applyCouponOnMrp: process.env.APPLY_COUPON_ON_MRP === 'true',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    apiSecret: process.env.GOOGLE_MAPS_API_SECRET,
  },
  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'ZAAKPAY',
  },
  zaakpay: {
    merchantIdentifier:
      process.env.ZAAKPAY_MERCHANT_IDENTIFIER ||
      'ec1aef36b2074f3790e193627ee7c7ca',
    encryptionKeyId: process.env.ZAAKPAY_ENCRYPTION_KEY_ID || '9TodiedMJgabjBU',
    publicKey:
      process.env.ZAAKPAY_PUBLIC_KEY ||
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1m2fmIoRqDlF2ntbQAYSMGfiyy5wAWUeiBC9oAWoKkSWypudfDT9oz46G7sbdPSvxtszkd1Vjux0hkhac+gNNbWjT8f5JLcj8a0cXFqsmcL5WKQD47/48r9UP8rMTftrOcU8avsSkLaoGOGa+QOEmVduGBXQpM9WenbGAZtoxj6fK8+x77BLOCSEeqrY8s+sBMxne6UFxLbakASzXA3SZ+IxeU0pS3CnvjUh2zJRFkSlV4gBxD5jYAB2oZPsjSrDXhQ8fLxpg7g0pHfB+bcebOLvgEVw2CW1Tla/sih8FuPwxPth1TVKe0VXPjox3dG7ZSYMrh3v21KjaGC7HeZTKQIDAQAB',
    secretKey:
      process.env.ZAAKPAY_SECRET_KEY || 'a3833da3c2234d218568a690c1714e5d',
    returnUrl:
      process.env.ZAAKPAY_RETURN_URL ||
      'https://apiv3.letstryfoods.com/payment/callback',
    successUrl:
      process.env.ZAAKPAY_SUCCESS_URL ||
      'https://letstryfoods.com/payment-callback?status=success',
    failureUrl:
      process.env.ZAAKPAY_FAILURE_URL ||
      'https://letstryfoods.com/payment-failed',
    environment: process.env.ZAAKPAY_ENVIRONMENT || 'staging',
    baseUrl:
      (process.env.ZAAKPAY_ENVIRONMENT || 'staging') === 'production'
        ? 'https://api.zaakpay.com'
        : 'https://zaakstaging.zaakpay.com',
    endpoints: {
      expressCheckout: '/api/paymentTransact/V8',
      customCheckout: '/transactU?v=8',
      validateCard: '/validateCard',
      checkTxn: '/checkTxn?v=5',
      refund: '/refund',
      settlementReport: '/settlement',
    },
  },
  dtdc: {
    environment: process.env.DTDC_ENVIRONMENT || 'staging',
    customerCode: process.env.DTDC_CUSTOMER_CODE || '',
    apiKey: process.env.DTDC_API_KEY || '',
    baseUrls: {
      staging: 'https://demodashboardapi.shipsy.in/api/customer/integration/',
      production: 'https://pxapi.dtdc.in/api/customer/integration/',
    },
    endpoints: {
      bookingApi: 'consignment/softdata',
      labelApi: 'consignment/shippinglabel/stream',
      cancelApi: 'consignment/cancel',
      pincodeApi: 'http://smarttrack.ctbsplus.dtdc.com/ratecalapi/PincodeApiCall',
    },
    tracking: {
      baseUrl: 'https://blktracksvc.dtdc.com/dtdc-api',
      tokenPath: '/api/dtdc/authenticate',
      trackPath: '/rest/JSONCnTrk/getTrackDetails',
      pollIntervalHours: parseInt(process.env.DTDC_TRACKING_POLL_INTERVAL_HOURS || '1', 10),
    },
    defaults: {
      dimensionUnit: 'cm',
      weightUnit: 'kg',
      trackingValidityDays: 90,
      serviceType: process.env.DTDC_SERVICE_TYPE || 'GROUND EXPRESS',
      loadType: process.env.DTDC_LOAD_TYPE || 'NON-DOCUMENT',
      commodityId: process.env.DTDC_COMMODITY_ID || '10',
    },
    origin: {
      name: process.env.WAREHOUSE_NAME || 'Earth Crust Private Limited P',
      addressLine1: process.env.WAREHOUSE_ADDRESS_LINE1 || 'PLOT NO 2019, PH II SEC 38 HSIIDC RAI DISTT SONIPAT',
      addressLine2: process.env.WAREHOUSE_ADDRESS_LINE2 || 'RAI, 131029, HSIIDC RAI',
      city: process.env.WAREHOUSE_CITY || 'Sonipat',
      state: process.env.WAREHOUSE_STATE || 'Haryana',
      pincode: process.env.WAREHOUSE_PINCODE || '131029',
      phone: process.env.WAREHOUSE_PHONE || '9916124895',
    },
  },
});