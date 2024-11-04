import util from 'node:util';
import child_process from 'node:child_process';

const exec = util.promisify(child_process.exec);

async function generateOpenApi(): Promise<void> {
    try {
        console.log('Generating OpenAPI');
        await exec('./generate-openapi.sh');
    } catch (e) {
        console.error('Failed to generate OpenAPI', e);
    }
}

const openApiReady: { promise: Promise<void>, ready: boolean } = { ready: false, promise: generateOpenApi() };

export default {
    name: 'OpenApi Generation Plugin',
    buildStart: async () => { await openApiReady.promise; openApiReady.ready = true; },
    load: async () => {
        while (!openApiReady.ready && openApiReady.promise !== undefined) {
            await openApiReady.promise;
        }
    },
    watchChange: async () => {
        openApiReady.ready = false;
        const promise = generateOpenApi();
        openApiReady.promise = promise;
        await promise;
        if (openApiReady.promise === promise) {
            openApiReady.ready = true;
        }
    }
};
