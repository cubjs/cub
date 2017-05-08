'use strict';

const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(8000);
