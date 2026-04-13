import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function cleanupInstaBook() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Access the collection directly to handle fields not in current schema
    const collection = mongoose.connection.collection('instabooks');

    // Find documents that still have the legacy 'image' field
    const legacyDocs = await collection.find({ image: { $exists: true } }).toArray();
    console.log(`Found ${legacyDocs.length} documents with legacy 'image' field.`);

    let updatedCount = 0;

    for (const doc of legacyDocs) {
      const updateOp: any = { $unset: { image: "" } };
      
      // If videoUrl is missing or empty, migrate image value to it
      if (!doc.videoUrl || doc.videoUrl === '') {
        updateOp.$set = { videoUrl: doc.image };
        console.log(`Migrating image to videoUrl for ID: ${doc._id}`);
      }

      await collection.updateOne({ _id: doc._id }, updateOp);
      updatedCount++;
    }

    console.log(`Cleanup complete! Successfully processed ${updatedCount} documents.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupInstaBook();
