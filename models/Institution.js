const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['bloodbank', 'hospital'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    inventory: {
      'A+':  { type: Number, default: 0 },
      'A-':  { type: Number, default: 0 },
      'B+':  { type: Number, default: 0 },
      'B-':  { type: Number, default: 0 },
      'O+':  { type: Number, default: 0 },
      'O-':  { type: Number, default: 0 },
      'AB+': { type: Number, default: 0 },
      'AB-': { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institution', institutionSchema);