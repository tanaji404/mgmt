
var express = require("express");
var router = express.Router();
var query = require("./../queries.js");
var con = require("./../db.js");
var url = require("url");
const session = require("express-session");
const util = require('util');
const queryAsync = util.promisify(con.query).bind(con);
const secret_key = process.env.SECRET_KEY;
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');


const fileUpload = require("express-fileupload");

var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.PASS,
  },
});

// router.use(express.static('public'));
router.use(fileUpload());
router.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // next();
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true"); // If you need to send credentials (cookies, etc.)
  next();
});

router.use(bodyParser.json());
router.use(
  cors({
    origin: ["http://localhost:5173/"],
    methods: ["GET", "POST", "DELETE", "UPDATE"],
    credentials: true,
  })
);

router.use(cookieParser());

router.use(bodyParser.urlencoded({ extended: true }));
var mysql = require("mysql");
// const upload = multer({ dest: 'uploads/' });
// const upload = multer({ storage });

router.use(
  session({
    key: "userId",
    secret: "dishacomputers",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

router.get("/", (req, res) => {
  res.send("admin page open");
});

// CREATE TABLE IF NOT EXISTS adminlogin (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL
//   );
  

router.post("/register", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
  
    if (!name || !email || !password || !confirmPassword) {
      return res.status(422).json({ error: "Please fill all the details" });
    }
  
    try {
      const userExistQuery = "SELECT * FROM adminlogin WHERE email = ?";
      db.query(userExistQuery, [email], async (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const userExist = results[0];
  
        if (userExist) {
          return res.status(422).json({ error: "Email is already in use" });
        } else if (password !== confirmPassword) {
          res.status(422).json({ err: "Message password didn't match" });
        } else {
          const hashedPassword = await bcrypt.hash(password, 12);
  
          const insertUserQuery = "INSERT INTO adminlogin (name, email, password) VALUES (?, ?, ?)";
          db.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
  
            return res.status(201).json({ message: "User Registered Successfully" });
          });
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  router.post("/login", async (req, res) => {
    // console.log(req.body)
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(422).json({ error: "Please fill all the details" });
      }
  
      const userLoginQuery = "SELECT * FROM adminlogin WHERE email = ?";
      con.query(userLoginQuery, [email], async (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const userLogin = results[0];
  
        if (userLogin) {
          const isMatch = await bcrypt.compare(password, userLogin.password);
  
          if (!isMatch) {
            return res.status(422).json({ message: "Invalid Login Credentials" });
          }
  
          const token = await generateAuthToken(userLogin.id); // Assuming a function for token generation
          // console.log(token, "this is generated Token");

          req.session.userid = userLogin.id;
          // console.log(req.session.userid);

  
          res.cookie("jwttoken", token, {
            expires: new Date(Date.now() + 258920000),
            httpOnly: true,
          });
  
          // console.log("Token generation", token);
  
          return res.status(201).json({ message: "Logged In Successfully", userid: userLogin.id  });
        } else {
          return res.status(422).json({ message: "Invalid Login Credentials" });
        }
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Function for token generation (replace it with your actual implementation)
  async function generateAuthToken(userId) {
    const token = jwt.sign({ userId }, "your-secret-key", { expiresIn: "1h" });
    // Store the token in your database or any other desired location
    return token;
  }
  
  router.get("/logout", async (req, res) => {
    // console.log("Cookie and Session are cleared");
    
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      // Clear the JWT token cookie
      res.clearCookie("jwttoken", { path: "/" });
      res.status(200).send("User logged out");
    });
  });


  router.get("/allemployee", async (req, res) => {
    const currentDate = new Date().toISOString().split('T')[0]; 
    let sql = `
      SELECT users.id, users.name, users.email, users.profile_image,
      CASE WHEN COUNT(tasks.id) > 0 THEN 'Running' ELSE 'Not Running' END AS status
      FROM users
      LEFT JOIN tasks ON users.id = tasks.user_id AND tasks.task_status = 'Running'
    `;
  
    if (req.query.nameFilter) {
      sql += ` WHERE users.name LIKE '%${req.query.nameFilter}%'`;
    }

    sql += ` AND DATE(tasks.task_date) = '${currentDate}'`;

    sql += ` GROUP BY users.id`;
  
    try {
      const result = await queryAsync(sql);
      // console.log(result);
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  
 

  router.post('/addTask/:userId', (req, res) => {
    const userId = req.params.userId;
    const { taskDetails, date, expectedHr } = req.body;
    const task_status = "Pending";
    const assignBy = "Admin"
    // Validate the request data as needed
  
    // Create tasks table if not exists and add task
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        task_details VARCHAR(255),
        task_date text,
        expected_hr VARCHAR(50),
        start_time VARCHAR(50),
        stop_time VARCHAR(50),
        total_time VARCHAR(50),
        task_status VARCHAR(50),
        assignBy TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`;
  
    con.query(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating tasks table:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      // Insert task into the database
      const insertTaskQuery = 'INSERT INTO tasks (user_id, task_details, task_date, expected_hr, task_status, assignBy) VALUES (?, ?, ?, ?, ?, ?)';
      con.query(insertTaskQuery, [userId, taskDetails, date, expectedHr, task_status, assignBy], (err, result) => {
        if (err) {
          console.error('Error adding task to the database:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        // console.log('Task added successfully!');
        res.status(200).json({ message: 'Task added successfully!' });
      });
    });
  });
  

  
  router.get("/worksheet_info/:id", async function (req, res) {
    try {
      const itemId = req.params.id;
      const { month, year } = req.query;
  
      let query = `
        SELECT MIN(tasks.id) AS id, tasks.user_id, tasks.task_date, attendance.today_hours, attendance.attendance_id, attendance.reason
        FROM tasks 
        LEFT JOIN attendance ON tasks.user_id = attendance.user_id AND DATE(tasks.task_date) = attendance.attendance_date
        WHERE tasks.user_id = ${itemId}
      `;
  
      // Add filter conditions based on month and year
      if (month) {
        query += ` AND MONTH(tasks.task_date) = ${parseInt(month)}`;
      }
  
      if (year) {
        query += ` AND YEAR(tasks.task_date) = ${parseInt(year)}`;
      }
  
      query += ` GROUP BY tasks.task_date ORDER BY tasks.task_date ASC`;
  
      const result = await new Promise((resolve, reject) => {
        con.query(query, function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
      // console.log(result);
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
  

  router.get("/all_tasks_info/:user_id/:tdate", async function (req, res) {
    try {
      const itemId = req.params.user_id;
      const tdate = req.params.tdate;
  
      const query = `
        SELECT * 
        FROM tasks 
        WHERE tasks.user_id = ? AND tasks.task_date = ?
        ORDER BY task_date ASC
      `;
  
      const result = await new Promise((resolve, reject) => {
        con.query(query, [itemId, tdate], function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
  
      // console.log(result);
      res.send(result);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  });



  router.post("/edit_task", async (req, res) => {
    const editedHours = req.body.editedHours;
    const editedReason = req.body.editedReason;
    const id = req.body.id;
  
    // Fetch user details using user_id from the attendance table
    const getUserDetailsQuery = 'SELECT users.email, users.name ,attendance.attendance_date FROM attendance  JOIN users  ON attendance.user_id = users.id WHERE attendance.attendance_id = ?';
  
    con.query(getUserDetailsQuery, [id], async (err, userResult) => {
      if (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      const userEmail = userResult[0].email;
      const userName = userResult[0].name;
      const attendance_date = userResult[0].attendance_date;

  
      // Update attendance record
      const updateAttendanceQuery = 'UPDATE attendance SET today_hours = ?, reason =  ? WHERE attendance_id = ?';
      con.query(updateAttendanceQuery, [editedHours, editedReason, id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating attendance record:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        const mailOptions = {
          from: `"Rptech Novelty" <${process.env.EMAILUSER}>`,
          to: userEmail,
          subject: 'Day updates',
          html: `<p>Hello ${userName},</p><p>Your task details have been updated. Here are the details:<br>Hours: ${editedHours}<br>Reason: ${editedReason}</p>`,

          html: fs.readFileSync(path.join(__dirname, '../views/updatehours.html'), 'utf-8')
            .replace('{{user}}', userName)
            .replace('{{date}}', attendance_date)
            .replace('{{hours}}', editedHours)
            .replace('{{reason}}', editedReason),

        };
  
        // const mailOptions = {
        //   from: 'your_email@gmail.com',
        //   to: userEmail,
        //   subject: 'Task Update',
        //   html: `<p>Hello ${userName},</p><p>Your task details have been updated. Here are the details:<br>Hours: ${editedHours}<br>Reason: ${editedReason}</p>`,
        // };
  
        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) {
            console.error('Error sending email:', emailErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
  
          console.log('Attendance record updated successfully! Email sent.');
          res.status(200).json({ message: 'Task stop time, total time, and status updated successfully!' });
        });
      });
    });
  });

 

  router.post('/delete_task', async (req, res) => {
    const { id } = req.body;
  
    try {
      const deleteItemQuery = 'DELETE FROM tasks WHERE id = ?';
  
      const results = await new Promise((resolve, reject) => {
        con.query(deleteItemQuery, [id], (err, results) => {
          if (err) {
            console.error('Error deleting item from MySQL:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found or you do not have permission to delete it' });
      }
  
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('An unexpected error occurred:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  
  router.post('/delete_user', async (req, res) => {
    const { id } = req.body;
  
    try {
      const deleteItemQuery = 'DELETE FROM users WHERE id = ?';
  
      const results = await new Promise((resolve, reject) => {
        con.query(deleteItemQuery, [id], (err, results) => {
          if (err) {
            console.error('Error deleting item from MySQL:', err);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found or you do not have permission to delete it' });
      }
  
      res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('An unexpected error occurred:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });





  
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const results = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM adminlogin WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const user = results[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign({ userId: user.id }, secret_key, { expiresIn: '5m' });

    await new Promise((resolve, reject) => {
      con.query('INSERT INTO admin_token (user_id, token) VALUES (?, ?)', [user.id, token], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const resetLink = `${process.env.BASE_URL_ADMIN}/reset-password/${user.id}/${token}`;

    const mailOptions = {
      from: `"Rptech Novelty" <${process.env.EMAILUSER}>`,
      to: email,
      subject: 'Password Reset',
      html: fs.readFileSync(path.join(__dirname, '../views/forgotpass.html'), 'utf-8')
        .replace('{{designation}}', resetLink),
    };

    const info = await transporter.sendMail(mailOptions);

    // console.log('Email sent: ' + info.response);
    res.status(201).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/resetpassword/:user_id/:token', async (req, res) => {
  const { user_id, token } = req.params;
  const { confirmPassword } = req.body;
  // console.log(req.params.user_id);
  // console.log(req.params.token);
  // console.log(req.body);


  try {
    // Fetch token details from the database
    const results = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM admin_token WHERE user_id = ? AND token = ?', [user_id, token], (err, results) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const tokenData = results[0];

    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid or expired token' });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, secret_key);

      // Check if the token has expired
      if (decoded.exp < Date.now() / 1000) {
        return res.status(403).json({ error: 'Token expired' });
      }

      // Hash the new password asynchronously
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(confirmPassword, 12, (err, hashedPassword) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(hashedPassword);
          }
        });
      });

      // Update the user's password in the database
      await new Promise((resolve, reject) => {
        con.query('UPDATE adminlogin SET password = ? WHERE id = ?', [hashedPassword, user_id], (err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      });


      // Clear the used token from the tokens table
      await new Promise((resolve, reject) => {
        con.query('DELETE FROM admin_token WHERE user_id = ?', [user_id], (err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/empinfo/:userid", async function (req, res) {
  try {
    // Step 1: Retrieve userid from request parameters
    const itemId = req.params.userid;

    // Step 2: Build SQL query to fetch user data based on userid
    const sql = `SELECT id, name, email, profile_image FROM adminlogin WHERE adminlogin.id = ${itemId}`;

    // Step 3: Execute the query using a promise
    const queryResult = await new Promise((resolve, reject) => {
      con.query(sql, function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    // Step 4: Send the result back to the client
    res.send(queryResult);
  } catch (error) {
    // Step 5: Handle errors, if any
    console.error('Error in empinfo endpoint:', error);
    res.status(500).send("Internal Server Error");
  }
});



router.post('/edit_profile', async (req, res) => {
  try {
    const { userid, name, email } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      // No file uploaded, update user without changing the profile image
      const sql = 'UPDATE adminlogin SET name=?, email=? WHERE id=?';
      await executeQuery(sql, [name, email, userid]);
    } else {
      // File uploaded, handle the profile image
      const product_image = req.files.profile_image;
      const profile_image = new Date().getTime() + product_image.name;

      // Move the uploaded file to the uploads folder
      await moveFileAsync(product_image, "public/uploads/" + profile_image);

      // Update the user table with the new profile image
      const sql = 'UPDATE adminlogin SET name=?, email=?, profile_image=? WHERE id=?';
      await executeQuery(sql, [name, email, profile_image, userid]);
    }

    console.log('User updated successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
    con.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function moveFileAsync(file, destination) {
  return new Promise((resolve, reject) => {
    file.mv(destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}





module.exports = router;