const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  // We use a singleton pattern - only one document will exist
  key: { type: String, default: 'global', unique: true },
  authorName: { type: String, default: 'Written by the Editorial Staff' },
  authorBio: { type: String, default: 'Committed to exploring the intersection of orthodox faith and rigorous leadership practice.' },
  authorAvatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
