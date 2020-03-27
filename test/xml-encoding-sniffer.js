const test = require('ava');
const iconv = require('iconv-lite');
const {labelToName} = require('whatwg-encoding-mapper');
const xmlEncodingSniffer = require('../xml-encoding-sniff');

test('should sniif utf8', t => {
	const xml1 = '<?xml version="1.0" encoding="UTF-8"?><rss  xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"/>';
	const encoding = xmlEncodingSniffer(Buffer.from(xml1));
	t.is(encoding, labelToName('UTF-8'));

	const xml2 = '<?xml version="1.0" encoding="UTF-8"  ?>';
	t.is(labelToName(xmlEncodingSniffer(Buffer.from(xml2))), labelToName('UTF-8'));
});

test('should sniif gbk', t => {
	const xml1 = iconv.encode('<?xml version="1.0" encoding="gbk"?><rss  xmlns:atom="http://www.w3.org/2005/Atom" version="2.0"/>', 'gbk');
	const encoding = xmlEncodingSniffer(Buffer.from(xml1));
	t.is(encoding, labelToName('gbk'));

	const xml2 = iconv.encode('<?xml version="1.0" encoding="gbk"  ?>', 'gbk');
	t.is(xmlEncodingSniffer(Buffer.from(xml2)), labelToName('gbk'));
});

test('should get fallback', t => {
	const xml1 = iconv.encode('<?xml version="1.0"?>', 'gbk');
	const fallback = 'big5';
	t.is(xmlEncodingSniffer(xml1, fallback), fallback);

	const xml2 = iconv.encode('<?XML version="1.0"?>', 'gbk');
	t.is(xmlEncodingSniffer(xml2, fallback), fallback);

	const xml3 = iconv.encode('', 'gbk');
	t.is(xmlEncodingSniffer(xml3, fallback), fallback);
});

test('should get null', t => {
	const xml1 = iconv.encode('<?xml version="1.0"?>', 'gbk');
	t.is(xmlEncodingSniffer(xml1), null);

	const xml2 = iconv.encode('<?XML version="1.0"?>', 'gbk');
	t.is(xmlEncodingSniffer(xml2), null);

	const xml3 = iconv.encode('', 'gbk');
	t.is(xmlEncodingSniffer(xml3), null);
});
