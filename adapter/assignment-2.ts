import assignment1 from "./assignment-1";
import { connect } from '../src/db';

import { ObjectId } from "mongodb";
export type BookID = string;

export interface Book {
    id?: BookID,
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    return assignment1.listBooks(filters);
}


async function createOrUpdateBook(book: Book): Promise<BookID> {
    const db = await connect();
    if (book.id) {
        await db.collection('books').updateOne({ _id: new ObjectId(book.id) }, { $set: book });
    } else {
        const insertResult = await db.collection('books').insertOne(book);
        book.id = insertResult.insertedId.toString(); // Set id as string
    }
    return book.id || "";
}

async function removeBook(book: BookID): Promise<void> {
    const db = await connect();
    await db.collection('books').deleteOne({ _id: new ObjectId(book) });
}

const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks
};