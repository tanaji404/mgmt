const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config();


const app = express();
const port = process.env.PORT; 



var con = require("./db");
app.use(bodyParser.json());






// Middleware
// app.use(cors());
app.use('/uploads', express.static('uploads'));


var adminpanel=require("./routes/adminpanel");
app.use("/admin",adminpanel)

var userpanel=require("./routes/userpanel");
app.use("/",userpanel)



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
