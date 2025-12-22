const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); 

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const adminEmail = "boss@college.edu";
    const adminPass = "masterkey123";

    // 1. Reset Admin
    await User.findOneAndDelete({ email: adminEmail });
    console.log('🗑️  Old Super Admin deleted.');

    // 2. Create Fresh Boss
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPass, salt);

    const user = new User({
      name: "Super Boss",
      email: adminEmail,
      password: hashedPassword,
      role: "super_admin",
      mustChangePassword: false // 👈 BOSS DOES NOT NEED TO CHANGE PASS
    });

    await user.save();
    console.log('🚀 SUPER ADMIN CREATED FRESH!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPass}`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedSuperAdmin();