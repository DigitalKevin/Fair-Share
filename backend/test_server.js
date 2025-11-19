const http = require('http');
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(4001, () => console.log('test server listening on 4001'));
