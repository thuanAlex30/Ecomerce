require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require('passport');

// Import controllers & routes
const htmlcontroller = require('./apicontrollers/htmlcontroller');
const routesUser = require('./routes/users');
const routesAdmin = require('./routes/admin');
const routesProduct = require('./routes/product');

// Khởi tạo app
var app = express();
var port = process.env.PORT || 3000;

// Kết nối MongoDB
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// Cấu hình session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Middleware global cho biến cục bộ
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.Manager = req.session.isManager;
  res.locals.currentUser = req.session.user;
  res.locals.session = req.session;
  next();
});

// Routes
htmlcontroller(app);
app.use(routesUser);
app.use(routesAdmin);
app.use(routesProduct);

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
  const err = new Error('Not found!');
  err.status = 404;
  next(err);
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
