const http = require('http');

const data = JSON.stringify({
  userId: '65f9b3e1c0d4f1001c234567', // Fake valid hex string ObjectId
  fullName: 'Test User',
  text: 'Hello world'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/articles/servant-leadership-modern/comment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
