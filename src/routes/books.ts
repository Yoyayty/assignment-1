import Router from 'koa-router';
import assignment from '../../adapter';

const router = new Router();

router.get('/books', async (ctx) => {
    // Expecting filters as query parameters like ?filters[0][from]=10&filters[0][to]=50
    const filters = ctx.query.filters as Array<{ from?: number, to?: number }>;
    try {
        const books = await assignment.listBooks(filters);
        ctx.body = books;
    } catch (error) {
        console.error("Error in /books route:", error);
        ctx.status = 500;
        ctx.body = { error: "Failed to fetch books due to an internal error." };
    }
});

export default router;