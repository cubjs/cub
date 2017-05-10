const assert = require('assert');
const status = require('statuses');
const util = require('util');
const vary = require('vary');
const escape = require('escape-html');
const getType = require('mime-types').contentType;
const typeis = require('type-is').is;
const extname = require('path').extname;
const contentDisposition = require('content-disposition');

const BODY = Symbol('CubResponse#BODY');
const EXPLICIT_STATUS = Symbol('CubResponse#EXPLICIT_STATUS');

class CubResponse {
  /**
   * constructor of CubContext. Can be created by `new`.
   */
  constructor(res) {
    this.res = this.response = res;
  }

  /**
   * Return response header.
   *
   * @return {Object}
   */

  get header() {
    const headers = this.reqt.headers;
    return util.pick(headers, Object.keys(headers));
  }

  /**
   * Get response status code.
   *
   * @return {Number}
   */

  get status() {
    return this.res.status;
  }

  /**
   * Set response status code.
   *
   * @param {Number} code
   */

  set status(code) {
    assert('number' == typeof code, 'status code must be a number');
    this.res.status = code;
    this[EXPLICIT_STATUS] = true;
    if (this.body && statuses.empty[code]) this.body = null;
  }

  /**
   * Get response body.
   *
   * @return {String|Buffer|Object|Stream}
   */

  get body() {
    return this[BODY];
  }

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   */

  set body(val) {
    this[BODY] = val;

    // no content
    if (null == val) {
      if (!statuses.empty[this.status]) this.status = 204;
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    if(this[EXPLICIT_STATUS]){
      this.status = 200;
    }

    // set the content-type only if not yet set
    const setType = !this.header['content-type'];

    // string
    if ('string' == typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
      // this.length = Buffer.byteLength(val);// fibjs will auto set
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      // this.length = val.length; // fibjs will auto set
      return;
    }

    // stream
    if ('function' == typeof val.pipe) {
      // overwriting
      if (null != original && original != val) this.remove('Content-Length');

      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.remove('Content-Length');
    this.type = 'json';
  }

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   */

  set length(n) {
    this.set('Content-Length', n);
  }

  /**
   * Return response header.
   *
   * Examples:
   *
   *     this.res.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.res.get('content-type');
   *     // => "text/plain"
   *
   * @param {String} field
   * @return {String}
   */

  get(field) {
    return this.header[field.toLowerCase()] || '';
  }

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.res.set('Foo', ['bar', 'baz']);
   *    this.res.set('Accept', 'application/json');
   *    this.res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @param {String|Object|Array} field
   * @param {String} val
   */

  set(field, val) {
    if (2 == arguments.length) {
      if (Array.isArray(val)) val = val.map(String);
      else val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
  }

  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * this.res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * this.res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * this.res.append('Warning', '199 Miscellaneous warning');
   * ```
   *
   * @param {String} field
   * @param {String|Array} val
   */

  append(field, val) {
    const prev = this.get(field);

    if (prev) {
      val = Array.isArray(prev)
        ? prev.concat(val)
        : [prev].concat(val);
    }

    return this.set(field, val);
  }

  /**
   * Remove header `field`.
   *
   * @param {String} name
   */

  remove(field) {
    this.res.removeHeader(field);
  }

  /**
   * Vary on `field`.
   *
   * @param {String} field
   */

  vary(field) {
    vary(this.res, field);
  }

  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('back');
   *    this.redirect('back', '/index.html');
   *    this.redirect('/login');
   *    this.redirect('http://google.com');
   *
   * @param {String} url
   * @param {String} [alt]
   */

  redirect(url, alt) {
    // location
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);

    // status
    if (!statuses.redirect[this.status]) this.status = 302;

    // html
    if (this.ctx.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    // text
    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain a charset.
   *
   * Examples:
   *
   *     this.res.type = '.html';
   *     this.res.type = 'html';
   *     this.res.type = 'json';
   *     this.res.type = 'application/json';
   *     this.res.type = 'png';
   *
   * @param {String} type
   */

  set type(type) {
    type = getType(type);
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  }

  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   */

  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';')[0];
  }

  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `this.request.is()`.
   *
   * @param {String|Array} types...
   * @return {String|false}
   * @api public
   */

  is(types) {
    const type = this.type;
    if (!types) return type || false;
    if (!Array.isArray(types)) types = [].slice.call(arguments);
    return typeis(type, types);
  }

  /**
  * Set the Last-Modified date using a string or a Date.
  *
  *     this.response.lastModified = new Date();
  *     this.response.lastModified = '2013-09-13';
  *
  * @param {String|Date} type
  */

  set lastModified(val) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
  }

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   */

  get lastModified() {
    const date = this.get('last-modified');
    if (date) return new Date(date);
  }

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   *
   * @param {String} etag
   */

  set etag(val) {
    if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
    this.set('ETag', val);
  }

  /**
   * Get the ETag of a response.
   *
   * @return {String}
   */

  get etag() {
    return this.get('ETag');
  }

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   */

  attachment(filename) {
    if (filename) this.type = extname(filename);
    this.set('Content-Disposition', contentDisposition(filename));
  }
}

module.exports = CubResponse;
