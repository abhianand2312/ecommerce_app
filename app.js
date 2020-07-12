const express = require('express');
require("dotenv").config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const braintreeRoutes = require('./routes/braintree');
const orderRoutes = require('./routes/order');
const cors = require('cors');

const app = express();

// Database connection
mongoose.connect(process.env.db_url, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology: true
}).then(function(){
    console.log('DB connection established');
});

// middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

//Middleware routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', braintreeRoutes);
app.use('/api', orderRoutes);

// connecting port
const port = process.env.PORT || 4000;

// matching the port with url
app.listen(port, function(){
    console.log(`Node is running on port ${port}`);
});