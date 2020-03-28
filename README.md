# Got-iconv

> A [got](https://github.com/sindresorhus/got) wrapper with automaticlly encoding conversion using iconv-lite.

[![Build Status](https://travis-ci.org/fengkx/got-iconv.svg?branch=master)](https://travis-ci.org/fengkx/got-iconv)
[![Coverage Status](https://coveralls.io/repos/github/fengkx/got-iconv/badge.svg?branch=master)](https://coveralls.io/github/fengkx/got-iconv?branch=master)
[![Install Size](https://badgen.net/packagephobia/install/got-iconv)](https://bundlephobia.com/result?p=got-iconv)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

[![NPM](https://nodei.co/npm/got-iconv.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/got-iconv/)

```$xslt
npm i got-iconv
```

Build on top of [iconv-lite](https://www.npmjs.com/package/iconv-lite) and some awesome `WHATWG` packages maked by the jsdom team.

- [whatwg-encoding](https://www.npmjs.com/package/whatwg-encoding)
- [whatwg-mimetype](https://www.npmjs.com/package/whatwg-mimetype)
- [html-encoding-sniffer](https://www.npmjs.com/package/html-encoding-sniffer)

Only two extra options.

## options._throwEncodingNotDetected

Whether reject the promise or destory the stream when not any of these [encoding](https://github.com/fengkx/whatwg-encoding-mapper) is detected.

defaults value is false, which will use `utf8` as a fallback.

## options._throwEncodingNotSupported

Whether reject the promise or destory the stream when the encoding is no supported by [iconv-lite](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

defaults value is false, which will use `utf8` as a fallback.

You may want to see some example in [test cases](https://github.com/fengkx/got-iconv/blob/master/test/encoding-not-support.js).
# Enjoy
No more things! From now you don't really need to handle the MIME type and charset. Especially for non English users.
