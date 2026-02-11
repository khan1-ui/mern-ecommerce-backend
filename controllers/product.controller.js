import Product from "../models/Product.js";
import slugify from "slugify";

// @desc   Get all published products
// @route  GET /api/products
// @access Public
// @desc   Get product statistics
// @route  GET /api/products/stats
// @access Public
export const getProducts = async (req, res) => {
  const products = await Product.find({ isPublished: true });
  res.json(products);
};
export const getProductStats = async (req, res) => {
  try {
    const total = await Product.countDocuments({ isPublished: true });
    const digital = await Product.countDocuments({
      type: "digital",
      isPublished: true,
    });
    const physical = await Product.countDocuments({
      type: "physical",
      isPublished: true,
    });

    res.json({
      total,
      digital,
      physical,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
// @desc   Admin - get single product by id
// @route  GET /api/admin/products/:id
// @access Private/Admin
export const getProductByIdAdmin = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};


// @desc   Get single product by slug
// @route  GET /api/products/:slug
// @access Public
export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isPublished: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};


// @desc   Admin - get all products
// @route  GET /api/admin/products
// @access Private/Admin
export const getAllProductsAdmin = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// @desc   Admin - delete product
// @route  DELETE /api/admin/products/:id
// @access Private/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  await product.deleteOne();
  res.json({ message: "Product deleted" });
};
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description = "",
      price,
      type,
      stock,
    } = req.body || {};

    // 🔒 Must have store
    if (!req.user?.store) {
      return res.status(403).json({
        message: "You do not own a store",
      });
    }

    if (!title || !price || !type) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // 🧠 Generate base slug
    let baseSlug = slugify(title, { lower: true, strict: true });

    // 🔥 Slug uniqueness inside same store only
    let slug = baseSlug;
    let counter = 1;

    while (
      await Product.findOne({
        slug,
        store: req.user.store._id,
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    // 🖼 Handle images
    const images = req.files?.length
      ? req.files.map((f) => `/uploads/images/${f.filename}`)
      : [];

    const product = new Product({
      title,
      slug,
      description,
      price,
      type,
      images,
      stock: type === "physical" ? Number(stock || 0) : null,

      // 🔥 SaaS isolation
      store: req.user.store._id,
    });

    const created = await product.save();

    res.status(201).json(created);

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};




export const createDigitalProduct = async (req, res) => {
  const { title, description, price } = req.body;

  if (!req.file) {
    return res.status(400).json({
      message: "Digital file required",
    });
  }

  const slug = slugify(title, { lower: true });

  const product = new Product({
    title,
    slug,
    description,
    price,
    type: "digital",
    digitalFile: `/uploads/files/${req.file.filename}`,
  });

  const created = await product.save();
  res.status(201).json(created);
};
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "title slug type digitalFile")
    .sort({ createdAt: -1 });

  res.json(orders);
};
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // update fields
    product.title = req.body.title || product.title;
    product.description =
      req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.type = req.body.type || product.type;
    product.stock =
      product.type === "physical"
        ? req.body.stock
        : null;

   // AFTER parsing body
if (req.body.orderedImages) {
  product.images = JSON.parse(req.body.orderedImages);
}

// remove images physically
if (req.body.removedImages) {
  const removed = JSON.parse(req.body.removedImages);

  removed.forEach((imgPath) => {
    const fullPath = path.join(
      process.cwd(),
      imgPath
    );
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  });

  product.images = product.images.filter(
    (img) => !removed.includes(img)
  );
}


    // 🖼 add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(
        (f) => `/uploads/images/${f.filename}`
      );
      product.images.push(...newImages);
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

