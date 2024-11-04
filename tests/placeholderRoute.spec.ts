import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupServer } from './testHelper';
import { DefaultApi, Configuration } from '../client';  // Adjust as needed based on client SDK path
import { Server } from 'http';

let server: Server;
let address: string;

beforeEach(async () => {
    const setup = await setupServer();
    server = setup.server;
    address = setup.address;
});

afterEach(() => {
    server.close();
});

it('should return hello message', async () => {
    const client = new DefaultApi(new Configuration({ basePath: address }));
    const response = await client.sayHello({ name: 'Test' });
    expect(response.message).toBe('Hello Test');
});
