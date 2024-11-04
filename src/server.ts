import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import swagger from '../swagger/swagger.json';
import { koaSwagger } from 'koa2-swagger-ui';
import { WarehouseDatabase } from './models/warehouse-database';

const app = new Koa();
const router = new Router();

// Define a simple route
router.get('/hello/:name', (ctx) => {
  ctx.body = `Hello, ${ctx.params.name}`;
});

// Use middleware
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(
  koaSwagger({
    routePrefix: '/docs', // The path to view the documentation
    specPrefix: '/docs/spec',
    exposeSpec: true,
    swaggerOptions: {
      spec: swagger,
    },
  })
);

app.use(async (ctx, next) => {
  ctx.state.warehouse = new WarehouseDatabase('warehouse');
  await next();
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default router; // Add this line to export as default
