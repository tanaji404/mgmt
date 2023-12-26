// Task.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/task.css";
import Loader from "./Loader";
import headerimg from "../assets/rptn1.png";
import { Icon } from "@iconify/react";

const Task = () => {
  const [inputVal, setInputVal] = useState("");
  const [tasks, setTasks] = useState([]);
  const [totalTime, setTotalTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isTaskInProgress, setIsTaskInProgress] = useState(false); // New state
  const [tokens, setTokens] = useState([]);

  const addTaskToBackend = async (task) => {
    try {
      setLoading(true);
      const userid = sessionStorage.getItem("userid");
      const currentDate = new Date().toISOString().split("T")[0];

      const res = await fetch(
        `http://localhost:3005/addTask/${userid}?date=${currentDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ task }),
        }
      );

      if (!res.ok) {
        throw new Error(res.error);
      }

      toast.success("Task added successfully!");
      // setTimeout(() => {
      //   window.location.reload();
      // }, 4000);

      // Set the task in progress state to true
      setIsTaskInProgress(true);

      // Refresh tasks from the backend if needed
      TaskPage();
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };

  // Adding starttime to backend

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isTaskInProgress) {
      toast.error("Please stop the current task before adding a new one.");
      return;
    }

    if (!inputVal) {
      toast.error("Task cannot be empty");
      return;
    }

    addTaskToBackend(inputVal);

    setInputVal("");
  };

  const addStartTimeToBackend = async (taskId) => {
    try {
      const res = await fetch(`/api/addStartTime/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(res.error);
      }

      // Refresh tasks from the backend if needed
      TaskPage();
    } catch (error) {
      console.error("Error adding start time:", error);
    }
  };

  const handleStartTime = async (index, taskId) => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString();

    setTasks((oldTasks) =>
      oldTasks.map((task, i) =>
        i === index ? { ...task, startTime: formattedTime } : task
      )
    );

    // Add start time to the backend
    await addStartTimeToBackend(taskId);
  };

  //   if (startTime && stopTime) {
  //     const start = new Date(`2000-01-01 ${startTime}`);
  //     const stop = new Date(`2000-01-01 ${stopTime}`);
  //     const difference = stop - start;

  //     const hours = Math.floor(difference / 3600000);
  //     const minutes = Math.floor((difference % 3600000) / 60000);
  //     const seconds = Math.floor((difference % 60000) / 1000);

  //     return `${hours}h ${minutes}m ${seconds}s`;
  //   }

  //   return "";
  // };

  // const calculateTotalTime = (tasksArray, totalHoursArray) => {
  //   let totalMilliseconds = 0;

  //   tasksArray.forEach((task) => {
  //     if (task.difference) {
  //       const [hours, minutes, seconds] = task.difference
  //         .split(" ")
  //         .map((value) => parseInt(value));

  //       totalMilliseconds += hours * 3600000 + minutes * 60000 + seconds * 1000;
  //     }
  //   });

  //   const totalDate = new Date(totalMilliseconds);
  //   const totalHours = totalDate.getUTCHours();
  //   const totalMinutes = totalDate.getUTCMinutes();
  //   const totalSeconds = totalDate.getUTCSeconds();

  //   // Check if today's date matches any entry in totalHoursArray
  // };

  const [employeeNames, setEmployeeNames] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Make the API call to the backend with the retrieved userid
      const result = await axios.get(`http://localhost:3005/empinfo/${userid}`);

      // Step 3: Set the employeeNames state with the retrieved value
      setEmployeeNames(result.data);
      // console.log(result.data);
    } catch (error) {
      // Step 4: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const [task, setTask] = useState([]);

  useEffect(() => {
    loadtask();
  });

  const loadtask = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Get the current date in "YYYY-MM-DD" format
      const currentDate = new Date().toISOString().split("T")[0];

      // Step 3: Make the API call to the backend with the retrieved userid and current date as query parameters
      const result = await axios.get(
        `http://localhost:3005/taskinfo/${userid}?date=${currentDate}`
      );

      // Step 4: Set the Task state with the retrieved value
      setTask(result.data);
      // console.log(result.data);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const [runningtask, setRunningtask] = useState([]);

  useEffect(() => {
    loadrunningtask();
  }, []);

  const loadrunningtask = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Get the current date in "YYYY-MM-DD" format
      const currentDate = new Date().toISOString().split("T")[0];

      // Step 3: Make the API call to the backend with the retrieved userid and current date as query parameters
      const result = await axios.get(
        `http://localhost:3005/runningtaskinfo/${userid}?date=${currentDate}`
      );

      // Step 4: Set the runningtask state with the retrieved value
      setRunningtask(result.data);
      // console.log(result.data);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", { hour12: false });
      // Assuming you have the appropriate endpoint for starting tasks
      const response = await axios.post(
        `http://localhost:3005/startTask/${taskId}`,
        {
          startTime: currentTime,
        }
      );

      // Handle the response as needed
      // console.log(response.data); // Log the response from the backend
      toast.success("Task Start successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
      // Refresh tasks from the backend if needed
      TaskPage();
    } catch (error) {
      console.error("Error starting task:", error);
    }
  };

  const handleStopTask = async (taskId) => {
    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", { hour12: false });
      const currentDate = new Date().toISOString().split("T")[0];
      const userid = sessionStorage.getItem("userid");

      // Assuming you have the appropriate endpoint for starting tasks
      const response = await axios.post(
        `http://localhost:3005/stopTask/${taskId}`,
        {
          stopTime: currentTime,
          currentDate: currentDate,
          userid: userid,
        }
      );

      // Handle the response as needed
      // console.log(response.data); // Log the response from the backend
      window.location.reload();
      // Refresh tasks from the backend if needed
      TaskPage();
    } catch (error) {
      console.error("Error starting task:", error);
    }
  };

  const [taskcomplate, setTaskcomplate] = useState([]);
  const [dateFilter, setDateFilter] = useState([]);

  useEffect(() => {
    loadtaskcomplate();
  }, [dateFilter]);

  const loadtaskcomplate = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Get the current date in "YYYY-MM-DD" format

      // Step 3: Make the API call to the backend with the retrieved userid and current date as query parameters
      const result = await axios.get(
        `http://localhost:3005/taskcomplateinfo/${userid}?date=${dateFilter}`
      );

      // Step 4: Set the taskcomplate state with the retrieved value
      setTaskcomplate(result.data);
      // console.log(result.data);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const [todayhours, setTodayhours] = useState([]);

  useEffect(() => {
    loadtodayhours();
  }, []);

  const loadtodayhours = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Get the current date in "YYYY-MM-DD" format
      const currentDate = new Date().toISOString().split("T")[0];

      // Step 3: Make the API call to the backend with the retrieved userid and current date as query parameters
      const result = await axios.get(
        `http://localhost:3005/todayhoursinfo/${userid}?date=${currentDate}`
      );

      // Step 4: Set the todayhours state with the retrieved value
      setTodayhours(result.data);
      // console.log(result.data)
      // console.log(result.data);
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const calculateTotalHours = (todaymonth) => {
    const totalSeconds = todaymonth.reduce((sum, value) => {
      return (
        sum + (value.today_hours ? convertToSeconds(value.today_hours) : 0)
      );
    }, 0);

    return formatSecondsToHHMMSS(totalSeconds);
  };

  const convertToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatSecondsToHHMMSS = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const [todaymonth, setTodaymonth] = useState([]);

  useEffect(() => {
    loadtodaymonth();
  }, []);

  const loadtodaymonth = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }

      // Step 2: Get the current date in "YYYY-MM-DD" format
      const currentDate = new Date().toISOString().split("T")[0];

      // Step 3: Make the API call to the backend with the retrieved userid and current date as query parameters
      const result = await axios.get(
        `http://localhost:3005/todaymonthinfo/${userid}?date=${currentDate}`
      );

      // Step 4: Set the todaymonth state with the retrieved value
      setTodaymonth(result.data);
      
    } catch (error) {
      // Step 5: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const [checktask, setchecktask] = useState([]);

  useEffect(() => {
    loadUserts();
  });

  const loadUserts = async () => {
    try {
      // Step 1: Retrieve userid from sessionStorage
      const userid = sessionStorage.getItem("userid");

      if (!userid) {
        // Handle the case when the userid is not found in sessionStorage
        console.error("Userid not found in sessionStorage.");
        return;
      }
      const currentDate = new Date().toISOString().split("T")[0];

      // Step 2: Make the API call to the backend with the retrieved userid
      const result = await axios.get(
        `http://localhost:3005/checktaskinfo/${userid}?date=${currentDate}`
      );

      // Step 3: Set the checktask state with the retrieved value
      setchecktask(result.data);
      // console.log(result.data);
    } catch (error) {
      // Step 4: Handle errors, if any
      console.error("Error fetching user data:", error);
    }
  };

  const [editPopup, setEditPopup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userid, setUserid] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);

  const handleEditClick = (id, name, email, profile_image) => {
    setUserid(id);
    setEmail(email);
    setName(name);
    setProfileImageFile(profile_image);
    setEditPopup(true);
  };

  const handleFile1Change = (event) => {
    const file = event.target.files[0];
    setProfileImageFile(file);
  };

  // const handleSaveEdit = () => {
  //   // Validate editedHours format

  //   // Send data to the backend through Axios POST request
  //   // Include the editedTaskId, editedHours, and editedReason
  //   axios
  //     .post("http://localhost:3005/edit_profile", {
  //       userid: userid,
  //       name: name,
  //       email: email,
  //       profile_image: profile_image,
  //     })
  //     .then((response) => {
  //       // Handle success
  //       // console.log("Edit successful", response.data);
  //       // Additional logic if needed
  //       window.location.reload();
  //     })
  //     .catch((error) => {
  //       // Handle error
  //       console.error("Edit failed", error);
  //       // Additional error handling if needed
  //     });

  //   // Close the edit popup after submitting the form
  //   setEditPopup(false);
  // };

  const handleSaveEdit = () => {
    // Create a FormData object to handle file uploads
    const formData = new FormData();

    // Append other data to the form data
    formData.append("userid", userid);
    formData.append("name", name);
    formData.append("email", email);

    // Check if a new profile image was selected
    if (profileImageFile) {
      formData.append("profile_image", profileImageFile);
    }

    // Send data to the backend through Axios POST request
    axios
      .post("http://localhost:3005/edit_profile", formData)
      .then((response) => {
        // Handle success
        window.location.reload();
      })
      .catch((error) => {
        // Handle error
        console.error("Edit failed", error);
      });

    // Close the edit popup after submitting the form
    setEditPopup(false);
  };

  const handleCancelEdit = () => {
    // Close the edit popup without saving changes
    setEditPopup(false);
  };

  return (
    <>
      <ToastContainer />

      <div className="task-main-div">
        <div className="main-nav">
          <div className="innerNavDiv">
            <div className="logo-div">
              <img src={headerimg} alt="logos" className="logoImg" />
            </div>
            <div className="user-logout-btn">
              {employeeNames.map((value, index) => (
                <>
                  <div style={{position:'relative'}}>
                    <img
                      alt=""
                      src={`http://localhost:3005/uploads/${value.profile_image}`}
                      className=""
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        marginRight:'15px'
                      }}
                    />
                    <Icon
                      icon="material-symbols:edit-outline"
                      onClick={() =>
                        handleEditClick(
                          value.id,
                          value.name,
                          value.email,
                          value.profile_image
                        )
                      }
                      style={{ cursor: "pointer" }}
                      className="editIcon myedit editNavIcon"
                    />
                  </div>
                  <div style={{}}>
                    <p className="text-white usersName">
                     {value.name} 
                    </p>
                    <p className="text-white usersName">
                      {value.email}
                    </p>
                  </div>
                </>
              ))}

              <div className="log-btn">
                <NavLink to="/logout">
                  <button
                    className="button logoutBtn"
                    style={{ marginTop: 0, width: "104px" }}
                  >
                    Logout
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
        <div className="main-form-div">
          <div className="form-ol-div">
            <form onSubmit={handleSubmit} className="form-div">
              {todayhours.length === 0 ? (
                <>
                  <div className="totl-tm-div">
                    <h4 className="totl-label">Todays Total Hr:</h4>
                    <input
                      type="text"
                      value="00:00:00"
                      readOnly
                      name="TotalHours"
                      className="totl-tim-inp total-timewalaInp"
                    />
                  </div>
                </>
              ) : (
                <>
                  {todayhours.map((value, index) => (
                    <>
                      <div className="totl-tm-div">
                        <h4 className="totl-label">Todays Total Hr:</h4>
                        <input
                          type="text"
                          value={value.today_hours}
                          readOnly
                          name="TotalHours"
                          className="totl-tim-inp total-timewalaInp"
                        />
                      </div>
                    </>
                  ))}
                </>
              )}

              <div className="totl-tm-div-2">
                <h4 className="totl-label2">This Month Hrs</h4>
                <input
                  type="text"
                  value={calculateTotalHours(todaymonth)}
                  readOnly
                  name="TotalHours"
                  className="totl-tim-inp total-timewalaInp2"
                />
              </div>
              <div
                className="form__group field taskInp_main"
                style={{ padding: "0" }}
              >
                <textarea
                  type="text"
                  placeholder="Enter Your Task Here..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  name="Task"
                  className="form__field search-taskInp textAreaTasks"
                  maxLength="166"
                ></textarea>
                <label htmlFor="task" className="form__label">
                  Enter Your Task Here...
                </label>

                <button
                  type="submit"
                  className="button add-btn"
                  disabled={loading}
                  onClick={(e) => {
                    if (checktask.newstatus === "Pending") {
                      e.preventDefault(); // Prevent form submission
                      toast.error("Complete the pending task first");
                    }
                    // Continue with the existing functionality for adding a task
                  }}
                >
                  {loading ? (
                    <>
                      Adding Task...
                      <Loader />
                    </>
                  ) : (
                    "Add Task"
                  )}
                </button>
              </div>
            </form>

            <table className="responsive" style={{ marginTop: "1%" }}>
              <thead>
                <tr>
                  <th scope="col" style={{ borderTopLeftRadius: "15px" }}>
                    Sr.No
                  </th>
                  <th scope="col">Assigned Task</th>
                  <th scope="col">Expected Hr </th>
                  <th scope="col" style={{ borderTopRightRadius: "15px" }}>
                    Start Tasks
                  </th>
                </tr>
              </thead>

              <tbody>
                {task.length === 0 ? (
                  <>
                    <tr className="">
                      <td colspan={4} style={{ color: "red" }}>
                        No Record Found
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    {task
                      .filter((value) => value.task_status === "Pending")
                      .map((value, index) => (
                        <React.Fragment key={index}>
                          <tr>
                            <td data-table-header="Sr.No">{index + 1}</td>
                            <td data-table-header="Name">
                              {value.task_details}
                            </td>
                            <td data-table-header="Email">
                              {value.expected_hr}
                            </td>

                            <td>
                              {checktask.task !== undefined ? (
                                <button
                                  className="button-view1"
                                  onClick={() => {
                                    if (checktask.task === "Running") {
                                      toast.error(
                                        "Complete the running task first"
                                      );
                                    } else {
                                      handleStartTask(value.id);
                                    }
                                  }}
                                >
                                  Start Tasks
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                  </>
                )}
              </tbody>
            </table>

            <ol className="listMapped_ordered">
              {taskcomplate.length === 0 ? (
                <>
                  <li className="listMapped myrecord ">
                    <h3 className="">No record found</h3>
                  </li>
                </>
              ) : (
                <>
                  {taskcomplate
                    .filter((value) => value.task_status === "Complete")
                    .map((value, index) => (
                      <React.Fragment key={index}>
                        <li key={index} className="listMapped">
                          <div className="task-container1">
                            <div className="flex-container1">
                              <div className="left-content1">
                                <span> Task Name : {value.task_details} </span>
                              </div>
                              <div className="right-content1">
                                <span>Task Date : {value.task_date} </span>
                              </div>
                            </div>
                          </div>
                          <div className="btn-div-Wrapper">
                            <div className="btn-div">
                              <input
                                type="text"
                                value={value.start_time || "Not started"}
                                readOnly
                                name="startTime"
                                className="totl-tim-inp"
                              />
                              Start Time
                            </div>

                            <div className="btn-div">
                              <div className="text-center">
                                <input
                                  type="text"
                                  value={value.stop_time || "Not Stop"}
                                  readOnly
                                  name="endTime"
                                  className="totl-tim-inp"
                                />

                                <p className="totl-ti">Stop Time</p>
                              </div>
                            </div>

                            <div className="btn-div" style={{ border: "none" }}>
                              <input
                                type="text"
                                value={value.total_time || "Waiting..."}
                                readOnly
                                className="totl-tim-inp"
                              />
                              <p className="">Time Difference:</p>
                            </div>
                          </div>
                        </li>
                      </React.Fragment>
                    ))}
                </>
              )}

              <div className="task-container">
                <div className="flex-container">
                  <div className="left-content">
                    <h1>Recent Tasks</h1>
                  </div>
                  <div className="right-content">
                    <input
                      id="dateFilter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      placeholder="Select Date"
                      className="admin_attand"
                    />
                  </div>
                </div>
              </div>

              {runningtask.length === 0 ? (
                <>
                 
                </>
              ) : (
                <>
                  {runningtask
                    .filter((value) => value.task_status === "Running")
                    .map((value, index) => (
                      <React.Fragment key={index}>
                        <li key={index} className="listMapped ">
                          <div className="task-container1">
                            <div className="flex-container1">
                              <div className="left-content1">
                                <span> Task Name : {value.task_details} </span>
                              </div>
                              <div className="right-content1">
                                <span style={{ marginRight: "50px" }}>
                                  Task Date : {value.task_date}{" "}
                                </span>
                                <span
                                  className=""
                                  style={{ marginLeft: "", color: "blue" }}
                                ></span>
                              </div>
                              <div className="right-content1">
                                <span>
                                  <div className="running-dots-container">
                                    <div className="dot dot2"></div>
                                    <div className="dot dot1"></div>
                                    <div className="dot dot3"></div>
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="btn-div-Wrapper">
                            <div className="btn-div">
                              <button
                                onClick={() => handleStartTime(index, task._id)}
                                disabled={value.start_time}
                                className={`start-btn timeBTN ${
                                  value.start_time ? "disabled" : ""
                                }`}
                              >
                                Start
                              </button>

                              <input
                                type="text"
                                value={value.start_time || "Not started"}
                                readOnly
                                name="startTime"
                                className="totl-tim-inp"
                              />
                            </div>

                            <div className="btn-div">
                              <button
                                onClick={() => handleStopTask(value.id)}
                                className="stop-btn timeBTN "
                              >
                                Stop
                              </button>

                              <div>
                                <input
                                  type="text"
                                  value={value.stop_time || "Not Stop"}
                                  readOnly
                                  name="endTime"
                                  className="totl-tim-inp"
                                />
                              </div>
                            </div>

                            <div className="btn-div" style={{ border: "none" }}>
                              <input
                                type="text"
                                value={value.total_time || "Waiting..."}
                                readOnly
                                className="totl-tim-inp"
                              />
                              <h4 className="main-time-diff">
                                Time Difference:
                              </h4>
                            </div>
                          </div>
                        </li>
                      </React.Fragment>
                    ))}
                </>
              )}
            </ol>
          </div>
        </div>
      </div>

      {editPopup && (
        <>
          <div className="overlay"></div>
          <div className="edit-popup">
            <div className="hoursEditDiv">
              <label className="EditPoplabel">Name :</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="hoursInpEdit"
              />
            </div>
            <div className="hoursEditDiv">
              <label className="EditPoplabel">email :</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hoursInpEdit"
              />
            </div>
           

            <div className="hoursEditDiv">
              <label className="EditPoplabel">Profile Image :</label>
              
              <input
                type="file"
                accept="image/jpeg"
                onChange={handleFile1Change}
                className="hoursInpEdit fileInpEdit"
              />
            </div>

            <div className="actionpopButtons">
              <button onClick={handleSaveEdit} className="saveCancelBtn">
                Save
              </button>
              <button onClick={handleCancelEdit} className="saveCancelBtn">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Task;
