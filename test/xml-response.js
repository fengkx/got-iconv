const test = require('ava');
const iconv = require('iconv-lite');
const MIMEType = require('whatwg-mimetype');
const getStream = require('get-stream');
const got = require('..');
const createTestServer = require('./helper/create-test-server');

test('xml content without charset in header', async t => {
	const xml = '<?xml version="1.0" encoding="gbk"?><rss  xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">你好';
	const url = await createTestServer('application/xml', iconv.encode(xml, 'gbk'));
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'application');
	t.is(mime.subtype, 'xml');
	t.falsy(mime.parameters.get('charset'));
	t.is(resp.body, xml);

	const s = got.stream(url);
	t.is(await getStream(s), xml);
});

test('xml content without charset in header and wrong encoding', async t => {
	const xml = '<?xml version="1.0" encoding="utf8"?><rss  xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"><你好';
	const url = await createTestServer('application/xml', iconv.encode(xml, 'gbk'));
	const resp = await got(url);
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'application');
	t.is(mime.subtype, 'xml');
	t.falsy(mime.parameters.get('charset'));
	t.not(resp.body, xml);

	const s = got.stream(url);
	t.not(await getStream(s), xml);
});
