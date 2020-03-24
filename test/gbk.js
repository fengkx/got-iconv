const test = require('ava');
const iconv = require('iconv-lite');
const got = require('..');
const createTestServer = require('./helper/create-test-server');
const MIMEType = require('whatwg-mimetype');
const getStream = require('get-stream');

test('content with charset in header', async t => {
	const text = '你好world';
	const url = await createTestServer('text/plain;charset=gbk', iconv.encode(text, 'gbk'));
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'text');
	t.is(mime.subtype, 'plain');
	t.is(mime.parameters.get('charset'), 'gbk');
	t.is(resp.body, text);

	const s = got.stream(url);
	t.is(await getStream(s), text);
});



test('content without charset in header', async (t) => {
	const html = '<meta charset="gbk"><title>你好world</title>';
	const url = await createTestServer('text/html', iconv.encode(html, 'gbk'));
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'text');
	t.is(mime.subtype, 'html');
	t.falsy(mime.parameters.get('charset'));
	t.is(resp.body, html);

	const s = got.stream(url);
	t.is(await getStream(s), html);
});
