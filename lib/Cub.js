const http = require('http');
const assert = require('assert');
const util = require('util');

const BaseInterceptor = require('BaseInterceptor');
const BaseController = require('BaseController');
const CubContext = require('CubContext');
const CubRequest = require('CubRequest');
const CubResponse = require('CubResponse');

const INTERCEPTOR = Symbol("CUB#INTERCEPTOR")
const RESPOND = Symbol("CUB#RESPOND")

class Cub {
  constructor() {
    this[INTERCEPTOR] = [];
  }

  register(inter) {
    this[INTERCEPTOR].push(inter);
  }

  servlet() {
    const handleRequest = (req) => {
      req.res.status = 404;
      const ctx = this.createContext(req, req.res);

      let idx = 0;
      for (let i of this[INTERCEPTOR]) {
        if (this[INTERCEPTOR][i] instanceof BaseInterceptor) {
          if (this[INTERCEPTOR][i].before(ctx) === false) {
            idx = i;
            break;
          }
        } else {
          if (this[INTERCEPTOR][i](ctx) === false) {
            idx = i;
            break;
          }
        }
      }

      for (let i = idx; i >= 0; i--) {
        if (this[INTERCEPTOR][i] instanceof BaseInterceptor) {
          if (this[INTERCEPTOR][i].after(ctx) === false) {
            idx = i;
            break;
          }
        }
      }

      this[RESPOND](ctx);
    };

    return handleRequest;
  }

  [RESPOND](ctx) {

  }

  listen(port) {
    assert(util.isNumber(port), 'port must be number!');
    const server = new http.Server(port, this.servlet());
    server.run();
  }

  createContext(req, res) {
    return new CubContext(req, res, this);
  }
}

Cub.BaseInterceptor = BaseInterceptor;
Cub.BaseController = BaseController;
Cub.CubContext = CubContext;
Cub.CubRequest = CubRequest;
Cub.CubResponse = CubResponse;

module.exports = Cub;
