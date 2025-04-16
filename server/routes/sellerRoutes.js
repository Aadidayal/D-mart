// // server/routes/sellerRoutes.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

// // Create store directory if it doesn't exist
// const storeDir = path.join(__dirname, '../store');
// if (!fs.existsSync(storeDir)) {
//   fs.mkdirSync(storeDir);
// }

// // Set up storage for uploaded files
// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, storeDir);
//   },
//   filename: function(req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// // Route to handle seller form submission
// router.post('/', upload.single('productImage'), (req, res) => {
//   try {
//     const formData = req.body;
//     const imageFile = req.file;
    
//     // Create a unique ID for the product
//     const productId = Date.now().toString();
    
//     // Create product data object
//     const productData = {
//       id: productId,
//       ...formData,
//       imageUrl: imageFile ? `/store/${imageFile.filename}` : null,
//       createdAt: new Date().toISOString()
//     };
    
//     // Save product data to a JSON file
//     const productFilePath = path.join(storeDir, `product-${productId}.json`);
//     fs.writeFileSync(productFilePath, JSON.stringify(productData, null, 2));
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Product information stored successfully',
//       data: productData
//     });
//   } catch (error) {
//     console.error('Error storing product data:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to store product information' 
//     });
//   }
// });

// module.exports = router;

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

// GET all products
router.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(storeDir).filter(file => file.startsWith('product-') && file.endsWith('.json'));
    const products = files.map(file => JSON.parse(fs.readFileSync(path.join(storeDir, file))));
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
});

// GET product by ID
router.get('/:id', (req, res) => {
  try {
    const productFilePath = path.join(storeDir, `product-${req.params.id}.json`);
    if (fs.existsSync(productFilePath)) {
      const productData = JSON.parse(fs.readFileSync(productFilePath));
      res.json({ success: true, data: productData });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve product' });
  }
});

// POST new product
router.post('/', upload.single('productImage'), (req, res) => {
  try {
    const formData = req.body;
    const imageFile = req.file;
    
    const productId = Date.now().toString();
    const productData = {
      id: productId,
      ...formData,
      imageUrl: imageFile ? `/store/${imageFile.filename}` : null,
      createdAt: new Date().toISOString()
    };
    
    const productFilePath = path.join(storeDir, `product-${productId}.json`);
    fs.writeFileSync(productFilePath, JSON.stringify(productData, null, 2));
    
    res.status(201).json({ success: true, message: 'Product stored successfully', data: productData });
  } catch (error) {
    console.error('Error storing product:', error);
    res.status(500).json({ success: false, message: 'Failed to store product' });
  }
});

// PUT update product
router.put('/:id', upload.single('productImage'), (req, res) => {
  try {
    const productFilePath = path.join(storeDir, `product-${req.params.id}.json`);
    if (!fs.existsSync(productFilePath)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const formData = req.body;
    const imageFile = req.file;
    const existingData = JSON.parse(fs.readFileSync(productFilePath));
    const updatedData = {
      ...existingData,
      ...formData,
      imageUrl: imageFile ? `/store/${imageFile.filename}` : existingData.imageUrl,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(productFilePath, JSON.stringify(updatedData, null, 2));
    res.json({ success: true, message: 'Product updated successfully', data: updatedData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// DELETE product
// DELETE product
router.delete('/:id', (req, res) => {
  try {
    const productId = req.params.id;
    const files = fs.readdirSync(storeDir).filter(file => file.startsWith('product-') && file.endsWith('.json'));
    
    const productFile = files.find(file => {
      const fileId = file.replace('product-', '').replace('.json', '');
      return fileId === productId; // Match the ID without assuming full filename
    });

    if (!productFile) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const productFilePath = path.join(storeDir, productFile);
    fs.unlinkSync(productFilePath);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
});

module.exports = router;