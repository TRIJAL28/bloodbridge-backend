const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      lowercase: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['normal', 'critical'],
      default: 'normal',
    },
    unitsNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'fulfilled', 'cancelled'],
      default: 'open',
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);