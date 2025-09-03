import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable must be set");
}

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    db = client.db('studyflow'); // Use studyflow as the database name
    console.log('Connected to MongoDB Atlas successfully');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
  }
}

export { db };