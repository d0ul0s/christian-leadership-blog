const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).select('email fullName role isAdmin');
    console.log('--- Current Database Users ---');
    users.forEach(u => {
      console.log(`${u.fullName} (${u.email}): Role=${u.role}, isAdmin=${u.isAdmin}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUser();
