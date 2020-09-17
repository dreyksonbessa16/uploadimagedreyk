require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use(require('./routes/images'));
app.use(require('./routes/users'));

app.listen(process.env.PORT || 3000);