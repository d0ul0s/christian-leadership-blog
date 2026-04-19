const http = require('http');

const EMAIL = 'exact-subzero-jury@duck.com';
const PASSWORD = 'password'; 

function runTest() {
  const data = JSON.stringify({ email: EMAIL, password: PASSWORD });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('Testing login endpoint at http://localhost:5000/api/auth/login...');
  
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      const user = JSON.parse(body);
      if (res.statusCode >= 400) {
        console.error('Error response:', user.message || body);
        console.log('\nNOTE: This test requires a valid test account in the database.');
        return;
      }

      console.log('Login successful!');
      const requiredFields = [
        '_id', 'fullName', 'email', 'isAdmin', 'role', 
        'profilePicture', 'authorName', 'authorBio', 'authorAvatar'
      ];

      const missingFields = requiredFields.filter(field => !(field in user));

      if (missingFields.length > 0) {
        console.error('FAIL: Missing fields in response:', missingFields);
      } else {
        console.log('SUCCESS: All required fields are present in login response.');
        console.log('User data sample:', {
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          authorAvatar: user.authorAvatar
        });
      }
    });
  });

  req.on('error', (err) => {
    console.error('Error connecting to server:', err.message);
    console.log('\nNOTE: Ensure the backend server is running on port 5000.');
  });

  req.write(data);
  req.end();
}

runTest();
