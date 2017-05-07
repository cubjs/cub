class CubContext {
  constructor(req, res, app) {
    this.req = this.request = new CubRequest(req);
    this.res = this.response = new CubResponse(res);
    this.app = app;
  }

  url() {

  }

  path() {

  }

  method() {

  }

  cookie() {

  }
}

module.exports = CubContext;
