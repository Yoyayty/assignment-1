import previous_assignment from './assignment-3';
import { connect } from '../db';
import { ObjectId } from 'mongodb';

export type BookID = string;

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
  stock?: number;
}

export interface Filter {
  from?: number;
  to?: number;
  name?: string;
  author?: string;
}

// If multiple filters are provided, any book that matches at least one of them should be returned
// Within a single filter, a book would need to match all the given conditions
async function listBooks(filters?: Filter[]): Promise<Book[]> {
  const query: any = {};
  const db = await connect();
  const booksCollection = db.collection<Book>('books');

  if (filters) {
    filters.forEach((filter) => {
      if (filter.from !== undefined) {
        query.price = { $gte: filter.from };
      }
      if (filter.to !== undefined) {
        query.price = { ...query.price, $lte: filter.to };
      }
      if (filter.name) {
        query.name = { $regex: filter.name, $options: 'i' };
      }
      if (filter.author) {
        query.author = { $regex: filter.author, $options: 'i' };
      }
    });
  }

  const books = await booksCollection.find(query).toArray();
  const shelvesCollection = db.collection('shelves');

  const bookIds = books.map(book => book._id.toString());
  const stockOnShelves = await shelvesCollection.aggregate([
    { $match: { bookId: { $in: bookIds } } },
    { $group: { _id: '$bookId', totalStock: { $sum: '$count' } } }
  ]).toArray();

  const stockMap = stockOnShelves.reduce((acc, stockInfo) => {
    acc[stockInfo._id] = stockInfo.totalStock;
    return acc;
  }, {} as Record<string, number>);

  return books.map(book => ({
    ...book,
    stock: stockMap[book._id.toString()],
  }));

}

async function createOrUpdateBook(book: Book): Promise<BookID> {
  return await previous_assignment.createOrUpdateBook(book);
}

async function removeBook(book: BookID): Promise<void> {
  await previous_assignment.removeBook(book);
}

async function lookupBookById(book: BookID): Promise<Book> {

  const db = await connect();
  const booksCollection = db.collection<Book>('books');

  // Fetch the book details from the books collection
  const bookEntity = await booksCollection.findOne({ _id: new ObjectId(book) });

  if (!bookEntity) {
    throw new Error(`Book with ID ${book} not found`);
  }

  const shelvesCollection = db.collection('shelves');
  const stockOnShelves = await shelvesCollection.aggregate([
    { $match: { bookId: book } },
    { $group: { _id: null, totalStock: { $sum: '$count' } } }
  ]).toArray();

  const totalStock = stockOnShelves.length > 0 ? stockOnShelves[0].totalStock : 0;

  bookEntity.stock = totalStock;

  return bookEntity;
}

export type ShelfId = string;
export type OrderId = string;

async function placeBooksOnShelf(
  bookId: BookID,
  numberOfBooks: number,
  shelf: ShelfId,
): Promise<void> {
  const db = await connect();
  const shelvesCollection = db.collection('shelves');

  const existingEntry = await shelvesCollection.findOne({ bookId, shelf });

  if (existingEntry) {
    await shelvesCollection.updateOne(
      { _id: new ObjectId(shelf), bookId },
      { $inc: { count: numberOfBooks } }
    );
  } else {
    await shelvesCollection.insertOne({
      id: shelf,
      bookId,
      count: numberOfBooks,
    });
  }
}

async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const db = await connect();
  const ordersCollection = db.collection('orders');

  const orderEntity = {
    books: order.reduce((acc, bookId) => {
      acc[bookId] = (acc[bookId] || 0) + 1;
      return acc;
    }, {} as Record<BookID, number>),
    complete: false,
    OrderedAt: new Date()
  };

  const result = await ordersCollection.insertOne(orderEntity);

  return { orderId: result.insertedId.toString() };
}

async function findBookOnShelf(
  book: BookID,
): Promise<Array<{ shelf: ShelfId; count: number }>> {
  const db = await connect();
  const shelvesCollection = db.collection('shelves');

  const shelves = await shelvesCollection
    .find({ book })
    .toArray();

  return shelves.map((shelf) => ({
    shelf: shelf.shelf,
    count: shelf.count,
  }));
}

async function fulfilOrder(
  order: OrderId,
  booksFulfilled: Array<{
    book: BookID;
    shelf: ShelfId;
    numberOfBooks: number;
  }>,
): Promise<void> {
  const db = await connect();
  const ordersCollection = db.collection('orders');
  const shelvesCollection = db.collection('shelves');

  const orderEntity = await ordersCollection.findOne({ _id: new ObjectId(order) });

  if (!orderEntity) {
    throw new Error(`Order with ID ${order} not found`);
  }

  for (const { book, shelf, numberOfBooks } of booksFulfilled) {
    const shelfStock = await shelvesCollection.findOne({ bookId: book, shelf });

    if (!shelfStock || shelfStock.count < numberOfBooks) {
      throw new Error(
        `Not enough stock for book ${book} on shelf ${shelf}. Requested: ${numberOfBooks}, Available: ${shelfStock?.count || 0}`,
      );
    }
  }

  for (const { book, shelf, numberOfBooks } of booksFulfilled) {
    await shelvesCollection.updateOne(
      { bookId: book, shelf },
      { $inc: { count: -numberOfBooks } },
    );
  }

  await ordersCollection.updateOne(
    { _id: new ObjectId(order) },
    { $set: { complete: true, fulfilledAt: new Date() } },
  );
}

async function listOrders(): Promise<
  Array<{ orderId: OrderId; books: Record<BookID, number> }>
> {
  throw new Error('Todo');
}

const assignment = 'assignment-4';

export default {
  assignment,
  createOrUpdateBook,
  removeBook,
  listBooks,
  placeBooksOnShelf,
  orderBooks,
  findBookOnShelf,
  fulfilOrder,
  listOrders,
  lookupBookById,
};
