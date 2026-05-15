const { MongoClient } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const DB_NAME = process.env.DB_NAME || 'qr_data';

// Create a single global MongoDB connection client
const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
let dbInstance = null;
let indexCreated = false;

/**
 * Returns current timestamp in IST (UTC+5:30) formatted as YYYY-MM-DD HH:mm:ss
 */
function getIstTimestamp() {
  const now = new Date();
  // Add 5 hours 30 minutes to UTC time
  const istTime = new Date(now.getTime() + (5 * 60 + 30) * 60 * 1000);
  
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const hours = String(istTime.getUTCHours()).padStart(2, '0');
  const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getDb() {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully.');
  }
  return dbInstance;
}

/**
 * Stores or updates QR scan information in MongoDB.
 * Replicates the exact schema, hashing, and duplicate handling of the Python service.
 */
async function storeQrScan(scanInfo) {
  const requiredFields = ['device', 'os', 'user_agent', 'ip_address', 'location'];
  if (!requiredFields.every(field => scanInfo[field])) {
    console.log('Data not stored, required fields missing.');
    return null;
  }

  try {
    const db = await getDb();
    const scanDataCol = db.collection('qr_scan_data');
    const totalCol = db.collection('qr_total_scan_count');
    const uniqueCol = db.collection('qr_unique_scan_count');

    // Ensure unique index exists (only once per runtime lifecycle)
    if (!indexCreated) {
      await scanDataCol.createIndex({ fingerprint: 1 }, { unique: true });
      indexCreated = true;
    }

    // Generate fingerprint for this device
    const rawString = `${scanInfo.user_agent}_${scanInfo.device}_${scanInfo.os}_${scanInfo.ip_address}`;
    const fingerprint = crypto.createHash('sha256').update(rawString).digest('hex');

    const now = getIstTimestamp();

    const baseDoc = {
      device: scanInfo.device,
      os: scanInfo.os,
      user_agent: scanInfo.user_agent,
      ip_address: scanInfo.ip_address,
      location: scanInfo.location,
      fingerprint: fingerprint,
      times_scanned: 1,
      date_time: [now]
    };

    let isUnique = false;

    try {
      await scanDataCol.insertOne(baseDoc);
      console.log('New unique scan inserted.');
      isUnique = true;
    } catch (err) {
      // Check for duplicate key error (code 11000)
      if (err.code === 11000) {
        await scanDataCol.updateOne(
          { fingerprint: fingerprint },
          {
            $inc: { times_scanned: 1 },
            $push: { date_time: now }
          }
        );
        console.log('Duplicate scan detected, incremented times_scanned.');
        isUnique = false;
      } else {
        throw err;
      }
    }

    const osKey = scanInfo.os ? scanInfo.os.toLowerCase() : 'unknown';

    // Update total scans counter
    await totalCol.updateOne(
      { qr_id: 'default_qr' },
      {
        $inc: {
          total_scans: 1,
          [`os_split.${osKey}`]: 1
        }
      },
      { upsert: true }
    );

    // Update unique scan counter only if it's a new device
    if (isUnique) {
      await uniqueCol.updateOne(
        { qr_id: 'default_qr' },
        {
          $inc: {
            unique_scans: 1,
            [`os_split.${osKey}`]: 1
          }
        },
        { upsert: true }
      );
    }

    // Fetch total count for logs
    const totalDoc = await totalCol.findOne({ qr_id: 'default_qr' });
    const totalCount = totalDoc ? (totalDoc.total_scans || 0) : 0;
    console.log(`Total QR scans so far: ${totalCount}`);

    return totalCount;
  } catch (error) {
    console.error(`MongoDB error: ${error.message}`);
    return null;
  }
}

module.exports = {
  storeQrScan,
  getDb
};
