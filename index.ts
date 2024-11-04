import { startServer } from './startServer';

startServer(3000).then(() => {
    console.log('Server started on port 3000');
});