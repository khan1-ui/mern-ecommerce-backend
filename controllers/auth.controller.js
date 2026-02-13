import User from "../models/User.js";
import Store from "../models/Store.js";
import generateToken from "../utils/generateToken.js";
import slugify from "slugify";
import mongoose from "mongoose";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { name, email, password, role, storeName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    email = email.toLowerCase().trim();

    if (role === "superadmin") {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // ================= CUSTOMER =================
    if (role === "customer") {
      const user = await User.create(
        [{ name, email, password, role: "customer" }],
        { session }
      );

      await session.commitTransaction();

      return res.status(201).json({
        _id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
        token: generateToken(user[0]._id),
      });
    }

    // ================= STORE OWNER =================
    if (role === "storeOwner") {
      if (!storeName) {
        return res.status(400).json({
          message: "Store name is required",
        });
      }

      const user = await User.create(
        [{ name, email, password, role: "storeOwner" }],
        { session }
      );

      let baseSlug = slugify(storeName, {
        lower: true,
        strict: true,
      });

      let slug = baseSlug;
      let counter = 1;

      while (await Store.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const store = await Store.create(
        [
          {
            name: storeName,
            slug,
            owner: user[0]._id,
          },
        ],
        { session }
      );

      user[0].store = store[0]._id;
      await user[0].save({ session });

      await session.commitTransaction();

      return res.status(201).json({
        _id: user[0]._id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
        store: store[0].slug,
        token: generateToken(user[0]._id),
      });
    }

    await session.abortTransaction();

    return res.status(400).json({
      message: "Invalid role",
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  } finally {
    session.endSession();
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email })
      .populate("store");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        message: "Account suspended",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      store: user.store?.slug || null,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Login failed",
    });
  }
};

// ================= GET PROFILE =================
export const getMe = async (req, res) => {
  res.json(req.user);
};
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  user.name = req.body.name || user.name;

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    store: user.store?.slug || null,
    token: generateToken(user._id),
  });
};
