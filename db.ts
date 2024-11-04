// db.ts
import { MongoClient, Db } from 'mongodb';

let uri = 'mongodb://mongo:27017';
let client = new MongoClient(uri);

export async function setUri(newUri: string) {
  uri = newUri;
  client = new MongoClient(uri);
}

export async function connect(dbName: string = 'bookstore'): Promise<Db> {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    return client.db(dbName); // Use the specified database name
  } catch (e) {
    console.error('Failed to connect to MongoDB', e);
    throw new Error('Failed to connect to MongoDB');
  }
}
