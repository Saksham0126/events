const jwt = require('jsonwebtoken');

// 1. Standard Auth (Used for everyone)
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// 2. Super Admin Check (Used for sensitive actions)
const checkSuperAdmin = (req, res, next) => {
  // First run standard auth to get user info
  auth(req, res, () => {
    if (req.user.role === 'super_admin') {
      next(); // Pass!
    } else {
      res.status(403).json({ msg: 'Access Denied: Super Admins only' });
    }
  });
};

module.exports = { auth, checkSuperAdmin };

