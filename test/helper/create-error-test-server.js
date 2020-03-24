const http = require('http');
const listen = require('test-listen');
module.exports = async error => {
	const srv = http.createServer((request, response) => {
		response.socket.destroy(error);
	}).on('error', console.log);
	const url = await listen(srv);
	return url;
};
