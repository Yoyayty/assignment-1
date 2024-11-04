import Koa from 'koa';
import { Server } from 'http';

export function startServer(port = 0): Promise<Server> {
    return new Promise((resolve) => {
        const app = new Koa();
        const server = app.listen(port, () => resolve(server));
    });
}