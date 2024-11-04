import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: ['path/to/generated/routes', 'path/to/generated/client'],
    },
});
