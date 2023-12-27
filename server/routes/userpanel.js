var express = require("express");
require('dotenv').config();
var router = express.Router();
var query = require("./../queries.js");
var con = require("./../db.js");
var url = require("url");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const secret_key = process.env.SECRET_KEY;



var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");

// const upload = multer({ dest: 'uploads/' });
// Middleware for parsing file uploads
router.use(fileUpload());
router.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
router.use(bodyParser.json());
router.use(
  cors({
    origin: ["http://localhost:5174"],
    methods: ["GET", "POST", "DELETE", "UPDATE"],
    credentials: true,
  })
);

router.use(cookieParser());
// router.use('/uploads', express.static('uploads'));
router.use(express.static("public"));
router.use(bodyParser.urlencoded({ extended: true }));
var mysql = require("mysql");
const { error } = require("console");



router.use(
  session({
    key: "userId",
    secret: "redphantom group",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

router.get("/", (req, res) => {
  res.send("user page open and its working");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.PASS,
  },
});












    router.post("/register", async (req, res) => {
      const { name, email, password, confirmPassword } = req.body;
      

          const product_image = req.files.image;
          const image = new Date().getTime() + product_image.name;
          product_image.mv("public/uploads/" + image, function (err) {
            console.log(err);
          });
          req.body.image = image
      
    
      if (!name || !email || !password || !confirmPassword) {
        return res.status(422).json({ error: "Please fill in all the details" });
      }
    
      try {
        // Check if the users table exists, and create it if not
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
          )
        `;

        con.query(createTableQuery, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
    
          // Check if the email already exists in the database
          const userExistQuery = "SELECT * FROM users WHERE email = ?";
          con.query(userExistQuery, [email], async (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (results.length > 0) {
              return res.status(422).json({ error: "Email is already in use" });
            } else if (password !== confirmPassword) {
              return res.status(422).json({ error: "Passwords don't match" });
            } else {
              const hashedPassword = bcrypt.hashSync(password, 12);
              const is_verified = "Not Verified"
    
              const insertUserQuery = "INSERT INTO users (name, email, profile_image, password, is_verified) VALUES (?, ?, ?, ?, ?)";
              con.query(insertUserQuery, [name, email, image, hashedPassword, is_verified], async (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ error: "Internal Server Error" });
                }
    
                const userId = result.insertId;
                const verificationToken = crypto.randomBytes(32).toString("hex");
                await con.query(
                  "INSERT INTO tokens (userId, token) VALUES (?, ?)",
                  [userId, verificationToken]
                );
    
                const url = `${process.env.BASE_URL}/verification/${userId}/verify/${verificationToken}`;
    
    
                const mailOptions = {
                  from: `"Rptech Novelty" <` + process.env.EMAILUSER,
                  to: email,
                  subject: 'Successfully Registered',
                  html: fs.readFileSync(path.join(__dirname, '../views/registration_confirmation.html'), 'utf-8')            
                  .replace('{{designation}}', url)
              
                };
    
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.log(error);
                    return res.status(500).json({ error: "Error sending OTP email" });
                  }
                  // console.log(`Email sent: ${info.response}`);
                });
    
                return res.status(201).json({
                  message: "Registration Successfull, verification email send on your registered email address",
                  email: email,
                });
              });
            }
          });
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });

















router.get("/verification/:id/verify/:token",(req,res)=>{
  const user_id = req.params.id;
  const token = req.params.token;


 let sql=`SELECT * FROM users WHERE id = ?`;
  con.query(sql, [user_id],(err,result)=>{
   if(err){
    console.log(err);
    res.status(400).send({ message: "Invalid link" });
   }else{
    // console.log(user_id)

    const sqls = `SELECT * FROM tokens WHERE userId = ? AND token = ?`;
    con.query(sqls,[user_id, token],(err,result)=>{
      console.log(err);
      // console.log(result);
      if(err){
        console.log(err);
        res.status(400).send({ message: "Invalid link" });
      }else{
        const sqltwo = `DELETE FROM tokens WHERE userId = ?`;
        con.query(sqltwo,[user_id],(err,result)=>{
          console.log(err);
        })

        let verify = "Verified"

        const sqlone = `UPDATE users SET is_verified = ? WHERE id = ?`;
        con.query(sqlone,[verify, user_id],(err,result)=>{
          console.log(err);
        })
        res.status(200).send({ message: "Email verified successfully" });
      }
    })
   }
  })
})






  router.get("/checkEmailExists/:email", async (req, res) => {
    const email = req.params.email;
  
    const userExistQuery = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
    con.query(userExistQuery, [email], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      const count = results[0].count;
      return res.json({ exists: count > 0 });
    });
  });




  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(422).json({ error: "Please fill in all the details" });
      }
  
      const userLoginQuery = "SELECT id, password, is_verified FROM users WHERE email = ?";
      con.query(userLoginQuery, [email], async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
  
        const userLogin = results[0];
  
        if (userLogin) {
          const isMatch = await bcrypt.compare(password, userLogin.password);
  
          if (!isMatch) {
            return res.status(422).json({ message: "Invalid Login Credentials" });
          }
  
          if (userLogin.is_verified === "Verified") {
            // Continue with the login process
            const token = await generateAuthToken(userLogin.id); // Assuming a function for token generation
  
            // Store userid in session storage
            req.session.userid = userLogin.id;
  
            res.cookie("jwttoken", token, {
              expires: new Date(Date.now() + 258920000),
              httpOnly: true,
            });
  
            return res.status(201).json({ message: "Logged In Successfully", userid: userLogin.id });
          } else if (userLogin.is_verified === "Not Verified") {
            // Account not verified, initiate the verification process
            const userId = userLogin.id;
            const verificationToken = crypto.randomBytes(32).toString("hex");
            await con.query(
              "UPDATE tokens SET token = ? WHERE userId = ?",
              [userId, verificationToken]
            );
  
            const url = `${process.env.BASE_URL}/verification/${userId}/verify/${verificationToken}`;
  

            const mailOptions = {
              from: `"Rptech Novelty" <` + process.env.EMAILUSER,
              to: email,
              subject: 'Successfully Registered',
              html: fs.readFileSync(path.join(__dirname, '../views/registration_confirmation.html'), 'utf-8')
            
              .replace('{{designation}}', url)
          
            };
  
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
                return res.status(500).json({ error: "Error sending OTP email" });
              }
              // console.log(`Email sent: ${info.response}`);
              return res.status(422).json({ message: "Account not verified. OTP sent for verification" });
            });
          }
        } else {
          return res.status(422).json({ message: "Invalid Login Credentials" });
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
  



 
  async function generateAuthToken(userId) {
    const token = jwt.sign({ userId }, "your-secret-key", { expiresIn: "5m" });
    // Store the token in your database or any other desired location
    return token;
  }
  


  router.get("/logout", async (req, res) => {
    console.log("Cookie and Session are cleared");
    
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



  router.get("/empinfo/:userid", async function (req, res) {
    try {
      // Step 1: Retrieve userid from request parameters
      const itemId = req.params.userid;
  
      // Step 2: Build SQL query to fetch user data based on userid
      const sql = `SELECT id, name, email, profile_image FROM users WHERE users.id = ${itemId}`;
  
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


  router.get("/taskinfo/:userid", async function (req, res) {
    try {
      // Step 1: Retrieve userid and current_date from request parameters
      const userId = req.params.userid;
      const currentDate = req.query.date; // Assuming the date is provided as a query parameter
    
  
      // const sql = `SELECT * FROM tasks WHERE user_id = ? AND task_date = ?`;
      const sql = 'SELECT * FROM tasks WHERE user_id = ? AND task_date = ? AND task_status = "Pending"';
  
      // Step 3: Execute the query using a promise and parameterized values
      const queryResult = await new Promise((resolve, reject) => {
        con.query(sql, [userId, currentDate], function (err, result) {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(result);
        });
      });
  
      // Step 4: Send the result back to the client
      // console.log(queryResult)
      res.send(queryResult);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error('Error in taskinfo endpoint:', error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.get("/runningtaskinfo/:userid", async function (req, res) {
    try {
      // Step 1: Retrieve userid and current_date from request parameters
      const userId = req.params.userid;
      const currentDate = req.query.date; // Assuming the date is provided as a query parameter
    
  
      // const sql = `SELECT * FROM tasks WHERE user_id = ? AND task_date = ?`;
      const sql = 'SELECT * FROM tasks WHERE user_id = ? AND task_date = ? AND task_status = "Running"';
  
      // Step 3: Execute the query using a promise and parameterized values
      const queryResult = await new Promise((resolve, reject) => {
        con.query(sql, [userId, currentDate], function (err, result) {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }
          resolve(result);
        });
      });
  
      // Step 4: Send the result back to the client
      // console.log(queryResult)
      res.send(queryResult);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error('Error in taskinfo endpoint:', error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  
  router.post('/addTask/:userId', (req, res) => {
    const userId = req.params.userId;
    // const currentDate = req.query.currentDate;
    const currentDate = req.query.date;
    const taskDetails = req.body.task;
    const expectedHr = " - "
    const task_status = "Pending";
    const assignBy = "Employee"
    // Validate the request data as needed

    // console.log(userId);
    // console.log(req.body);
    // console.log(currentDate);

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
      con.query(insertTaskQuery, [userId, taskDetails, currentDate, expectedHr, task_status, assignBy], (err, result) => {
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


  router.post('/startTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const startTime = req.body.startTime;
    const task_status = "Running";
    // console.log(taskId);
    // console.log(startTime);
  
    // Update the start_time field in the database
    const updateStartTimeQuery = 'UPDATE tasks SET start_time = ?, task_status = ? WHERE tasks.id = ?';
    con.query(updateStartTimeQuery, [startTime, task_status , taskId ], (err) => {
      if (err) {
        console.error('Error updating start_time:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      // console.log('Task start time updated successfully!');
      res.status(200).json({ message: 'Task start time updated successfully!' });
    });
  });



  router.post('/stopTask/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const stopTime = req.body.stopTime;
    const userid = req.body.userid;
    const currentDate = req.body.currentDate;
    const task_status = "Complete";
    
    // Retrieve start_time from the database
    const getStartTimeQuery = 'SELECT start_time FROM tasks WHERE id = ?';
    con.query(getStartTimeQuery, [taskId], (err, result) => {
        if (err) {
            console.error('Error retrieving start_time:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const startTime = result[0].start_time;

        // Calculate total_time
        const timeDifference = calculateTimeDifference(startTime, stopTime);

        // Update the stop_time and total_time fields in the database
        const updateTaskQuery = 'UPDATE tasks SET stop_time = ?, total_time = ?, task_status = ? WHERE id = ?';
        con.query(updateTaskQuery, [stopTime, timeDifference, task_status, taskId], (err) => {
            if (err) {
                console.error('Error updating stop_time, total_time, and task_status:', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }

            // console.log('Task stop time, total time, and status updated successfully!');

            // Check if record exists in the attendance table for the current date and user
            const checkAttendanceQuery = 'SELECT * FROM attendance WHERE attendance_date = ? AND user_id = ?';
            con.query(checkAttendanceQuery, [currentDate, userid], (err, result) => {
                if (err) {
                    console.error('Error checking attendance record:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                    return;
                }

                if (result.length === 0) {
                    // Insert new record into attendance table
                    const insertAttendanceQuery = 'INSERT INTO attendance (user_id, attendance_date, today_hours, monthly_hour) VALUES (?, ?, ?, ?)';
                    con.query(insertAttendanceQuery, [userid, currentDate, timeDifference, timeDifference], (err) => {
                        if (err) {
                            console.error('Error inserting attendance record:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                            return;
                        }

                        // console.log('Attendance record inserted successfully!');
                        res.status(200).json({ message: 'Task stop time, total time, and status updated successfully!' });
                    });
                }else {
                  // Update existing record in attendance table
                  const updateAttendanceQuery = 'UPDATE attendance SET today_hours = ADDTIME(today_hours, ?), monthly_hour = ADDTIME(monthly_hour, ?) WHERE attendance_date = ? AND user_id = ?';
                  con.query(updateAttendanceQuery, [timeDifference, timeDifference, currentDate, userid], (err) => {
                    if (err) {
                      console.error('Error updating attendance record:', err);
                      res.status(500).json({ error: 'Internal Server Error' });
                      return;
                    }
                
                    // console.log('Attendance record updated successfully!');
                    res.status(200).json({ message: 'Task stop time, total time, and status updated successfully!' });
                  });
                }
            });
        });
    });
});



// Function to calculate time difference


const calculateTimeDifference = (startTime, stopTime) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const stop = new Date(`2000-01-01 ${stopTime}`);
    const difference = stop - start;

    const hours = Math.floor(difference / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    return `${hours}:${minutes}:${seconds}`;
};





const convertToSeconds = (timeString) => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// Function to format seconds to HH:MM:SS time format
const formatSecondsToHHMMSS = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};




router.get("/taskcomplateinfo/:userid", async function (req, res) {
  try {
    // Step 1: Retrieve userid and current_date from request parameters
    const userId = req.params.userid;
    const dateFilter = req.query.date;
  
    // Step 2: Build SQL query with parameterized query to fetch task information based on userid and current_date
    let sql = `SELECT * FROM tasks WHERE user_id = ? `;

    if (dateFilter) {
      sql += ` AND DATE(task_date) = '${dateFilter}'`;
    }
  
    // Step 3: Execute the query using a promise and parameterized values
    const queryResult = await new Promise((resolve, reject) => {
      con.query(sql, [userId], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    // Step 4: Send the result back to the client
    // console.log(queryResult)
    res.send(queryResult);
  } catch (error) {
    // Step 5: Handle errors, if any
    console.error('Error in taskinfo endpoint:', error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/todayhoursinfo/:userid", async function (req, res) { 
  try {
    // Step 1: Retrieve userid and current_date from request parameters
    const userId = req.params.userid;
    const currentDate = req.query.date; // Assuming the date is provided as a query parameter
  

    // Step 2: Build SQL query with parameterized query to fetch task information based on userid and current_date
    const sql = `SELECT * FROM attendance WHERE user_id = ? AND attendance_date = ?`;

    
    // Step 3: Execute the query using a promise and parameterized values
    const queryResult = await new Promise((resolve, reject) => {
      con.query(sql, [userId, currentDate], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    // Step 4: Send the result back to the client
    // console.log(queryResult)
    res.send(queryResult);
  } catch (error) {
    // Step 5: Handle errors, if any
    console.error('Error in taskinfo endpoint:', error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/todaymonthinfo/:userid", async function (req, res) { 
  try {
    // Step 1: Retrieve userid and current_date from request parameters
    const userId = req.params.userid;
    const currentDate = req.query.date; // Assuming the date is provided as a query parameter

    // Extract the month and year from the currentDate
    const currentMonth = new Date(currentDate).getMonth() + 1; // Adding 1 because getMonth() returns zero-based months
    const currentYear = new Date(currentDate).getFullYear();

    // Step 2: Build SQL query with parameterized query to fetch task information based on userid and current_date
    const sql = `
      SELECT * 
      FROM attendance 
      WHERE user_id = ? 
        AND MONTH(attendance_date) = ? 
        AND YEAR(attendance_date) = ?
    `;

    // Step 3: Execute the query using a promise and parameterized values
    const queryResult = await new Promise((resolve, reject) => {
      con.query(sql, [userId, currentMonth, currentYear], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    // Log the result to the console
    // console.log("Query Result:", queryResult);

    // Send all results in the response
    res.status(200).json(queryResult);
  } catch (error) {
    // Handle errors, if any
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.get("/monthlyhoursinfo/:userid", async function (req, res) { 
  try {
    // Step 1: Retrieve userid and current_date from request parameters
    const userId = req.params.userid;
    const currentDate = req.query.date; // Assuming the date is provided as a query parameter
    
    // Step 1.1: Extract month and year from currentDate
    const [year, month] = currentDate.split('-');
  
    // Step 2: Build SQL query with parameterized query to fetch task information based on userid, month, and year
    const sql = `
      SELECT SUM(today_hours) AS monthly_hours
      FROM attendance
      WHERE user_id = ? AND MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?
    `;

    // Step 3: Execute the query using a promise and parameterized values
    const queryResult = await new Promise((resolve, reject) => {
      con.query(sql, [userId, month, year], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result[0] ? result[0].monthly_hours : 0);
      });
    });

    // Step 4: Send the result back to the client as JSON
    res.json( queryResult );
  } catch (error) {
    // Step 5: Handle errors, if any
    console.error('Error in todayhoursinfo endpoint:', error);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/checktaskinfo/:userid", async function (req, res) {
  try {
    // Step 1: Retrieve userid and current_date from request parameters
    const userId = req.params.userid;
    const currentDate = req.query.date; // Assuming the date is provided as a query parameter

    // Check for tasks with status 'Running'
    const checkRunningTaskQuery = `
      SELECT COUNT(*) AS runningTaskCount
      FROM tasks
      WHERE user_id = ? 
        AND task_date = ?
        AND task_status = 'Running'
    `;

    // Check for tasks with status 'Pending'
    const checkPendingTaskQuery = `
      SELECT COUNT(*) AS pendingTaskCount
      FROM tasks
      WHERE user_id = ? 
        AND task_date = ?
        AND task_status = 'Pending'
    `;

    // Execute the queries using promises and parameterized values
    const runningTaskResult = await new Promise((resolve, reject) => {
      con.query(checkRunningTaskQuery, [userId, currentDate], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    const pendingTaskResult = await new Promise((resolve, reject) => {
      con.query(checkPendingTaskQuery, [userId, currentDate], function (err, result) {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });

    // Check if there are any tasks with status 'Running'
    const runningTaskCount = runningTaskResult[0].runningTaskCount;
    // Check if there are any tasks with status 'Pending'
    const pendingTaskCount = pendingTaskResult[0].pendingTaskCount;

    // Prepare the response based on the counts
    const response = {
      task: runningTaskCount > 0 ? "Running" : "Not Running",
      newstatus: pendingTaskCount > 0 ? "Pending" : "Not Pending",
    };

    // console.log(response);
    res.status(200).json(response);
  } catch (error) {
    // Handle errors, if any
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const results = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
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
      con.query('INSERT INTO forgotpass_tokens (user_id, token) VALUES (?, ?)', [user.id, token], (err) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const resetLink = `${process.env.BASE_URL}/reset-password/${user.id}/${token}`;

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


router.post('/resetpass/:user_id/:token', async (req, res) => {
  const { user_id, token } = req.params;
  const { confirmPassword } = req.body;
  // console.log(req.body);

  try {
    // Fetch token details from the database
    const results = await new Promise((resolve, reject) => {
      con.query('SELECT * FROM forgotpass_tokens WHERE user_id = ? AND token = ?', [user_id, token], (err, results) => {
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
        con.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user_id], (err) => {
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
        con.query('DELETE FROM forgotpass_tokens WHERE user_id = ?', [user_id], (err) => {
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



router.post('/edit_profile', async (req, res) => {
  try {
    const { userid, name, email } = req.body;

    if (!req.files || Object.keys(req.files).length === 0) {
      // No file uploaded, update user without changing the profile image
      const sql = 'UPDATE users SET name=?, email=? WHERE id=?';
      await executeQuery(sql, [name, email, userid]);
    } else {
      // File uploaded, handle the profile image
      const product_image = req.files.profile_image;
      const profile_image = new Date().getTime() + product_image.name;

      // Move the uploaded file to the uploads folder
      await moveFileAsync(product_image, "public/uploads/" + profile_image);

      // Update the user table with the new profile image
      const sql = 'UPDATE users SET name=?, email=?, profile_image=? WHERE id=?';
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