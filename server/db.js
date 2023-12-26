const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "rpea_rpi",
  password: "Tanaji@244",
  database: "rpea_mgmt",
});

con.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

module.exports = con;
