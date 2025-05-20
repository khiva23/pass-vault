const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.get('/register', (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);
  const user = new User({ email: req.body.email, password: hashed });
  await user.save();
  res.redirect('/login');
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/passwords');
  } else {
    res.send('Login failed');
  }
});


module.exports = router;
