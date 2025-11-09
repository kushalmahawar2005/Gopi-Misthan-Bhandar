import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function updateAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update user role to admin
    const result = await User.updateOne(
      { email: 'Kushalmahawar71@gmail.com' },
      { $set: { role: 'admin' } }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found with email: Kushalmahawar71@gmail.com');
      console.log('Please make sure the user is registered first.');
    } else if (result.modifiedCount === 0) {
      console.log('✅ User found but role is already admin');
    } else {
      console.log('✅ User role updated to admin successfully!');
      console.log(`Modified ${result.modifiedCount} user(s)`);
    }

    // Verify the update
    const user = await User.findOne({ email: 'Kushalmahawar71@gmail.com' });
    if (user) {
      console.log('\nUser details:');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
}

updateAdminUser();

