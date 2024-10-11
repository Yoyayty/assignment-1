import { MongoClient } from 'mongodb';
import assignment from '../adapter/assignment-4';
import { describe, test, expect, beforeAll, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';


let mongod: MongoMemoryServer;
let db: MongoClient;
let mongoUrl: string;

async function setupTestDB() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    db = new MongoClient(uri);
    await db.connect();
    mongoUrl = uri;
}

describe('listBooks', () => {
    setupTestDB();

    it('should return books with stock levels', async () => {
        const booksCollection = db.db('bookstore').collection('books');
        const shelvesCollection = db.db('bookstore').collection('shelves');

        // Insert sample book
        const book = {
            _id: new ObjectId('book1'),
            name: 'Book 1',
            author: 'Author 1',
            description: 'A great book',
            price: 10.99,
            image: 'http://example.com/image.jpg',
        };
        await booksCollection.insertOne(book);

        // Insert stock data
        await shelvesCollection.insertOne({ bookId: 'book1', shelf: 'A', count: 5 });

        // Call listBooks
        const result = await assignment.listBooks();

        // Assert the result contains the correct stock
        expect(result).toEqual([
            {
                id: 'book1',
                name: 'Book 1',
                author: 'Author 1',
                description: 'A great book',
                price: 10.99,
                image: 'http://example.com/image.jpg',
                stock: 5,
            },
        ]);
    });
});



describe('placeBooksOnShelf', () => {
    setupTestDB();

    it('should add books to the correct shelf', async () => {
        const shelvesCollection = db.db('bookstore').collection('shelves');

        // Place books on shelf
        await assignment.placeBooksOnShelf('book1', 10, 'A');

        // Assert stock is updated
        const stock = await shelvesCollection.findOne({ bookId: 'book1', shelf: 'A' }) as any;
        expect(stock.count).toBe(10);
    });
});


describe('orderBooks', () => {
    setupTestDB();


    it('should create a new order', async () => {
        const ordersCollection = db.db('bookstore').collection('orders');

        // Place an order
        const order = await assignment.orderBooks(['book1', 'book2']);

        // Assert the order is created in the database
        const storedOrder = await ordersCollection.findOne({ _id: new ObjectId(order.orderId) });
        expect((storedOrder as any).books).toEqual(['book1', 'book2']);
    });
});


describe('findBookOnShelf', () => {
    setupTestDB();


    it('should return the correct shelf and stock for a book', async () => {
        const shelvesCollection = db.db('bookstore').collection('shelves');

        // Insert sample stock data
        await shelvesCollection.insertMany([
            { bookId: 'book1', shelf: 'A', count: 5 },
            { bookId: 'book1', shelf: 'B', count: 3 },
        ]);

        // Call findBookOnShelf
        const shelves = await assignment.findBookOnShelf('book1');

        // Assert correct stock is returned
        expect(shelves).toEqual([
            { shelf: 'A', count: 5 },
            { shelf: 'B', count: 3 },
        ]);
    });
});


describe('fulfilOrder', () => {
    setupTestDB();

    it('should reduce stock on shelves and mark the order as fulfilled', async () => {
        const shelvesCollection = db.db('bookstore').collection('shelves');
        const ordersCollection = db.db('bookstore').collection('orders');

        // Insert sample stock and order
        await shelvesCollection.insertOne({ bookId: 'book1', shelf: 'A', count: 5 });
        await ordersCollection.insertOne({
            _id: new ObjectId(),
            books: { book1: 3 },
            complete: false,
        });

        // Fulfill the order
        await assignment.fulfilOrder('order-id', [{ book: 'book1', shelf: 'A', numberOfBooks: 3 }]);

        // Assert stock is reduced
        const updatedStock = await shelvesCollection.findOne({ bookId: 'book1', shelf: 'A' }) as any;
        expect(updatedStock.count).toBe(2);

        // Assert the order is marked as fulfilled
        const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId('order-id') }) as any;
        expect(updatedOrder.complete).toBe(true);
    });
});
