import { Controller, Route, Get, Post, Body, Request, Path } from 'tsoa';
import { type ParameterizedContext, type DefaultContext, type Request as KoaRequest } from 'koa';
import { BookID } from '../../adapter/assignment-4';
import { AppWarehouseDatabaseState } from '../interfaces';
import { WarehouseDatabase } from '../models/warehouse-database';

@Route('warehouse')
export class WarehouseRoutes extends Controller {

    /**
     * Retrieves stock and shelf information for a book
     * @param book The ID of the book
     * @returns Stock information of the book
     */
    @Get('{book}')
    public async getBookInfo(
        @Path() book: BookID,
        @Request() request: KoaRequest
    ): Promise<Record<string, number>> {
        const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx;
        const warehouse = ctx.state.warehouse as WarehouseDatabase;

        // Retrieve book stock information using the warehouse data access layer
        const stock = await warehouse.getStockForBook(book);
        return { stock };
    }

    /**
     * Places a specified number of books on a specific shelf
     * @param bookId The ID of the book
     * @param count The number of books to place
     * @param shelfId The shelf ID where books should be placed
     */
    @Post('placeBooksOnShelf')
    public async placeBooksOnShelf(
        @Body() body: { bookId: BookID; count: number; shelfId: string },
        @Request() request: KoaRequest
    ): Promise<void> {
        const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx;
        const warehouse = ctx.state.warehouse as WarehouseDatabase;

        await warehouse.placeBooksOnShelf(body.bookId, body.count, body.shelfId);
    }

    /**
     * Fulfills an order by deducting stock from shelves
     * @param orderId The ID of the order to fulfill
     */
    @Post('fulfillOrder')
    public async fulfillOrder(
        @Body() body: { orderId: string },
        @Request() request: KoaRequest
    ): Promise<void> {
        const ctx: ParameterizedContext<AppWarehouseDatabaseState, DefaultContext> = request.ctx;
        const warehouse = ctx.state.warehouse as WarehouseDatabase;

        await warehouse.fulfillOrder(body.orderId);
    }
}
