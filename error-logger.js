const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      fs.writeFileSync('react-error.log', body);
      res.writeHead(200);
      res.end('Logged');
    });
  } else {
    res.writeHead(200);
    res.end('OK');
  }
});
server.listen(8123, () => console.log('Listening on 8123'));
