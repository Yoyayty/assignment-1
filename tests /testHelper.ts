// testHelper.ts
import { startServer } from '../startServer';
import { Server } from 'http';
import { beforeEach, afterEach } from 'vitest';
import { TestContext } from 'vitest';



export interface CustomTestContext extends TestContext {
    address: string;
    close: () => Promise<void> | void;
}
let server: Server; // Declare server here

beforeEach(async (ctx: CustomTestContext) => {
    server = await startServer();
    ctx.address = `http://localhost:${(server.address() as any).port}`;
    ctx.close = async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };
});

afterEach(async (ctx: CustomTestContext) => {
    if (ctx.close) {
        await ctx.close();
    }
});