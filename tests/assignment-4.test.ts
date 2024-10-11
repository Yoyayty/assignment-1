import { MongoClient } from 'mongodb';
import assignment from '../adapter/assignment-4';
import { describe, test, expect, beforeAll, afterAll, it, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';
import { connect, setUri } from '../db';


let mongod: MongoMemoryServer;
let db: MongoClient;

async function setupTestDB() {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    db = new MongoClient(uri);
    await db.connect();
    setUri(uri);
}

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await db.close();
    await mongod.stop();
});

beforeEach(async () => {
    const shelvesCollection = db.db('bookstore').collection('shelves');
    await shelvesCollection.deleteMany({});
});

describe('listBooks', () => {
    it('should return books with stock levels', async () => {
        const booksCollection = db.db('bookstore').collection('books');

        // Generate a valid ObjectId for the book
        const bookId = new ObjectId();
        const shelvesCollection = db.db('bookstore').collection('shelves');

        // Insert sample book
        const book = {
            _id: bookId,
            name: 'Book 1',
            author: 'Author 1',
            description: 'A great book',
            price: 10.99,
            image: 'http://example.com/image.jpg',
        };
        await booksCollection.insertOne(book);

        // Insert stock data
        await shelvesCollection.insertOne({ bookId: bookId.toHexString(), shelf: 'A', count: 5 });

        // Call listBooks
        const result = await assignment.listBooks();

        // Assert the result contains the correct stock
        expect(result).toEqual([
            {
                _id: bookId,  // Use the bookId's string representation
                name: 'Book 1',
                author: 'Author 1',
                description: 'A great book',
                price: 10.99,
                image: 'http://example.com/image.jpg',
                stock: 5
            },
        ]);
    });
});

describe('placeBooksOnShelf', () => {

    it('should add books to the correct shelf', async () => {
        const shelvesCollection = db.db('bookstore').collection('shelves');

        // Place books on shelf
        await assignment.placeBooksOnShelf('book1', 10, 'A');
        await assignment.placeBooksOnShelf('book1', 10, 'A');
        await assignment.placeBooksOnShelf('book2', 10, 'B');

        // Assert stock is updated
        const stock = await shelvesCollection.findOne({ bookId: 'book1', shelf: 'A' }) as any;
        expect(stock.count).toBe(20);
    });
});


describe('orderBooks', () => {
    it('should create a new order', async () => {
        const ordersCollection = db.db('bookstore').collection('orders');

        // Place an order
        const order = await assignment.orderBooks(['book1', 'book2', 'book2']);

        // Assert the order is created in the database
        const storedOrder = await ordersCollection.findOne({ _id: new ObjectId(order.orderId) });
        expect((storedOrder as any).books).toEqual({ 'book1': 1, 'book2': 2 });
    });
});


describe('findBookOnShelf', () => {
    it('should return the correct shelf and stock for a book', async () => {

        // Add more books to shelf A (this simulates calling placeBooksOnShelf to update the count)
        await assignment.placeBooksOnShelf('book1', 5, 'A');
        await assignment.placeBooksOnShelf('book1', 10, 'B');

        // Call findBookOnShelf
        const shelves = await assignment.findBookOnShelf('book1');

        // Assert correct stock is returned
        expect(shelves).toEqual([
            { shelf: 'A', count: 5 },
            { shelf: 'B', count: 10 },
        ]);
    });
});


describe('fulfilOrder', () => {
    it('should reduce stock on shelves and mark the order as fulfilled', async () => {
        const shelvesCollection = db.db('bookstore').collection('shelves');
        const ordersCollection = db.db('bookstore').collection('orders');

        // Insert sample stock and order
        await shelvesCollection.insertOne({ bookId: 'book1', shelf: 'A', count: 5 });

        // Use a valid ObjectId
        const orderId = new ObjectId();

        await ordersCollection.insertOne({
            _id: orderId,
            books: { book1: 3 },
            complete: false,
        });

        // Fulfill the order
        await assignment.fulfilOrder(orderId.toHexString(), [{ book: 'book1', shelf: 'A', numberOfBooks: 3 }]);

        // Assert stock is reduced
        const updatedStock = await shelvesCollection.findOne({ bookId: 'book1', shelf: 'A' }) as any;
        expect(updatedStock.count).toBe(2);

        // Assert the order is marked as fulfilled
        const updatedOrder = await ordersCollection.findOne({ _id: orderId }) as any;
        expect(updatedOrder.complete).toBe(true);
    });
});

describe('listOrders', () => {
    beforeEach(async () => {
        // Clean up orders before each test
        const ordersCollection = db.db('bookstore').collection('orders');
        await ordersCollection.deleteMany({});
    });

    it('should return a list of orders', async () => {
        const ordersCollection = db.db('bookstore').collection('orders');

        // Insert sample orders
        await ordersCollection.insertMany([
            {
                _id: new ObjectId('60c72b2f9b1d8f001cfa28a1'),
                books: { book1: 2, book2: 1 },
                complete: false,
            },
            {
                _id: new ObjectId('60c72b2f9b1d8f001cfa28a2'),
                books: { book3: 3 },
                complete: false,
            },
        ]);

        // Call listOrders
        const result = await assignment.listOrders();

        // Assert the result matches the inserted orders
        expect(result).toEqual([
            {
                orderId: '60c72b2f9b1d8f001cfa28a1',
                books: { book1: 2, book2: 1 },
            },
            {
                orderId: '60c72b2f9b1d8f001cfa28a2',
                books: { book3: 3 },
            },
        ]);
    });
});