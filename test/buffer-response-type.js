const test = require('ava');
const got = require('..');
const createTestServer = require('./helper/create-test-server');
const MIMEType = require('whatwg-mimetype');
const is = require('@sindresorhus/is');

test('buffer responseType', async t => {
	const text = 'ABCDEFG';
	const url = await createTestServer('text/plain', text);
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'text');
	t.is(mime.subtype, 'plain');
	t.is(resp.body, text);

	const resp2 = await got(url, {
		responseType: 'buffer'
	});
	t.true(is.buffer(resp2.body));
	t.is(resp2.body.toString(), text);
});
