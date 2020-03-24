const test = require('ava');
const got = require('..');
const {ParseError} = require('got');
const createTestServer = require('./helper/create-test-server');
const MIMEType = require('whatwg-mimetype');

test('json responseType', async t => {
	const jsonData = {
		a: 1,
		b: '2',
		c: null,
		d: {
			e: {
				f: '000'
			}
		}
	};
	const url = await createTestServer('application/json', JSON.stringify(jsonData));
	const resp = await got(url, {
		responseType: 'json'
	});
	const mime = new MIMEType(resp.headers['content-type']);
	t.is(mime.type, 'application');
	t.is(mime.subtype, 'json');
	t.deepEqual(resp.body, jsonData);

	const json = await got(url).json();
	t.deepEqual(json, jsonData);
	const bodyOnly = await got(url, {
		responseType: 'json',
		resolveBodyOnly: true
	});
	t.deepEqual(bodyOnly, jsonData);
});

test('json responseType throw ParserError', async t => {
	const notJSON = '{’a’:bce,"3”( ⊙ o ⊙ )啊！}';
	const url = await createTestServer('application/json', notJSON);
	await t.throwsAsync(got(url, {responseType: 'json'}), {instanceOf: ParseError, name: 'ParseError'});
});
