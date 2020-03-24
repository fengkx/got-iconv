const test = require('ava');
const got = require('..');
const createTestServer = require('./helper/create-test-server');
const getStream = require('get-stream');
const iconv = require('iconv-lite');

let _encodingExists;
test.before(() => {
	_encodingExists = iconv.encodingExists;
	iconv.encodingExists = () => {
		return false;
	};
});

test.after(() => {
	iconv.encodingExists = _encodingExists;
});

test('encoding not support', async t => {
	const text = 'iconv mock🦄ed🦄🦄你好';
	const url = await createTestServer('text/plain;charset=gbk', text);
	const err = await t.throwsAsync(got(url, {_throwEncodingNotSupported: true}), {instanceOf: got.EncodingNotSupportError});
	t.is(err.message, 'GBK not supported by iconv-lite');

	const resp = await got(url);
	t.is(resp.body, text);

	const s = got.stream(url, {
		_throwEncodingNotSupported: true
	});
	try {
		await getStream(s);
	} catch (error) {
		t.is(error.message, 'GBK not supported by iconv-lite');
	}
});

test('encoding not detected', async t => {
	const url = await createTestServer('test/plain;', 'iconv-mocked');
	const err = await t.throwsAsync(got(url, {_throwEncodingNotDetected: true}), {instanceOf: got.EncodingNotDetectedError});
	t.is(err.message, 'can not detecte any of encoding');

	const s = await got.stream(url, {
		_throwEncodingNotDetected: true
	});
	try {
		await getStream(s);
	} catch (error) {
		t.is(error.message, 'can not detecte any of encoding');
	}
});
