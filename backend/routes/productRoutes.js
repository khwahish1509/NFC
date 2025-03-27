const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET product by productId
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create a new product
router.post('/', async (req, res) => {
  const product = new Product({
    productId: req.body.productId,
    productName: req.body.productName,
    origin: req.body.origin,
    batchNumber: req.body.batchNumber,
    dateProduced: req.body.dateProduced,
    createdBy: req.body.createdBy,
    currentLocation: req.body.currentLocation,
    transferHistory: req.body.transferHistory || []
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update product details
router.put('/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.productName) product.productName = req.body.productName;
    if (req.body.origin) product.origin = req.body.origin;
    if (req.body.batchNumber) product.batchNumber = req.body.batchNumber;
    if (req.body.dateProduced) product.dateProduced = req.body.dateProduced;
    if (req.body.currentLocation) product.currentLocation = req.body.currentLocation;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH update product transfer history
router.patch('/:productId/transfer', async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update current location
    product.currentLocation = req.body.location;
    
    // Add to transfer history
    product.transferHistory.push({
      location: req.body.location,
      transferredBy: req.body.transferredBy,
      gpsCoordinates: req.body.gpsCoordinates
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
router.delete('/:productId', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 