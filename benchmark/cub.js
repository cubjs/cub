const Cub = require('../');

const cub = new Cub();

cub.register(ctx => {
  ctx.body = 'Hello World!';
});

cub.listen(8000);
