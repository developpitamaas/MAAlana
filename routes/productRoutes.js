const express = require('express');
const router = express.Router();
const productController = require('../controllers/adminProductAdd/index'); 

// Route to add a product
router.post('/admin/add-product', productController.addProduct);

// Route to get all products
router.get('/admin/get-all-products', productController.getAllProducts);

// Route to get a product by ID
router.get('/admin/get-product-by-id/:id', productController.getProductById);

// route to update product by ID
router.put('/admin/update-product/:id', productController.updateProduct);

// route to delete product by ID
router.delete('/admin/delete-product/:id', productController.deleteProduct);

// route to get category product
router.get('/get-category-product/:category', productController.getProductByCategory);

// route to add best seller product
router.post('/admin/add-best-seller-product', productController.addBestSellerProduct);

// route to get best seller product
router.get('/admin/get-best-seller-product', productController.getBestSellerProduct);

// route to get orders
router.get('/get-orders', productController.getOrders);

// route to create order
router.post('/create-orders', productController.createOrder);

// route to get all orders
// router.get('/get-all-orders', productController.getAllOrders);

// send order details email
router.post('/send-order-details-email', productController.sendEmail);

// update the order status
router.put('/update-order-status/:id', productController.updateOrderStatus);

// exports
module.exports = router;
