const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  transferredBy: {
    type: String,
    required: true
  },
  gpsCoordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  dateProduced: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  transferHistory: [transferSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema); 