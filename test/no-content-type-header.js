const test = require('ava');
const getStream = require('get-stream');
const got = require('..');
const createTestServer = require('./helper/create-test-server');

test('when there is no content type header', async t => {
	const data = 'Hello 你好';
	const url = await createTestServer(data);
	const resp = await got(url);

	t.falsy(resp.headers['content-type']);
	t.is(resp.body, data);
	const s = got.stream(url);
	t.is(await getStream(s), data);

	const error = await t.throwsAsync(got(url, {_throwEncodingNotDetected: true}), {instanceOf: got.EncodingNotDetectedError});
	t.is(error.message, 'can not detecte any of encoding');

	const streamFail = await got.stream(url, {
		_throwEncodingNotDetected: true
	});
	try {
		await getStream(streamFail);
	} catch (error) {
		t.is(error.message, 'can not detecte any of encoding');
	}
});
