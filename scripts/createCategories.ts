import mongoose from 'mongoose';
import Category from '../models/Category';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function createCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = [
      {
        name: 'Classic Sweets',
        slug: 'classic-sweets',
        description: 'Traditional and classic Indian sweets',
      },
      {
        name: 'Premium Sweets',
        slug: 'premium-sweets',
        description: 'Premium and luxurious Indian sweets',
      },
      {
        name: 'Sweets',
        slug: 'sweets',
        description: 'All types of Indian sweets',
      },
      {
        name: 'Snacks',
        slug: 'snacks',
        description: 'Delicious snacks and namkeen',
      },
      {
        name: 'Namkeen',
        slug: 'namkeen',
        description: 'Crispy and savory namkeen',
      },
      {
        name: 'Dry Fruit',
        slug: 'dry-fruit',
        description: 'Premium dry fruits and nuts',
      },
      {
        name: 'Gifting',
        slug: 'gifting',
        description: 'Gift hampers and boxes',
      },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name} (${cat.slug})`);
      } else {
        console.log(`Category already exists: ${cat.name} (${cat.slug})`);
      }
    }

    console.log('Categories setup complete!');
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createCategories();

