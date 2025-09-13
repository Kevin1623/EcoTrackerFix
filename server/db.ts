import { MongoClient, Db } from 'mongodb';

// MongoDB connection string must be provided via environment variable
const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  throw new Error(
    "MONGODB_URI environment variable is required. Please set it to your MongoDB connection string."
  );
}

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(connectionString);
    await client.connect();
    
    // Extract database name from connection string or use default
    const dbName = 'ecotracker';
    db = client.db(dbName);
    
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Export the database instance for direct access
export { db };