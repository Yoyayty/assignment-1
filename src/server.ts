// src/server.ts
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import qs from 'koa-qs';
import booksRouter from './routes/books';

const app = new Koa();
qs(app);

app.use(bodyParser());
app.use(booksRouter.routes()).use(booksRouter.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});