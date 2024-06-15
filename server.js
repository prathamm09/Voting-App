const express = require('express');
const app = express();
const db = require('./db');
require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


//import user files for user
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//use the files
app.use("/user" , userRoutes);
app.use("/candidate" , candidateRoutes);

 
app.listen(PORT , ()=>{
    console.log('Listening on port 3000');
})