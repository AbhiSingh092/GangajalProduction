import mongoose from 'mongoose';

const globalState = globalThis.__bidi_mongo || { connection: null, promise: null };
if (!globalThis.__bidi_mongo) {
  globalThis.__bidi_mongo = globalState;
}

const connectDB = async () => {
  if (globalState.connection) {
    return globalState.connection;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (!globalState.promise) {
    globalState.promise = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || undefined
    }).then((mongooseInstance) => {
      console.log('[database] Connected to MongoDB');
      return mongooseInstance;
    }).catch((err) => {
      globalState.promise = null;
      console.error('[database] MongoDB connection error:', err);
      throw err;
    });
  }

  globalState.connection = await globalState.promise;
  return globalState.connection;
};

export default connectDB;

