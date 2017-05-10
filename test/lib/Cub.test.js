const test = require('test');
const path = require('path');
const http = require('http');
const co = require('coroutine');
const assert = require('assert');
const detectPort = require('@fibjs/detect-port');

test.setup();

const Cub = require('../../');
const BaseInterceptor = Cub.BaseInterceptor;

describe("Cub", () => {
  it('constructor', () => {
    new Cub();
  });

  describe("register", () => {
    it('should throw when inlavid type', () => {
      const cub = new Cub();
      assert.throws(() => {
        cub.register({});
        cub.register(1);
        cub.register(new class { });
        cub.register(new class extends BaseInterceptor { });
        cub.register(null);
      });
    });

    it('should not throw when valid type', () => {
      const cub = new Cub();
      assert.doesNotThrow(() => {
        cub.register(() => { });
        cub.register(function() { });
        cub.register(new class extends BaseInterceptor {
          before() { }
          after() { }
        });
      });
    });
  });

  describe("servlet", () => {
    it('should server ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.response.body = 'Hello World!';
      });
      const port = detectPort();
      const server = new http.Server(port, cub.servlet());
      server.asyncRun();
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'Hello World!');
      server.stop();
    });
  });

  describe("listen", () => {
    it('should listen sync ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.response.body = 'Hello World!';
      });
      const port = detectPort();
      co.start(() => {
        cub.listen(port);
      });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });

    it('should listen async ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.response.body = 'Hello World!';
      });
      const port = detectPort();
      cub.listen(port, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });
  });

  describe("BaseInterceptor", () => {
    it('should run before & after ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body = 'Hello';
        }

        after(ctx) {
          ctx.response.body += ' World!';
        }
      });
      const port = detectPort();
      cub.listen(port, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });

    it('should stop ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body = 'a';
        }

        after(ctx) {
          ctx.response.body += 'b';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'c';
        }

        after(ctx) {
          ctx.response.body += 'd';
          return this.end();
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'e';

        }
        after(ctx) {
          ctx.response.body += 'f';
        }
      });
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'g';
          return this.end();
        }

        after(ctx) {
          ctx.response.body += 'h';
        }
      });
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'i';
        }

        after(ctx) {
          ctx.response.body += 'j';
        }
      });
      const port = detectPort();
      cub.listen(port, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'aceghfd');//acegfd
      cub.server.stop();
    });

    it('should multi ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body = 'a';
        }

        after(ctx) {
          ctx.response.body += 'b';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'c';
        }

        after(ctx) {
          ctx.response.body += 'd';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.response.body += 'e';
        }

        after(ctx) {
          ctx.response.body += 'f';
        }
      });
      const port = detectPort();
      cub.listen(port, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'acefdb');
      cub.server.stop();
    });
  });

  describe("FunctionInterceptor", () => {
    it('should stop ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.response.body = 'a';
      });

      cub.register(ctx => {
        ctx.response.body += 'b';
        return false;
      });

      cub.register(ctx => {
        ctx.response.body += 'b';
      });
      const port = detectPort();
      cub.listen(port, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:' + port).readAll().toString();
      assert(res === 'ab');//acegfd
      cub.server.stop();
    });
  });
});

// process.exit(test.run(console.DEBUG));
