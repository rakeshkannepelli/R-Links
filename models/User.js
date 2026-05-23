const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const linkSchema = new mongoose.Schema({
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

const userSchema = new mongoose.Schema({
  operatorId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    default: 'Senior Link Architect'
  },
  photoUrl: {
    type: String,
    default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  links: [linkSchema]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
});

// Compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
