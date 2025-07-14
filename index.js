const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const session = require('express-session');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // ✅ You need this for JSON POST body
app.use(session({
  secret: 'supersecretkey', // change this to something stronger later
  resave: false,
  saveUninitialized: false
}));


app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/products', (req, res) => {
  res.sendFile(__dirname + '/public/products.html');
});

app.get('/cart', (req, res) => {
  res.sendFile(__dirname + '/public/cart.html');
});

app.get('/checkout.html', (req, res) => {
  res.sendFile(__dirname + '/public/checkout.html');
});

// GET Admin Login Page
app.get('/admin-login', (req, res) => {
  res.sendFile(__dirname + '/public/admin/login.html');
});

// POST Admin Login Logic
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple hardcoded admin check (you can change credentials)
  if (username === 'admin' && password === '1234') {
    req.session.admin = true;
    res.redirect('/admin/dashboard');
  } else {
    res.send('❌ Invalid credentials. <a href="/admin-login">Try again</a>');
  }
});


// Middleware to check admin session
function isAdmin(req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.redirect('/admin-login');
  }
}

// GET Admin Dashboard (protected)
app.get('/admin/dashboard', isAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/admin/dashboard.html');
});

// Logout Route
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin-login');
});


const fs = require('fs');
const path = require('path');

// POST Add New Product
app.post('/admin/products', isAdmin, (req, res) => {
  const { name, price } = req.body;
  const product = { name, price: parseFloat(price) };

  const filePath = path.join(__dirname, 'products.json');
  const data = fs.readFileSync(filePath);
  const products = JSON.parse(data);

  products.push(product);

  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

  res.redirect('/admin/products');
});

// GET Manage Products Page
app.get('/admin/products', isAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/admin/products.html');
});

// GET Products List for Display in HTML
app.get('/admin/products/list', isAdmin, (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, 'products.json'));
  const products = JSON.parse(data);
  res.json(products);
});


// POST Delete Product by Index
app.post('/admin/products/delete', isAdmin, (req, res) => {
  const { index } = req.body;
  const filePath = path.join(__dirname, 'products.json');
  const data = fs.readFileSync(filePath);
  const products = JSON.parse(data);

  if (products[index]) {
    products.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  }

  res.sendStatus(200);
});

// POST Edit Product by Index
app.post('/admin/products/edit', isAdmin, (req, res) => {
  const { index, name, price } = req.body;
  const filePath = path.join(__dirname, 'products.json');
  const data = fs.readFileSync(filePath);
  const products = JSON.parse(data);

  if (products[index]) {
    products[index].name = name;
    products[index].price = parseFloat(price);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  }

  res.sendStatus(200);
});
