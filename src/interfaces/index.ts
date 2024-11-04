import { Book, Filter } from '../../adapter/assignment-4';

export interface AppWarehouseDatabaseState {
    warehouse: WarehouseData;
}

export interface AppBookDatabaseState {
    books: BookDatabaseAccessor;
}

export interface BookDatabaseAccessor {
    createOrUpdate(book: Book): Promise<string>;
    getBookById(bookId: string): Promise<Book | null>;
    listBooks(filters?: Filter[]): Promise<Book[]>;
    removeBook(bookId: string): Promise<void>;
}

export interface WarehouseData {
    placeBooksOnShelf(bookId: string, count: number, shelfId: string): Promise<void>;
    getStockForBook(bookId: string): Promise<number>;
    listBooksOnShelves(): Promise<Array<{ bookId: string; shelfId: string; count: number }>>;
    fulfillOrder(orderId: string): Promise<void>;
}