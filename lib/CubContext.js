const CubRequest = require('./CubRequest');
const CubResponse = require('./CubResponse');

class CubContext {
  constructor(req, res, app) {
    this.req = this.request = new CubRequest(req);
    this.res = this.response = new CubResponse(res);
    this.app = app;
  }
}

module.exports = CubContext;
