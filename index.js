const {Transform, pipeline, PassThrough} = require('stream');
const got = require('got');
const iconv = require('iconv-lite');
const MIMEType = require('whatwg-mimetype');
const encodeMapper = require('whatwg-encoding-mapper');
const htmlEncodingSniffer = require('html-encoding-sniffer-xs');
const xmlEncodingSniffer = require('./xml-encoding-sniff');

const gotIconv = got.extend({
	handlers: [
		iconvConvert
	]
});

function detecteFromBuffer(mime, buffer) {
	let encodingDetected;
	const charset = mime && mime.parameters.get('charset');
	if (mime) {
		if (mime.isHTML()) {
			encodingDetected = htmlEncodingSniffer(buffer, {transportLayerEncodingLabel: charset});
		} else if (mime.isXML()) {
			encodingDetected = xmlEncodingSniffer(buffer);
		}
	}

	if (!encodingDetected && charset) {
		encodingDetected = encodeMapper.labelToName(charset);
	}

	return encodingDetected;
}

function convertStream(options, next) {
	let mime;
	const kbStream = new BufferKbStream();
	kbStream
		.once('kb', function (buffer) {
			const encodingDetected = detecteFromBuffer(mime, buffer);
			if (!encodingDetected && options._throwEncodingNotDetected === true) {
				const err = new EncodingNotDetectedError('can not detecte any of encoding');
				this.destroy(err);
			}

			const encoding = encodingDetected || 'utf8';
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
		this._len = 0;
		this._kbFlag = false;
	}

	_transform(chunk, encoding, callback) {
		this._len += chunk.byteLength;
		if (!this._kbFlag) {
			this._data.push(chunk);
		}

		if (this._len >= 1024) {
			this.emit('kb', Buffer.concat(this._data));
			this._kbFlag = true;
		}

		callback(null, chunk);
	}

	_final(callback) {
		if (!this._kbFlag) {
			this.emit('kb', Buffer.concat(this._data));
		}

		callback();
	}
}

class EncodingNotSupportError extends Error {
	constructor(message) {
		super(message);
		this.name = 'EncodingNotSupportError';
	}
}
class EncodingNotDetectedError extends Error {
	constructor(message) {
		super(message);
		this.name = 'EncodingNotDetectedError';
	}
}
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
		const encodingDetected = detecteFromBuffer(mime, buffer);

		if (!encodingDetected && options._throwEncodingNotDetected) {
			return Promise.reject(new EncodingNotDetectedError('can not detecte any of encoding'));
		}

		const encoding = encodingDetected || 'utf8';
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

		return resp;
	})();
}

module.exports = gotIconv;
module.exports.default = gotIconv;
module.exports.EncodingNotDetectedError = EncodingNotDetectedError;
module.exports.EncodingNotSupportError = EncodingNotSupportError;
