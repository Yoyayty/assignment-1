// db.ts
import { MongoClient, Db } from 'mongodb';

const uri = "mongodb://mongo:27017";
const client = new MongoClient(uri);

export async function connect(): Promise<Db> {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client.db('bookstore'); // Specify the database name
    } catch (e) {
        console.error("Failed to connect to MongoDB", e);
        throw new Error("Failed to connect to MongoDB"); // Throw an error instead of returning null
    }
}