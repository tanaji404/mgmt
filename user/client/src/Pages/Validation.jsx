// Validation.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Validation = () => {
  const location = useLocation();
  const history = useHistory();
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(60);

  const handleOtpSubmit = async () => {
    // Validate OTP on the backend
    const response = await fetch("http://localhost:3005/validate-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Dummy", // Replace with actual name if needed
        email: location.state.email,
        enteredOtp: otp,
      }),
    });

    try {
      const data = await response.json();

      if (response.status === 200) {
        // Registration successful
        toast.success("User Registered Successfully");
        // Navigate to login page or perform other actions as needed
        history.push("/login");
      } else if (response.status === 400) {
        // Display error message for incorrect or expired OTP
        toast.error(data.error || "OTP has expired or is invalid");
      } else if (response.status === 500) {
        // Display error message for internal server error
        toast.error("Internal Server Error");
      } else {
        // Handle other response statuses as needed
        toast.error("An unexpected error occurred during OTP validation.");
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      toast.error("An unexpected error occurred during OTP validation.");
    }
  };

  const handleResendOtp = async () => {
    // Resend OTP on the backend
    const response = await fetch("http://localhost:3005/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Dummy", // Replace with actual name if needed
        email: location.state.email,
        password: "Dummy", // Replace with actual password if needed
        confirmPassword: "Dummy", // Replace with actual confirmPassword if needed
      }),
    });

    const data = await response.json();

    if (response.status === 201) {
      // Show success message and restart the countdown timer
      toast.success("OTP resent successfully");
      setOtpCountdown(60);
    } else {
      // Display error message for failed OTP resend
      toast.error(data.error);
    }
  };

  useEffect(() => {
    let countdownInterval;

    if (otpCountdown > 0) {
      countdownInterval = setInterval(() => {
        setOtpCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    // Clean up the interval on component unmount or when OTP page is closed
    return () => clearInterval(countdownInterval);
  }, [otpCountdown]);

  return (
    <div className="register_container">
      <div className="register_box">
        <div className="register_left">
          <h2>Enter OTP</h2>
          <p style={{ color: "blue", marginTop: "20px" }}>
            OTP sent to <span style={{ color: "red" }}>{location.state.email}</span> for verification
          </p>

          <form className="form_here">
            <input
              type="text"
              placeholder="Enter OTP"
              className="sub-button"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button onClick={handleOtpSubmit} className="sub-button">
              Submit
            </button>
          </form>

          <div className="alreadyAcc">
            {otpCountdown > 0 && (
              <p>{`Resend OTP in ${otpCountdown} seconds`}</p>
            )}
            {otpCountdown === 0 && (
              <h5 style={{ color: "blue" }} onClick={handleResendOtp}>
                Resend OTP
              </h5>
            )}
          </div>
        </div>

        <ToastContainer />
      </div>
    </div>
  );
};

export default Validation;
