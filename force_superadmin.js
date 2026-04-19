const mongoose = require('mongoose');
const User = require('./server/models/User');
require('dotenv').config({ path: './server/.env' });

async function promote() {
  const email = process.argv[2] || 'exact-subzero-jury@duck.com';
  try {
    console.log(`Attempting to promote ${email} to superadmin...`);
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'superadmin', isAdmin: true },
      { new: true }
    );
    if (result) {
      console.log(`SUCCESS: ${result.fullName} is now a ${result.role}`);
    } else {
      console.log(`ERROR: User with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Promotion failed:', err);
    process.exit(1);
  }
}

promote();
