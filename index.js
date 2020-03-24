const {Transform, pipeline, PassThrough} = require('stream');
const got = require('got');
const iconv = require('iconv-lite');
const MIMEType = require('whatwg-mimetype');
const encodeMapper = require('whatwg-encoding-mapper');
const htmlEncodingSniffer = require('html-encoding-sniffer');

const gotIconv = got.extend({
	handlers: [
		iconvConvert
	]
});

function convertStream(options, next) {
	let mime;
	let encodingDetected;
	let encoding;

	const kbStream = new BufferKbStream();
	kbStream
		.once('kb', function (data) {
			if (!encodingDetected && mime && mime.isHTML()) {
				encodingDetected = htmlEncodingSniffer(data);
			}

			if (!encodingDetected && options._throwEncodingNotDetected === true) {
				const err = new EncodingNotDetectedError('can not detecte any of encoding');
				this.destroy(err);
			}

			encoding = encodingDetected || 'utf8';
			if (iconv.encodingExists(encodingDetected)) {
				this.emit('encoding', encoding);
			} else {
				if (options._throwEncodingNotSupported) {
					const err = new EncodingNotSupportError(`${encoding} not supported by iconv-lite`);
					this.destroy(err);
				}

				this.emit('encoding', encoding);
			}
		});

	const source = next(options);
	source
		.on('response', response => {
			mime = response.headers['content-type'] && new MIMEType(response.headers['content-type']);
			const charset = mime && mime.parameters.get('charset');
			encodingDetected = charset && encodeMapper.labelToName(charset);
		});

	const r = new PassThrough();
	const p1 = pipeline(source, kbStream, err => {
		if (err) {
			r.emit('error', err);
		}
	});
	kbStream.once('encoding', enc => {
		pipeline(p1, iconv.decodeStream(enc), r, err => {
			if (err) {
				r.emit('error', err);
			}
		});
	});

	return r;
}

class BufferKbStream extends Transform {
	constructor() {
		super();
		this._data = [];
		this._kbCount = 0;
	}

	_transform(chunk, encoding, callback) {
		this._data.push(chunk);
		this._kbCount += chunk.byteLength;
		if (this._kbCount >= 1024) {
			this.emit('kb', Buffer.concat(this._data));
			this._kbCount = 0;
		}

		callback(null, chunk);
	}

	_final(callback) {
		this.emit('kb', Buffer.concat(this._data));
		callback();
	}
}

class EncodingNotSupportError extends Error {}
class EncodingNotDetectedError extends Error {}
function iconvConvert(options, next) {
	if (options.responseType === 'buffer') {
		return next(options);
	}

	options._responseType = options.responseType;
	options.responseType = 'buffer';
	if (options.isStream) {
		return convertStream(options, next);
	}

	return (async () => {
		if (options.resolveBodyOnly) {
			options._resolveBodyOnly = true;
			options.resolveBodyOnly = false;
		}

		const resp = await next(options);
		const buffer = resp.body;
		const mime = resp.headers['content-type'] && new MIMEType(resp.headers['content-type']);
		const charset = mime && mime.parameters.get('charset');
		let encodingDetected;
		if (charset === undefined && mime && mime.isHTML()) {
			encodingDetected = htmlEncodingSniffer(buffer);
		} else if (charset) {
			encodingDetected = encodeMapper.labelToName(charset);
		}

		if (!encodingDetected && options._throwEncodingNotDetected) {
			return Promise.reject(new EncodingNotDetectedError('can not detecte any of encoding'));
		}

		const encoding = encodingDetected || 'utf8';
		// Console.log(encodingDetected + ' ' + encoding)
		if (options._responseType === 'text' || options._responseType === 'json') {
			if (iconv.encodingExists(encoding)) {
				resp.body = iconv.decode(resp.body, encoding);
			} else {
				if (options._throwEncodingNotSupported) {
					return Promise.reject(new EncodingNotSupportError(`${encoding} not supported by iconv-lite`));
				}

				resp.body = iconv.decode(resp.body, 'utf8');
			}

			if (options._responseType === 'json') {
				try {
					resp.body = JSON.parse(resp.body);
					if (options._resolveBodyOnly) {
						return resp.body;
					}

					return resp;
				} catch (error) {
					return Promise.reject(new got.ParseError(error, resp, options));
				}
			}
		}

		return resp;
	})();
}

module.exports = gotIconv;
module.exports.default = gotIconv;
module.exports.EncodingNotDetectedError = EncodingNotDetectedError;
module.exports.EncodingNotSupportError = EncodingNotSupportError;
