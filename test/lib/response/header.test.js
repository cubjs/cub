// Modified from https://github.com/koajs/koa/tree/master/test

const test = require('test');
const assert = require('assert');
const detectPort = require('@fibjs/detect-port');

test.setup();

const response = require('../../helpers/context').response;
const Cub = require('../../../');

describe('res.header', () => {
  it('should return the response header object', () => {
    const res = response();
    res.set('X-Foo', 'bar');
    assert.deepEqual(res.header, { 'x-foo': 'bar' });
  });

  it('should return the response header object when no mocks are in use', () => {
    const app = new Cub();
    let header;

    app.register(ctx => {
      ctx.response.set('x-foo', '42');
      header = Object.assign({}, ctx.response.header);
    });

    const port = detectPort();
    app.listen(port, () => { });

    const result = http.get('http://127.0.0.1:' + port);

    assert.equal(result.status, 200);
    assert.deepEqual(result.header, { 'x-foo': '42' });
    app.server.stop();
  });

  describe('when res.headers not present', () => {
    it('should return empty object', () => {
      const res = response();
      res.res.headers = {};
      assert.deepEqual(res.header, {});
    });
  });
});

// process.exit(test.run(console.DEBUG));
