import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const loginUser = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch("http://localhost:3005/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      // if (res.status === "Invalid Login Credentials") {
      //   return toast.error("Invalid Credentials");
      // }
  
      if (data.message === "Invalid Login Credentials") {
        return toast.error("Invalid Login Credentials");
      }
  
      if (data.message === "Account not verified. OTP sent for verification") {
        return toast.error("Account not verified. Please check your email for verification.");
      }
  
      if (data.is_verified === "Not Verified") {
        // Handle the case where the user is not verified
        return toast.error("Account not verified. Please check your email for verification.");
      }
  
      // Assuming data.is_verified is "Verified" here
      toast.success("Logged In Successfully.", {
        autoClose: 2000,
      });
  
      // Store userid in session storage
      sessionStorage.setItem("userid", data.userid);
  
      // Delay navigation after the toast is shown
      setTimeout(() => {
        navigate("/");
      }, 1800);
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred during login");
    }
  };
  



  return (
    <>
      <ToastContainer />
      <div className="login_container">
        <div className="login_box">
          <div className="login_right">
            <h1>User Login</h1>
            <form method="POST" className="login_formm">
              <div className="form__group field">
                <input
                  type="text"
                  className="form__field1"
                  placeholder="EnterEmail"
                  required
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  autoComplete="off"
                  
                />
               
              </div>
              <div
                className="form__group field"
                style={{ marginBottom: "20px" }}
              >
                <input
                  type="password"
                  className="form__field1"
                  placeholder="Enter Password"
                  required
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
               
              </div>
              <button onClick={loginUser} className="sub-button loginBtnMAin">
                Login
              </button>
              <div className="alreadyAcc">
                <p>Don't have an account?</p>
                <NavLink to="/registration" className="login_Address">
                  Register
                </NavLink>
                <br />
                <NavLink to="/forgotPassword" className="login_Address">
                  Forgot Password
                </NavLink>
              </div>
            
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
