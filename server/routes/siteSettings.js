const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const Article = require('../models/Article');

// @route  GET /api/site-settings
// @desc   Get global site settings (author profile, etc.)
router.get('/', async (req, res) => {
  try {
    // findOneAndUpdate with upsert ensures we always get/create the singleton
    let settings = await SiteSettings.findOne({ key: 'global' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'global' });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route  PUT /api/site-settings
// @desc   Update global site settings
router.put('/', async (req, res) => {
  try {
    const { authorName, authorBio, authorAvatar } = req.body;
    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { authorName, authorBio, authorAvatar },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route  POST /api/site-settings/migrate-author
// @desc   One-time migration to clear author fields from all articles so global profile takes over
router.post('/migrate-author', async (req, res) => {
  try {
    // Clear author fields from every article unconditionally
    const result = await Article.updateMany(
      {},
      { $set: { authorName: '', authorBio: '', authorAvatar: '' } }
    );
    res.json({ message: `Migration complete. ${result.modifiedCount} article(s) updated.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Migration failed', error: err.message });
  }
});

module.exports = router;
