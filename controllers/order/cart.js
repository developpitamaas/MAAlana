const Cart = require("../../model/order/cart");
const TryCatch = require("../../middleware/Trycatch");
const Product = require("../../model/Product/product");

const addToCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, shippingPrice, CoupanCode, id } = req.body;
  console.log(req.body);
  if (!productId || !quantity) {
    return res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
  }

  // Find the product to ensure it exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Find or create the cart for the user
  let cart = await Cart.findOne({ user: id });

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = new Cart({
      userId: id,
      items: [],
    });
  }

  // Check if the product is already in the cart
  const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

  if (existingItemIndex > -1) {
    // Update the quantity of the existing item
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].shippingPrice = shippingPrice;
    cart.items[existingItemIndex].CoupanCode = CoupanCode;
  } else {
    // Add a new item to the cart
    cart.items.push({
      productId: productId,
      quantity,
      shippingPrice,
      CoupanCode,
    });
  }

  // Save the cart
  await cart.save();

  res.status(200).json({
    success: true,
    cart,
    message: "Product added to cart successfully",
  });
});

// get cart product by user id 

const getCart = TryCatch(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.id }).populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});

// get all cart product by user id

const getAllCartByUser = TryCatch(async (req, res, next) => {
  const cart = await Cart.find({ userId: req.params.id }).populate("items.productId");
  if (!cart || cart.length === 0) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }

  // Calculate the total number of items based on the quantity
  const numberOfItems = cart.reduce((total, cartItem) => {
    const itemCount = cartItem.items.reduce((sum, item) => sum + item.quantity, 0);
    return total + itemCount;
  }, 0);

  res.status(200).json({
    success: true,
    cart,
    numberOfItems,
    message: "Cart fetched successfully"
  });
});

// get all cart product 

const getAllCart = TryCatch(async (req, res, next) => {
  const cart = await Cart.find().populate("items.productId");
  if (!cart) {
    return res.status(404).json({ success: false, message: "Cart not found" });
  }
  res.status(200).json({ success: true, cart, message: "Cart fetched successfully" });
});

const updateCart = TryCatch(async (req, res, next) => {
  const { productId, quantity, userId, cartId } = req.body;

  // Validate input
  if (!productId || !quantity && quantity !== 0 || !userId || !cartId) {
    return res.status(400).json({ success: false, message: 'Product ID, quantity, user ID, and cart ID are required.' });
  }

  // Find the cart for the user
  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Find the product in the cart
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Find the item in the cart
  const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ success: false, message: 'Item not found in the cart.' });
  }

  if (quantity === 0) {
    // Remove the item from the cart if quantity is 0
    cart.items.splice(itemIndex, 1);
  } else {
    // Update the quantity of the item
    cart.items[itemIndex].quantity = quantity;
  }

  // Save the cart
  await cart.save();
  
  res.status(200).json({ success: true, cart, message: 'Cart updated successfully.' });
});


// delete cart all product by user id

const deleteCart = TryCatch(async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId);

  // Validate input
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  // Delete all carts for the user
  const result = await Cart.deleteMany({ userId });

  // Check if any carts were deleted
  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'No carts found for the user.' });
  }

  res.status(200).json({ success: true, message: 'All carts deleted successfully.' });
});

// delete cart product by user id and _id

const deleteCartProduct = TryCatch(async (req, res, next) => {
  const { userId, productId, cartId } = req.body;

  // Validate input
  if (!userId || !productId || !cartId) {
    return res.status(400).json({ success: false, message: 'User ID, product ID, and cart ID are required.' });
  }

  // Find the cart for the user
  const cart = await Cart.findOne({ _id: cartId, userId });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found.' });
  }

  // Check if cart.items is an array
  if (!Array.isArray(cart.items)) {
    return res.status(500).json({ success: false, message: 'Invalid cart structure.' });
  }

  // Filter out the product from the cart items
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());

  // If no items were removed, return a message indicating the product was not found
  if (cart.items.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Product not found in cart.' });
  }

  // Save the updated cart
  await cart.save();

  res.status(200).json({ success: true, message: 'Product removed from cart successfully.', cart });
});


// export
module.exports = {
  addToCart,
  getCart,
  getAllCart,
  updateCart,
  getAllCartByUser,
  deleteCart,
  deleteCartProduct
};
