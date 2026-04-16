import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global cache to prevent multiple connections in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

const getMongoUri = () => {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    '';

  if (!uri) {
    throw new Error('Please define MONGODB_URI (or DATABASE_URL) environment variable.');
  }

  return uri.replace(/^"(.+)"$/, '$1');
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (
  mongoUri: string,
  options: mongoose.ConnectOptions,
  retries = 2
): Promise<typeof mongoose> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await mongoose.connect(mongoUri, options);
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await wait(attempt * 1000);
      }
    }
  }

  throw lastError;
};

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = getMongoUri();

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Force IPv4 to avoid common DNS resolution issues on Mac
    };

    cached.promise = connectWithRetry(mongoUri, opts).then((mongoose) => {
      return mongoose;
    }).catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    });

  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
