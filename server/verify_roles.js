const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nathan-blog');
    const owner = await User.findOne({ email: 'exact-subzero-jury@duck.com' });
    console.log('Owner Role:', owner ? owner.role : 'User not found');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

verify();
