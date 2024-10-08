import assignment1 from './assignment-1';
import { connect } from '../db';
import { ObjectId } from 'mongodb';

export type BookID = string;
let books: Book[] = [];

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

async function listBooks(
  filters?: Array<{ from?: number; to?: number }>,
): Promise<Book[]> {
  return assignment1.listBooks(filters);
}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  const db = await connect();
  const collection = db.collection<Book>('books');

  if (book.id) {
    const result = await collection.updateOne(
      { _id: new ObjectId(book.id) },
      { $set: { ...book } },
    );
    return book.id;
  } else {
    const result = await collection.insertOne(book);
    return result.insertedId.toString();
  }
}

async function removeBook(book: BookID): Promise<void> {
  const db = await connect();
  const collection = db.collection('books');

  await collection.deleteOne({ _id: new ObjectId(book) });
}

const assignment = 'assignment-2';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
};
