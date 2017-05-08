const http = require('http');
const assert = require('assert');
const util = require('util');

const BaseInterceptor = require('./BaseInterceptor');
const CubContext = require('./CubContext');
const CubRequest = require('./CubRequest');
const CubResponse = require('./CubResponse');

const INTERCEPTOR = Symbol("CUB#INTERCEPTOR")
const RESPOND = Symbol("CUB#RESPOND")

class Cub {
  /**
   * constructor of Cub. Can be created by `new`.
   * @example 
   *  const cub = new Cub();
   */
  constructor() {
    this[INTERCEPTOR] = [];
  }

  /**
   * @param {BaseInterceptor | Function} inter interceptor for cubjs to handle every request.
   * @example
   * cub.register(ctx => {
   *  ctx.body = 'Hello World!';
   * });
   * 
   * // or 
   * 
   * const BaseInterceptor = Cub.BaseInterceptor;
   * 
   * cub.register(new class extends BaseInterceptor {
   *    before (ctx){
   *      ctx.body = 'Hello';
   *    }
   * 
   *    after (ctx){
   *      ctx.body += ' World!';
   *    }
   * });
   *
   */
  register(inter) {
    assert(inter instanceof BaseInterceptor || util.isFunction(inter),
      'registered interceptor must be a instance of BaseInterceptor or a function!');
    if (inter instanceof BaseInterceptor) {
      assert(inter.before, 'interceptor must supply `before` function');
      assert(inter.after, 'interceptor must supply `after` function');
    }
    this[INTERCEPTOR].push(inter);
  }

  /**
   * @return the handle unit for webserver to handle the http request.
   * @example
   * 
   * const cub = new Cub();
   * cub.register(ctx => {
   *  ctx.body = 'Hello World!';
   * });
   * new http.Server(8000, cub.servlet()).run();
   */
  servlet() {
    const handleRequest = (req) => {
      const ctx = this.createContext(req, req.response);
      req.status = 404;

      let idx = 0;

      for (let i = 0; i < this[INTERCEPTOR].length; i++) {
        let inter = this[INTERCEPTOR][i];
        if (!util.isFunction(inter)) {
          if (inter.before(ctx) === false) {
            idx = i;
            break;
          }
        } else {
          if (inter(ctx) === false) {
            idx = i;
            break;
          }
        }
      }

      idx = idx === 0 ? this[INTERCEPTOR].length - 1 : idx;

      for (let i = idx; i >= 0; i--) {
        const inter = this[INTERCEPTOR][i];
        if (!util.isFunction(inter)) {
          if (inter.after(ctx) === false) {
            break;
          }
        }
      }

      this[RESPOND](ctx);
    };

    return handleRequest;
  }

  [RESPOND](ctx) {
    if (ctx.body) {
      ctx.status = 200;
      ctx.response.response.write(ctx.body);
    }
  }

  /**
   * @param {Number} port the server port
   * @param {Function} callback if privided, the server will run asynchronously without block current fiber. It should be used only in the test.
   * @return when run asynchronously, will return the server object.
   * @example
   * 
   * const cub = new Cub();
   * cub.register(ctx => {
   *  ctx.body = 'Hello World!';
   * });
   * cub.listen(8000);
   */
  listen(port, ...argv) {
    assert(util.isNumber(port), 'port must be number!');
    const server = new http.Server(port, this.servlet());
    this.server = server;
    if (argv.length > 0 && util.isFunction(argv[argv.length - 1])) {
      server.asyncRun();
      return server;
    } else {
      server.run();
    }
  }

  /**
   * @param {CubHttpRequest} req the http request wrapper object.See CubHttpRequest.
   * @param {CubHttpResponse} res the http response wrapper object.See CubHttpResponse.
   * @return the CubContext object. See CubContext.
   */
  createContext(req, res) {
    return new CubContext(req, res, this);
  }
}

Cub.BaseInterceptor = BaseInterceptor;
Cub.CubContext = CubContext;
Cub.CubRequest = CubRequest;
Cub.CubResponse = CubResponse;

module.exports = Cub;
