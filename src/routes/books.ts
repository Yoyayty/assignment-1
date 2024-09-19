import Router from 'koa-router';
import assignment from '../../adapter';
import { Book } from '../../adapter/assignment-2';

const router = new Router();

router.get('/', async (ctx) => {
    const filters = ctx.query.filters as Array<{ from?: number, to?: number }>;

    if ((filters && filters.length) &&
        !validateFilters(filters)) {
        ctx.status = 400;
        ctx.body = { error: "Invalid filters provided." };
        return;
    }

    try {

        const books = await assignment.listBooks(filters);
        ctx.body = books;
    } catch (error) {
        console.error("Error in /books route:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to fetch books due to an internal error." };
    }
});


// POST route to create or update a book
router.post('/', async (ctx) => {
    try {
        const book = ctx.request.body as Book;
        if (!book.name || !book.author || !book.price) {
            ctx.status = 400;
            ctx.body = { error: "Book name, author, and price are required." };
            return;
        }

        const bookId = await assignment.createOrUpdateBook(book);
        ctx.status = 200;
        ctx.body = { id: bookId, message: "Book created/updated successfully." };
    } catch (error) {
        console.error("Error in POST /books route:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to create/update book due to an internal error." };
    }
});

// DELETE route to remove a book by ID
router.delete('/:id', async (ctx) => {
    try {
        const bookId = ctx.params.id;
        if (!bookId) {
            ctx.status = 400;
            ctx.body = { error: "Book ID is required." };
            return;
        }

        await assignment.removeBook(bookId);
        ctx.status = 200;
        ctx.body = { message: "Book deleted successfully." };
    } catch (error) {
        console.error("Error in DELETE /books/:id route:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to delete book due to an internal error." };
    }
});


function validateFilters(filters: any): boolean {
    // Check if filters exist and are an array
    if (!filters || !Array.isArray(filters)) {
        return false;
    }

    // Check each filter object in the array
    return filters.every(filter => {
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


export default router;