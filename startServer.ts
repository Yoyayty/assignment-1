import Koa from 'koa';
import { Server } from 'http';

import { BookDatabase } from './src/models/book-database';
import { WarehouseDatabase } from './src/models/warehouse-database';

const bookDb = new BookDatabase('books');
const warehouseDb = new WarehouseDatabase('warehouse');

export function startServer(port = 0): Promise<Server> {
    return new Promise((resolve) => {
        const app = new Koa();
        const server = app.listen(port, () => resolve(server));
    });
}