import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function backup() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const products = mongoose.connection.collection('products');
  const docs = await products
    .find({ 'sizes.1': { $exists: true } }, { projection: { name: 1, price: 1, sizes: 1 } })
    .toArray();
  const out = resolve(process.cwd(), `backup-sizes-${Date.now()}.json`);
  writeFileSync(out, JSON.stringify(docs, null, 2));
  console.log(`Backed up ${docs.length} products -> ${out}`);
  await mongoose.disconnect();
}

backup().catch((e) => { console.error(e); process.exit(1); });
