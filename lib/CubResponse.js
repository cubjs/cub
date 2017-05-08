const assert = require('assert');
const status = require('statuses');

const BODY = Symbol('CubResponse#BODY');

class CubResponse {
  constructor(res) {
    this.res = this.response = res;
  }

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this.res.status;
  }

  /**
   * Set response status code.
   *
   * @param {Number} code
   * @api public
   */

  set status(code) {
    assert('number' == typeof code, 'status code must be a number');
    this.res.status = code;
    if (this.body && statuses.empty[code]) this.body = null;
  }

  get body() {
    return this[BODY];
  }

  set body(val) {
    this[BODY] = val;
  }
}

module.exports = CubResponse;
