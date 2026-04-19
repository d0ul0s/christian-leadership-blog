const mongoose = require('mongoose');
const Article = require('./models/Article');
require('dotenv').config();

async function migrate() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/servant_paradigm';
    console.log(`Connecting to: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Clear author fields from EVERY article unconditionally
    const result = await Article.updateMany(
      {},
      { $set: { authorName: '', authorBio: '', authorAvatar: '' } }
    );
    
    console.log(`Migration complete. ${result.modifiedCount} article(s) updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
