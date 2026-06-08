const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://tech36701_db_user:VKQdIHX7klJ54dS3@cluster0.xxjj1uk.mongodb.net/letstry_dev?retryWrites=true&w=majority";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('letstry_dev');
    const products = db.collection('products');
    
    const allCount = await products.countDocuments({});
    const notArchivedCount = await products.countDocuments({ isArchived: { $ne: true } });
    const explicitFalseCount = await products.countDocuments({ isArchived: false });
    const explicitTrueCount = await products.countDocuments({ isArchived: true });
    
    console.log("Total:", allCount);
    console.log("$ne true:", notArchivedCount);
    console.log("explicit false:", explicitFalseCount);
    console.log("explicit true:", explicitTrueCount);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
