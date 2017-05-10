// Modified from https://github.com/koajs/koa/tree/master/test

const test = require('test');
const assert = require('assert');

test.setup();

const response = require('../../helpers/context').response;

describe('etag=', () => {
  describe('res.etag=', () => {
    it('should not modify an etag with quotes', () => {
      const res = response();
      res.etag = '"asdf"';
      assert.equal(res.header.etag, '"asdf"');
    });

    it('should not modify a weak etag', () => {
      const res = response();
      res.etag = 'W/"asdf"';
      assert.equal(res.header.etag, 'W/"asdf"');
    });

    it('should add quotes around an etag if necessary', () => {
      const res = response();
      res.etag = 'asdf';
      assert.equal(res.header.etag, '"asdf"');
    });
  });

  describe('res.etag', () => {
    it('should return etag', () => {
      const res = response();
      res.etag = '"asdf"';
      assert.equal(res.etag, '"asdf"');
    });
  });
});

// process.exit(test.run(console.DEBUG));
