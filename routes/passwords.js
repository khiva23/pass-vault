const express = require('express');
const Password = require('../models/Password');
const crypto = require('crypto');
const router = express.Router();

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.SESSION_SECRET || 'default-secret', 'salt', 32);
const iv = Buffer.alloc(16, 0);

// Encrypt function (works)
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt function (with better error handling)
function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return '*****';
    }
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return '*****';
  }
}

// Dashboard route (single version - removed duplicate)
// router.get('/', async (req, res) => {
//   try {
//     const passwords = await Password.find({ userId: req.session.userId });
//     res.render('dashboard', { 
//       passwords: passwords.map(p => ({
//         ...p._doc,
//         password: decrypt(p.password)
//       })) 
//     });
//   } catch (err) {
//     console.error(err);
//     res.redirect('/login');
//   }
// });



router.get('/', async (req, res) => {
    try {
      const passwords = await Password.find({ userId: req.session.userId });
      
      // Decrypt passwords before passing to view
      const passwordsWithDecrypted = passwords.map(p => ({
        _id: p._id,
        website: p.website,
        username: p.username,
        password: p.password, // Still keep encrypted version
        decryptedPassword: decrypt(p.password) // Add decrypted version
      }));
  
      res.render('dashboard', { 
        passwords: passwordsWithDecrypted 
      });
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  });



// Add new password
router.post('/add', async (req, res) => {
  try {
    const encrypted = encrypt(req.body.password);
    const entry = new Password({
      userId: req.session.userId,
      website: req.body.website,
      username: req.body.username,
      password: encrypted
    });
    await entry.save();
    res.redirect('/passwords');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving password");
  }
});

// Update password (NEW - was missing)
router.post('/update/:id', async (req, res) => {
  try {
    const { website, username, password } = req.body;
    const encrypted = encrypt(password); // Encrypt before saving
    await Password.findByIdAndUpdate(req.params.id, {
      website,
      username,
      password: encrypted
    });
    res.redirect('/passwords');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating password");
  }
});

// Delete password (NEW - was missing)
router.post('/delete/:id', async (req, res) => {
  try {
    await Password.findByIdAndDelete(req.params.id);
    res.redirect('/passwords');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting password");
  }
});


module.exports = router;