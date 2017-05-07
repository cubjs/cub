class BaseInterceptor {
  constructor() {
  }

  before(ctx) { }

  after(ctx) { }

  end() {
    return false;
  }
}

module.exports = BaseInterceptor;
