const http = require('http');
const listen = require('test-listen');
module.exports = async (method, contentType, data) => {
	if (data === undefined) {
		data = contentType;
		contentType = method;
		method = 'GET';
	}

	const srv = http.createServer((request, response) => {
		if (request.method === method) {
			response.setHeader('Content-Type', contentType);
			response.write(data);
			response.end();
			return;
		}

		response.statusCode = 405;
		response.end();
	});
	const url = await listen(srv);
	return url;
};
