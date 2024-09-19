import assignment1 from "./assignment-1";

export type BookID = string;
let books: Book[] = [];

export interface Book {
    id?: BookID,
    name: string,
    author: string,
    description: string,
    price: number,
    image: string,
};

async function listBooks(filters?: Array<{ from?: number, to?: number }>): Promise<Book[]> {
    console.log(books)
    if (!filters || filters.length === 0) {
        return books; // No filters, return all books
    }

    return books;
}


async function createOrUpdateBook(book: Book): Promise<BookID> {
    const index = books.findIndex(b => b.id === book.id);
    if (index > -1) {
        books[index] = book;
    } else {
        books.push(book);
    }
    console.log(books)

    return book.id || "";
}

async function removeBook(book: BookID): Promise<void> {
    const index = books.findIndex(b => b.id === book);
    if (index !== -1) {
        books.splice(index, 1);
    }
}

const assignment = "assignment-2";

export default {
    assignment,
    createOrUpdateBook,
    removeBook,
    listBooks
};