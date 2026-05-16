const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('✅ Admin already exists');
      process.exit(0);
    }

    const admin = new User({
      username: process.env.ADMIN_USERNAME || 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });

    await admin.save();
    console.log(`✅ Admin created: ${admin.email}`);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
