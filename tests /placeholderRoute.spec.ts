// tests/placeholderRoute.spec.ts
import { DefaultApi, Configuration } from '../client'; // Path to the generated client
import './testHelper'; // Import the helper to set up the hooks

import { describe, it, expect, TestContext } from 'vitest';
import { CustomTestContext } from './testHelper';

describe('Placeholder Route', () => {
    it('should return expected response', async (ctx: CustomTestContext) => {
        // Use the client with the dynamic server address
        const client = new DefaultApi(new Configuration({ basePath: ctx.address }));
        const response = await client.sayHello({ name: 'John' });
        expect(response.message).toBe('Hello, John');
    });
});
