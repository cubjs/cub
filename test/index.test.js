const test = require('test');
const path = require('path');
const http = require('http');
const co = require('coroutine');
const assert = require('assert');

test.setup();

const Cub = require('../');
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
        ctx.body = 'Hello World!';
      });
      const server = new http.Server(8000, cub.servlet());
      server.asyncRun();
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'Hello World!');
      server.stop();
    });
  });

  describe("listen", () => {
    it('should listen sync ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.body = 'Hello World!';
      });
      co.start(() => {
        cub.listen(8000);
      });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });

    it('should listen async ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.body = 'Hello World!';
      });
      cub.listen(8000, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });
  });

  describe("BaseInterceptor", () => {
    it('should run before & after ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body = 'Hello';
        }

        after(ctx) {
          ctx.body += ' World!';
        }
      });
      cub.listen(8000, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'Hello World!');
      cub.server.stop();
    });

    it('should stop ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body = 'a';
        }

        after(ctx) {
          ctx.body += 'b';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'c';
        }

        after(ctx) {
          ctx.body += 'd';
          return this.end();
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'e';

        }
        after(ctx) {
          ctx.body += 'f';
        }
      });
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'g';
          return this.end();
        }

        after(ctx) {
          ctx.body += 'h';
        }
      });
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'i';
        }

        after(ctx) {
          ctx.body += 'j';
        }
      });
      cub.listen(8000, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'aceghfd');//acegfd
      cub.server.stop();
    });

    it('should multi ok', () => {
      const cub = new Cub();
      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body = 'a';
        }

        after(ctx) {
          ctx.body += 'b';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'c';
        }

        after(ctx) {
          ctx.body += 'd';
        }
      });

      cub.register(new class extends BaseInterceptor {
        before(ctx) {
          ctx.body += 'e';
        }

        after(ctx) {
          ctx.body += 'f';
        }
      });
      cub.listen(8000, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'acefdb');
      cub.server.stop();
    });
  });

  describe("FunctionInterceptor", () => {
    it('should stop ok', () => {
      const cub = new Cub();
      cub.register(ctx => {
        ctx.body = 'a';
      });

      cub.register(ctx => {
        ctx.body += 'b';
        return false;
      });

      cub.register(ctx => {
        ctx.body += 'b';
      });

      cub.listen(8000, () => { });
      co.sleep(20);
      const res = http.get('http://127.0.0.1:8000').readAll().toString();
      assert(res === 'ab');//acegfd
      cub.server.stop();
    });
  });
});

process.exit(test.run(console.DEBUG));
