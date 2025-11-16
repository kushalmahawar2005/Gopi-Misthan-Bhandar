import mongoose from 'mongoose';
import Category from '../models/Category';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function createMissingCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Categories based on Navigation.tsx
    const categories = [
      {
        name: 'Bakery Items',
        slug: 'bakery',
        description: 'Fresh bakery items and baked goods',
      },
      {
        name: 'Savoury Snacks',
        slug: 'savoury',
        description: 'Delicious savoury snacks and treats',
      },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`✅ Created category: ${cat.name} (${cat.slug})`);
      } else {
        console.log(`ℹ️  Category already exists: ${cat.name} (${cat.slug})`);
      }
    }

    console.log('\n✅ Missing categories setup complete!');
  } catch (error) {
    console.error('❌ Error creating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createMissingCategories();

