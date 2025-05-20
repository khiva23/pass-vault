const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  website: String,
  username: String,
  password: String // Encrypted
});

module.exports = mongoose.model('Password', passwordSchema);
