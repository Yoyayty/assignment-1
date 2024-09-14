import books from './../mcmasteful-book-list.json';

export interface Book {
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};


// Function to filter books based on price range
async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    if (!filters || filters.length === 0) {
        return books; // No filters, return all books
    }

    return books.filter(book =>
        filters.some(filter =>
            (filter.from === undefined || book.price >= filter.from) &&
            (filter.to === undefined || book.price <= filter.to)
        )
    );
}

const assignment = "assignment-1";

export default {
    assignment,
    listBooks
};