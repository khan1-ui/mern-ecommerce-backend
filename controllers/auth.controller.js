import User from "../models/User.js";
import Store from "../models/Store.js";
import generateToken from "../utils/generateToken.js";

// ------------------ SLUG GENERATOR ------------------
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-");

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({
        message: "All fields including store name are required",
      });
    }

    // 1️⃣ Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const slug = generateSlug(storeName);

    // 2️⃣ Check store slug uniqueness
    const storeExists = await Store.findOne({ slug });
    if (storeExists) {
      return res.status(400).json({
        message: "Store name already taken",
      });
    }

    // 3️⃣ Create user
    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    // 4️⃣ Create store
    const store = await Store.create({
  name: storeName,
  slug,
  owner: user._id,
  logo: "https://via.placeholder.com/150x150?text=Logo",
  banner: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
});

    // 5️⃣ Attach store to user
    user.store = store._id;
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: store.slug,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).populate("store");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store?.slug, // 🔥 important for SaaS
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= GET PROFILE =================
export const getMe = async (req, res) => {
  res.json(req.user);
};

