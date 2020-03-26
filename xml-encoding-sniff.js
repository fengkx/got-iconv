const xmlEncodingSniff = (buffer, fallbackEncoding) => {
	// https://www.w3.org/TR/xml/#sec-TextDecl
	/**
	 *  [77]   	TextDecl	   ::=   	'<?xml' VersionInfo? EncodingDecl S? '?>'
	 *  The text declaration MUST be provided literally, not by reference to a parsed entity.
	 *  The text declaration MUST NOT appear at any position other than the beginning of an external parsed entity.
	 *  The text declaration in an external parsed entity is not considered part of its replacement text.
	 */
	const o = [];
	if (buffer.length < 4) {
		return fallbackEncoding || null;
	}

	// <?xml
	if (!(buffer[0] === 0x3C && buffer[1] === 0x3F && buffer[2] === 0x78 && buffer[3] === 0x6D && buffer[4] === 0x6C)) {
		return fallbackEncoding || null;
	}

	let encoding;
	for (let i = 3; i < buffer.length; i++) {
		const c = buffer[i];
		const cBefore = buffer[i - 1];
		o.push(c);
		if (cBefore === 0x3F && c === 0x3E) {
			break;
		}
	}

	const textDecl = Buffer.from(o).toString();
	const matched = textDecl.match(/encoding=['"]([A-Za-z]([-.\w])*)['"]/);
	if (matched && matched.length >= 1) {
		encoding = matched[1];
	} else {
		encoding = fallbackEncoding;
	}

	return encoding || null;
};

module.exports = xmlEncodingSniff;
module.exports.default = xmlEncodingSniff;
