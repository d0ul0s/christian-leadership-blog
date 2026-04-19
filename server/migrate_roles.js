const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nathan-blog');
    console.log('Connected to MongoDB');

    // 1. Set superadmin role for the owner email
    const ownerEmail = 'exact-subzero-jury@duck.com';
    await User.updateOne(
      { email: ownerEmail },
      { $set: { role: 'superadmin', isAdmin: true } }
    );
    console.log(`Set ${ownerEmail} as superadmin`);

    // 2. Set default 'user' role for everyone else who doesn't have a role
    await User.updateMany(
      { role: { $exists: false }, email: { $ne: ownerEmail } },
      { $set: { role: 'user' } }
    );
    console.log('Set default roles for other users');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
