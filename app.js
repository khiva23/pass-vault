require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const passwordRoutes = require('./routes/passwords');
const Password = require('./models/Password');

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
  }));

app.use('/', authRoutes);
app.use('/passwords', passwordRoutes);
app.get('/', (req, res) => {
    res.redirect('/login');
  });

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.log('Error destroying session:',err);
        return res.redirect('/passwords');
      }
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
  
app.get('/passwords/edit/:id', async (req, res) => {
    const password = await Password.findById(req.params.id);
    res.render('edit', { password });
  });

  app.post('/passwords/update/:id', async (req, res) => {
    const { website, username, password } = req.body;
    await Password.findByIdAndUpdate(req.params.id, {
      website,
      username,
      password
    });
    res.redirect('/passwords');
  });

// router.get('/', async (req, res) => {
//     const passwords = await Password.find({ userId: req.session.userId });
//     res.render('dashboard', { 
//       passwords: passwords.map(p => ({
//         ...p._doc,
//         password: p.password ? decrypt(p.password) : '*****'
//       })) 
//     });
//   });


app.post('/passwords/delete/:id', async (req, res) => {
    await Password.findByIdAndDelete(req.params.id);
    res.redirect('/passwords');
  });
  
  
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
