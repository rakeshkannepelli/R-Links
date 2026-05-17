const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  pinned: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Link = mongoose.model('Link', linkSchema);
module.exports = Link;
