// Modified from https://github.com/koajs/koa/tree/master/test

const test = require('test');
const assert = require('assert');
const http = require('http');
const detectPort = require('@fibjs/detect-port');

test.setup();

const context = require('../../helpers/context');

const Cub = require('../../../');

describe('ctx.response.attachment([filename])', () => {
  describe('when given a filename', () => {
    it('should set the filename param', () => {
      const ctx = context();
      ctx.response.attachment('path/to/tobi.png');
      const str = 'attachment; filename="tobi.png"';
      assert.equal(ctx.response.header['content-disposition'], str);
    });
  });

  describe('when omitting filename', () => {
    it('should not set filename param', () => {
      const ctx = context();
      ctx.response.attachment();
      assert.equal(ctx.response.header['content-disposition'], 'attachment');
    });
  });

  describe('when given a no-ascii filename', () => {
    it('should set the encodeURI filename param', () => {
      const ctx = context();
      ctx.response.attachment('path/to/include-no-ascii-char-中文名-ok.png');
      const str = 'attachment; filename="include-no-ascii-char-???-ok.png"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png';
      assert.equal(ctx.response.header['content-disposition'], str);
    });

    it('should work with http client', () => {
      const cub = new Cub();

      app.register(ctx => {
        ctx.response.attachment('path/to/include-no-ascii-char-中文名-ok.json');
        ctx.response.body = { foo: 'bar' };
      });
      const port = detectPort();
      app.listen(port, () => { });

      const result = http.get('http://127.0.0.1:' + port);

      assert.equal(result.status, 200);
      assert.equal(result.headers['content-disposition'],
        'attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json');
      assert.deepEqual({ foo: 'bar' }, JSON.parse(result.body.read().toString()));

      app.server.stop();
    });
  });
});

// process.exit(test.run(console.DEBUG));
