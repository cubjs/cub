# @cub/cub

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@cub/cub.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@cub/cub
[travis-image]: https://img.shields.io/travis/cubjs/cub.svg?style=flat-square
[travis-url]: https://travis-ci.org/cubjs/cub
[codecov-image]: https://img.shields.io/codecov/c/github/cubjs/cub.svg?style=flat-square
[codecov-url]: https://codecov.io/github/cubjs/cub?branch=master
[david-image]: https://img.shields.io/david/cubjs/cub.svg?style=flat-square
[david-url]: https://david-dm.org/cubjs/cub
[snyk-image]: https://snyk.io/test/npm/@cub/cub/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/@cub/cub
[download-image]: https://img.shields.io/npm/dm/@cub/cub.svg?style=flat-square
[download-url]: https://npmjs.org/package/@cub/cub

a web framework for fibjs

## Install

```bash
$ npm i @cub/cub --save
```

## Quick Start

```js
const Cub = require('@cub/cub');

const cub = new Cub();

cub.register(ctx => {
  ctx.body = 'Hello World!';
});

cub.listen(8000);
```

## Usage

- multi-register

Register function can be invoked many times to accept interceptor. All these registered interceptors will be executed one by one.

```js
cub.register(ctx => {
  ctx.body = 'Hello';
});

cub.register(ctx => {
  ctx.body += ' World!';
});
```

- stop execute register

If you want to stop running the flowing interceptor, just return `false`(only `false` accept) in the current interceptor.

```js
cub.register(ctx => {
  ctx.body = 'Hello ';
  return false; // only `false` accept
});

cub.register(ctx => {
  ctx.body += ' World!';
});
```

- If you want to execute some logic after the last interceptor has been invoked like koa design, you register a an instance of BaseInterceptor.

```js
const BaseInterceptor = Cub.BaseInterceptor;

cub.register(new class extends BaseInterceptor {
  before (ctx){
    ctx.body = 'Hello';
  }

  after (ctx){
    ctx.body += ' World!';
  }
});

```

## API

todo

## Benchmark

Cub :

```bash
➜  ~ wrk -c100 -t10  -d5  --latency  http://127.0.0.1:8000
Running 5s test @ http://127.0.0.1:8000
  10 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     1.91ms    4.09ms  55.16ms   97.72%
    Req/Sec     7.11k     1.09k   15.14k    93.07%
  Latency Distribution
     50%    1.38ms
     75%    1.44ms
     90%    1.53ms
     99%   24.96ms
  357495 requests in 5.10s, 41.93MB read
Requests/sec:  70060.74
Transfer/sec:      8.22MB
```

Koa@2 with Node.js 7.10.0:

```bash
➜  ~ wrk -c100 -t10  -d5  --latency  http://127.0.0.1:8000
Running 5s test @ http://127.0.0.1:8000
  10 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     6.51ms    1.09ms  20.98ms   91.32%
    Req/Sec     1.54k   581.07    14.30k    99.80%
  Latency Distribution
     50%    6.40ms
     75%    6.84ms
     90%    7.33ms
     99%    9.78ms
  76959 requests in 5.10s, 10.94MB read
Requests/sec:  15093.17
Transfer/sec:      2.14MB
```

express@4 with Node.js 7.10.0:

```bash
➜  ~ wrk -c100 -t10  -d5  --latency  http://127.0.0.1:8000
Running 5s test @ http://127.0.0.1:8000
  10 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     9.13ms  769.26us  16.17ms   82.08%
    Req/Sec     1.10k    61.17     1.21k    74.20%
  Latency Distribution
     50%    8.94ms
     75%    9.38ms
     90%   10.05ms
     99%   11.95ms
  54787 requests in 5.02s, 11.23MB read
Requests/sec:  10920.82
Transfer/sec:      2.24MB
```

## Questions & Suggestions

Please open an issue [here](https://github.com/cubjs/cub/issues).

## License

[MIT](LICENSE)