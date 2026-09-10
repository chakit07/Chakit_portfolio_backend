const mongoose = require('mongoose');
require('dotenv').config();

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
const TARGET_URI = process.argv[2] || process.env.TARGET_MONGODB_URI;

if (!TARGET_URI) {
  console.error('\n❌ Error: Please provide your MongoDB Atlas connection string.');
  console.log('\nUsage:');
  console.log('  node src/utils/exportToAtlas.js "<your_mongodb_atlas_connection_string>"\n');
  process.exit(1);
}

async function migrateData() {
  console.log('\n🚀 Starting Local-to-Atlas Database Migration...');
  console.log(`📥 Source (Local): ${LOCAL_URI}`);
  console.log(`📤 Destination (Atlas): ${TARGET_URI.replace(/:([^:@]+)@/, ':****@')}\n`);

  // Connect to Local DB
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('✅ Connected to Local MongoDB.');

  // Connect to Atlas DB
  const atlasConn = await mongoose.createConnection(TARGET_URI).asPromise();
  console.log('✅ Connected to MongoDB Atlas.\n');

  try {
    const collections = await localConn.db.listCollections().toArray();
    let totalMigrated = 0;

    for (const col of collections) {
      const name = col.name;
      if (name.startsWith('system.')) continue;

      const localCollection = localConn.db.collection(name);
      const atlasCollection = atlasConn.db.collection(name);

      const docs = await localCollection.find({}).toArray();

      if (docs.length === 0) {
        console.log(`  ⚪ [${name}]: 0 documents, skipping.`);
        continue;
      }

      // Clear existing records in destination collection to prevent duplicates
      await atlasCollection.deleteMany({});

      // Insert all documents with original _id and references intact
      await atlasCollection.insertMany(docs);
      console.log(`  🟢 [${name}]: Successfully cloned ${docs.length} document(s).`);
      totalMigrated += docs.length;
    }

    console.log(`\n🎉 Migration Complete! Successfully transferred ${totalMigrated} document(s) to MongoDB Atlas.`);
    console.log('All your projects, settings, skills, education, and credentials are now live on Atlas!\n');
  } catch (err) {
    console.error('\n❌ Migration Failed:', err.message);
  } finally {
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  }
}

migrateData();
