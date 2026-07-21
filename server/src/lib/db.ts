import mongoose from 'mongoose';

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set in .env');
  }

  // If the connection is already established, return
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Connect to the database
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
