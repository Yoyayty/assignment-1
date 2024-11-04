import { expect } from 'chai';
import { DefaultApi } from '../client/apis';
import { beforeEach, describe } from 'vitest';
import { afterEach, it } from 'node:test';
import { Server } from 'http';
import { Configuration } from '../client';
import { setupServer } from './testHelper';

let server: Server;
let address: string;

beforeEach(async () => {
    const setup = await setupServer();
    server = setup.server;
    address = setup.address;
});


afterEach(async () => {
    server.close();
});

it('should fetch warehouse data', async () => {
    // your test logic here
    expect(true).equal(true); // Example expectation, replace with actual logic
});

it('should retrieve book information', async () => {
    const client = new DefaultApi(new Configuration({ basePath: address }));
    const response = await client.getBookInfo({ book: '1' });
    expect(response.data).to.have.property('stock');
});

