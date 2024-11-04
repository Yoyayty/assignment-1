// bookDatabase.ts
import { BookDatabaseAccessor } from '../interfaces';
import { connect } from '../../db';
import { Book, Filter } from '../../adapter/assignment-4';
import { ObjectId } from 'mongodb';

export class BookDatabase implements BookDatabaseAccessor {
    private dbName: string;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    async createOrUpdate(book: Book): Promise<string> {
        const db = await connect(this.dbName);
        const booksCollection = db.collection<Book>('books');

        if (book.id) {
            // Update existing book
            await booksCollection.updateOne(
                { _id: new ObjectId(book.id) },
                { $set: book },
                { upsert: true } // Insert if not found
            );
            return book.id;
        } else {
            // Create new book
            const result = await booksCollection.insertOne(book);
            return result.insertedId.toHexString();
        }
    }

    async getBookById(bookId: string): Promise<Book | null> {
        const db = await connect(this.dbName);
        const booksCollection = db.collection<Book>('books');
        const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
        return book || null;
    }

    async listBooks(filters?: Filter[]): Promise<Book[]> {
        const db = await connect(this.dbName);
        const booksCollection = db.collection<Book>('books');
        const query: any = {};

        if (filters) {
            filters.forEach((filter) => {
                if (filter.from !== undefined) query.price = { $gte: filter.from };
                if (filter.to !== undefined) query.price = { ...query.price, $lte: filter.to };
                if (filter.name) query.name = { $regex: filter.name, $options: 'i' };
                if (filter.author) query.author = { $regex: filter.author, $options: 'i' };
            });
        }

        return await booksCollection.find(query).toArray();
    }

    async removeBook(bookId: string): Promise<void> {
        const db = await connect(this.dbName);
        const booksCollection = db.collection<Book>('books');
        await booksCollection.deleteOne({ _id: new ObjectId(bookId) });
    }
}
