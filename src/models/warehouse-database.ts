// warehouseDatabase.ts
import { WarehouseData } from '../interfaces';
import { connect } from '../../db';
import { ObjectId } from 'mongodb';

export class WarehouseDatabase implements WarehouseData {
    private dbName: string;

    constructor(dbName: string) {
        this.dbName = dbName;
    }

    async placeBooksOnShelf(bookId: string, count: number, shelfId: string): Promise<void> {
        const db = await connect(this.dbName);
        const shelvesCollection = db.collection('shelves');

        const existingEntry = await shelvesCollection.findOne({ bookId, shelfId });
        if (existingEntry) {
            await shelvesCollection.updateOne(
                { bookId, shelfId },
                { $inc: { count } }  // Increment the existing count
            );
        } else {
            await shelvesCollection.insertOne({ bookId, shelfId, count });
        }
    }

    async getStockForBook(bookId: string): Promise<number> {
        const db = await connect(this.dbName);
        const shelvesCollection = db.collection('shelves');

        const stock = await shelvesCollection.aggregate([
            { $match: { bookId } },
            { $group: { _id: null, totalStock: { $sum: '$count' } } }
        ]).toArray();

        return stock.length > 0 ? stock[0].totalStock : 0;
    }

    async listBooksOnShelves(): Promise<Array<{ bookId: string; shelfId: string; count: number }>> {
        const db = await connect(this.dbName);
        const shelvesCollection = db.collection('shelves');

        const booksOnShelves = await shelvesCollection.find().toArray();
        return booksOnShelves.map((entry) => ({
            bookId: entry.bookId,
            shelfId: entry.shelfId,
            count: entry.count
        }));
    }

    async fulfillOrder(orderId: string): Promise<void> {
        const db = await connect(this.dbName);
        const ordersCollection = db.collection('orders');
        const shelvesCollection = db.collection('shelves');

        const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
        if (!order) throw new Error('Order not found');

        const books = order.books;
        for (const [bookId, quantity] of Object.entries(books)) {
            const stockOnShelves = await shelvesCollection.find({ bookId }).sort({ count: -1 }).toArray();

            let remaining: number = quantity as unknown as number;
            for (const shelf of stockOnShelves) {
                if (shelf.count >= remaining) {
                    await shelvesCollection.updateOne(
                        { _id: shelf._id },
                        { $inc: { count: -remaining } }
                    );
                    break;
                } else {
                    remaining -= shelf.count;
                    await shelvesCollection.deleteOne({ _id: shelf._id });
                }
            }

            if (remaining > 0) throw new Error(`Not enough stock to fulfill order for book ${bookId}`);
        }

        await ordersCollection.updateOne(
            { _id: new ObjectId(orderId) },
            { $set: { complete: true } }
        );
    }
}
