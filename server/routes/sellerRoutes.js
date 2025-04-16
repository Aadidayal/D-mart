// server/routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create store directory if it doesn't exist
const storeDir = path.join(__dirname, '../store');
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir);
}

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, storeDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to handle seller form submission
router.post('/', upload.single('productImage'), (req, res) => {
  try {
    const formData = req.body;
    const imageFile = req.file;
    
    // Create a unique ID for the product
    const productId = Date.now().toString();
    
    // Create product data object
    const productData = {
      id: productId,
      ...formData,
      imageUrl: imageFile ? `/store/${imageFile.filename}` : null,
      createdAt: new Date().toISOString()
    };
    
    // Save product data to a JSON file
    const productFilePath = path.join(storeDir, `product-${productId}.json`);
    fs.writeFileSync(productFilePath, JSON.stringify(productData, null, 2));
    
    res.status(201).json({ 
      success: true, 
      message: 'Product information stored successfully',
      data: productData
    });
  } catch (error) {
    console.error('Error storing product data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to store product information' 
    });
  }
});

module.exports = router;