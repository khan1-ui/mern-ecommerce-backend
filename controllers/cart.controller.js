import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// GET CART
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  if (!cart) {
    return res.json({ items: [] });
  }

  res.json(cart);
};

// ADD TO CART
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  console.log("ADD TO CART HIT");


  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity }],
    });
  } else {
    const index = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
  }

  res.json(cart);
};

// REMOVE ITEM
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};

// CLEAR CART (After Order)
export const clearCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [] }
  );
};
