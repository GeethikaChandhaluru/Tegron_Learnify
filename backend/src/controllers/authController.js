const User = require("../models/User");
const bcrypt = require("bcryptjs");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

// LOGIN
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // 🔥 JWT Token generate
    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,   // 👈 important
      user
    });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

module.exports = { register, login };