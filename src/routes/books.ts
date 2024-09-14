import Router from 'koa-router';
import assignment from '../../adapter';

const router = new Router();

router.get('/books', async (ctx) => {
    const filters = ctx.query.filters as Array<{ from?: number, to?: number }>;

    if (!validateFilters(filters)) {
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