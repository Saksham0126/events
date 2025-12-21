const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // 1. Check if Super Admin exists
    const existing = await Admin.findOne({ email: 'boss@college.edu' });
    if (existing) {
      console.log('Super Admin already exists');
      process.exit();
    }

    // 2. Create the Boss (no clubId for super_admin)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('masterkey123', salt); // Password: masterkey123

    const superAdmin = new Admin({
      email: 'boss@college.edu',
      password: hashedPassword,
      role: 'super_admin', // <--- IMPORTANT: The distinct role
    });

    await superAdmin.save();
    console.log('✅ SUPER ADMIN CREATED: boss@college.edu / masterkey123');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

