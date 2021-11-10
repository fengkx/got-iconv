const test = require('ava');
const MIMEType = require('whatwg-mimetype');
const getStream = require('get-stream');
const got = require('..');
const createTestServer = require('./helper/create-test-server');

test('large file in utf8', async t => {
	const text = '大'.repeat(409_600);
	const url = await createTestServer('text/plain', text);
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'text');
	t.is(mime.subtype, 'plain');
	t.is(resp.body, text);

	const s = got.stream(url);
	t.is(await getStream(s), text);
});
