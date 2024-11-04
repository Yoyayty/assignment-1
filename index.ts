import { startServer } from './startServer';

const port = 3000;
startServer(port).then((server) => {
    console.log(`Server started on port ${port}`);
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
