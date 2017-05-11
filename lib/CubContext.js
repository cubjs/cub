const CubRequest = require('./CubRequest');
const CubResponse = require('./CubResponse');

class CubContext {
  /**
   * constructor of CubContext. Can be created by `new`.
   */
  constructor(req, res, app) {
    this.request = new CubRequest(req, this);
    this.response = new CubResponse(res, this);

    this.req = this.request.req;
    this.res = this.response.res;

    this.app = app;
  }
}

module.exports = CubContext;
