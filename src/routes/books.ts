import Router from 'koa-router';
import assignment from '../../adapter';
import { Book } from '../../adapter/assignment-2';
import { Filter } from '../../adapter/assignment-3';
import { BookID, OrderId, ShelfId } from '../../adapter/assignment-4';

const router = new Router();

router.get('/', async (ctx) => {
  // Extract query parameters
  const filters: Filter[] = [];

  // Add price range filters (from/to)
  if (ctx.query.from || ctx.query.to) {
    const priceFilter: Filter = {};
    if (ctx.query.from) priceFilter.from = parseFloat(ctx.query.from.toString());
    if (ctx.query.to) priceFilter.to = parseFloat(ctx.query.to.toString());
    filters.push(priceFilter);
  }

  // Add name filter
  if (ctx.query.name) {
    filters.push({ name: String(ctx.query.name) });
  }

  // Add author filter
  if (ctx.query.author) {
    filters.push({ author: String(ctx.query.author) });
  }

  try {
    // Call the new listBooks function from assignment-3
    const books = await assignment.listBooks(filters);
    ctx.body = books;
  } catch (error) {
    console.error('Error in /books route:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch books due to an internal error.' };
  }
});

// POST book to create or update
router.post('/', async (ctx) => {
  try {
    const book = ctx.request.body as Book;
    const bookId = await assignment.createOrUpdateBook(book);
    ctx.status = 200;
    ctx.body = { id: bookId, message: 'Book created/updated successfully.' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to create/update book.' };
  }
});

// DELETE book by id
router.delete('/:id', async (ctx) => {
  try {
    const bookId = ctx.params.id;
    await assignment.removeBook(bookId);
    ctx.status = 200;
    ctx.body = { message: 'Book deleted successfully.' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to delete book.' };
  }
});

function validateFilters(filters: any): boolean {
  // Check if filters exist and are an array
  if (!filters || !Array.isArray(filters)) {
    return false;
  }

  // Check each filter object in the array
  return filters.every((filter) => {
    const from = parseFloat(filter.from);
    const to = parseFloat(filter.to);

    // Validate that 'from' and 'to' are numbers
    if (isNaN(from) || isNaN(to)) {
      return false;
    }

    // Validate that 'from' is less than or equal to 'to'
    return from <= to;
  });
}

// POST place books on a shelf
router.post('/shelf', async (ctx) => {
  try {
    const { bookId, numberOfBooks, shelf } = ctx.request.body as { bookId: string, numberOfBooks: number, shelf: ShelfId };
    await assignment.placeBooksOnShelf(bookId, numberOfBooks, shelf);
    ctx.status = 200;
    ctx.body = { message: 'Books placed on shelf successfully.' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to place books on shelf.' };
  }
});

// POST place an order for books
router.post('/orders', async (ctx) => {
  try {
    const bookIds = ctx.request.body as BookID[];
    const order = await assignment.orderBooks(bookIds);
    ctx.status = 200;
    ctx.body = { orderId: order.orderId, message: 'Order placed successfully.' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to place order.' };
  }
});

// GET find books on a shelf by book ID
router.get('/shelf/:bookId', async (ctx) => {
  try {
    const bookId = ctx.params.bookId;
    const shelves = await assignment.findBookOnShelf(bookId);
    ctx.status = 200;
    ctx.body = shelves;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to find book on shelves.' };
  }
});

// POST fulfill an order
router.post('/fulfill', async (ctx) => {
  try {
    const { orderId, booksFulfilled } = ctx.request.body as { orderId: OrderId, booksFulfilled: Array<{ book: BookID, shelf: ShelfId, numberOfBooks: number }> };
    await assignment.fulfilOrder(orderId, booksFulfilled);
    ctx.status = 200;
    ctx.body = { message: 'Order fulfilled successfully.' };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fulfill order.' };
  }
});

// GET list all orders
router.get('/orders', async (ctx) => {
  try {
    const orders = await assignment.listOrders();
    ctx.status = 200;
    ctx.body = orders;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch orders.' };
  }
});


export default router;
