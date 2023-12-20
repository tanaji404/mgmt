import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/register.css";

const Input = ({ val, placeholder, type, name, value, onChange }) => {
  return (
    <div className="form__group2 field">
      <input
        type={type}
        className="form__field"
        placeholder={placeholder}
        required
        name={name}
        value={value}
        onChange={onChange}
      />
      <label htmlFor={name} className="form__label">
        {val}
      </label>
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();

  const [file1, setFile1] = useState(null);

  const [showRegistrationPopup, setShowRegistrationPopup] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [image, setImage] = useState(null);

  const handleFile1Change = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const handleClick = async (event) => {
    event.preventDefault();
  
    const { name, email, password, confirmPassword } = formData;

    const emailPattern = /@rptechnovelty\.com$/;
    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid @rptechnovelty.com email address.");
      return;
    }
  
    // Validate password strength
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character, and be at least 8 characters long."
      );
      return;
    }
  
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    try {
      // Create a new FormData object
      const formDataToSend = new FormData();
  
      // Append form data to the formDataToSend object
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
  
      // Append the "image" to the formDataToSend
      formDataToSend.append("image", image);
  
      // Send the formDataToSend to the server using axios.post
      const response = await axios.post(
        "http://localhost:3005/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Check if the response is successful (status code 2xx)
      if (response.status >= 200 && response.status < 300) {
        // Parse the response data
        const data = response.data;
  
        // Show success message and open OTP popup
        toast.success(data.message);
  
        // Redirect to the login page after a delay
        setTimeout(() => {
          window.location.assign("/login");
        }, 4000);
      } else {
        // Handle non-successful response (status code other than 2xx)
        const data = response.data;
        toast.error(data.error);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("An error occurred:", error.message);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };
  
  
  

  // const [user, setUser] = useState({
  //   name: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  // });

  // const handleChange = (e) => {
  //   const name = e.target.name;
  //   const value = e.target.value;
  //   setUser({ ...user, [name]: value });
  // };

  // const handleClick = async (e) => {
  //   e.preventDefault();

  //   const { name, email, password, confirmPassword } = user;

  //   const emailPattern = /@rptechnovelty\.com$/;
  //   if (!emailPattern.test(email)) {
  //     toast.error("Please enter a valid @rptechnovelty.com email address.");
  //     return;
  //   }

  //   // Validate password strength
  //   const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //   if (!passwordPattern.test(password)) {
  //     toast.error("Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character, and be at least 8 characters long.");
  //     return;
  //   }

  //   if (!name || !email || !password || !confirmPassword) {
  //     toast.error("Please fill in all required fields.");
  //     return;
  //   }

  //   // Send a request to the backend to initiate OTP generation and registration
  //   const response = await fetch("http://localhost:3005/register", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       name,
  //       email,
  //       password,
  //       confirmPassword,
  //     }),
  //   });

  //   const data = await response.json();

  //   if (response.status === 201) {
  //     // Show success message and open OTP popup
  //     toast.success(`The verification link is sent on your registered email address.`);
  //     // window.location.assign("/login");
  //     setTimeout(() => {
  //       // Redirect to the login page after the delay
  //       window.location.assign("/login");
  //     }, 4000);
  //   } else {
  //     // Display error message for failed registration
  //     toast.error(data.error);
  //   }
  // };

  return (
    <>
      {showRegistrationPopup && (
        <>
          <div className="register_container">
            <div className="register_box">
              <div className="register_left">
                <h2>Register</h2>
                <form method="POST" className="form_here">
                  <Input
                    type="text"
                    val="Name"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <Input
                    type="email"
                    val="Email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="profilePicDiv">
                  <label htmlFor="newsImage">Profile Pic</label>
                  <Input
                    type="file"
                    accept="image/jpeg"
                    onChange={handleFile1Change}
                    id="newsImage"
                    placeholder="Select Profile image"
                    className="up"
                    
                  />
                  </div>

                  <Input
                    type="password"
                    val="Password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <Input
                    type="password"
                    val="Confirm Password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />

                  <button onClick={handleClick} className="sub-button">
                    Submit
                  </button>
                </form>

                <div className="alreadyAcc">
                  <p className="P_already">Already have Account?</p>
                  <NavLink to="/login" className="login_Address">
                    Login
                  </NavLink>
                </div>
              </div>

              <ToastContainer />
            </div>
          </div>

          {/* <div className="register_container">
      <div className="register_box">
        <div className="register_left">
          <h2>Register</h2>
          <form method="POST" className="form_here">
            <Input
              type="text"
              val="Name"
              placeholder="Name"
              name="name"
              value={user.name}
              onChange={handleChange}
            />
            <Input
              type="email"
              val="Email"
              placeholder="Email"
              name="email"
              value={user.email}
              onChange={handleChange}
            />
                    
            <Input
              type="password"
              val="Password"
              placeholder="Password"
              name="password"
              value={user.password}
              onChange={handleChange}
            />
            <Input
              type="password"
              val="Confirm Password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
            />

            <button onClick={handleClick} className="sub-button">
              Submit
            </button>
          </form>

          <div className="alreadyAcc">
            <p className="P_already">Already have Account?</p>
            <NavLink to="/login" className="login_Address">
              Login
            </NavLink>
          </div>
        </div>

        <ToastContainer />

        </div>
         </div> */}
        </>
      )}
    </>
  );
};

export default Register;
